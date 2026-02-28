import { CodingProblem, ExecutionResult, TestCaseResult, CodingLanguage, TestCase } from './types';
import { deepEqual } from './deepEqual';
import { evaluateCodeWithGemini } from './geminiClient';

// ---------------------------------------------------------------------------
// Piston API config
// ---------------------------------------------------------------------------

const PISTON_CONFIG: Record<string, { language: string; version: string; fileName: string }> = {
  c:    { language: 'c',   version: '10.2.0',  fileName: 'main.c' },
  cpp:  { language: 'c++', version: '10.2.0',  fileName: 'main.cpp' },
  java: { language: 'java', version: '15.0.2', fileName: 'Main.java' },
};

interface PistonResponse {
  compile?: { stdout: string; stderr: string; code: number; signal: string | null; output: string };
  run: { stdout: string; stderr: string; code: number; signal: string | null; output: string };
}

const SENTINEL_START = '===PISTON_RESULT_START===';
const SENTINEL_END = '===PISTON_RESULT_END===';

// ---------------------------------------------------------------------------
// Shared utilities
// ---------------------------------------------------------------------------

/** Split comma-separated template/generic args respecting nested <> depth. */
function splitTemplateArgs(args: string): string[] {
  const result: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of args) {
    if (ch === '<') { depth++; current += ch; }
    else if (ch === '>') { depth--; current += ch; }
    else if (ch === ',' && depth === 0) { result.push(current.trim()); current = ''; }
    else { current += ch; }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

/** JSON-escape a string value (without outer quotes). */
function escapeJsonString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

/** Format a number for source code, ensuring doubles have a decimal point. */
function formatNum(n: number, forceDouble: boolean): string {
  if (!forceDouble && Number.isInteger(n)) return String(n);
  const s = String(n);
  return s.includes('.') || s.includes('e') || s.includes('E') ? s : s + '.0';
}

// ---------------------------------------------------------------------------
// C++ wrapper generation
// ---------------------------------------------------------------------------

function parseCppSignature(sig: string): { returnType: string; params: { type: string; name: string }[] } | null {
  const parenIdx = sig.indexOf('(');
  if (parenIdx === -1) return null;
  const closeIdx = sig.lastIndexOf(')');
  const beforeParen = sig.slice(0, parenIdx).trim();
  const paramStr = sig.slice(parenIdx + 1, closeIdx);

  // Last word of beforeParen is the function name, everything before is the return type
  const nameMatch = beforeParen.match(/(\w+)\s*$/);
  if (!nameMatch) return null;
  const returnType = beforeParen.slice(0, nameMatch.index!).trim();

  const params: { type: string; name: string }[] = [];
  if (paramStr.trim()) {
    for (const p of splitTemplateArgs(paramStr)) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/^(.+?)\s+(\w+)$/);
      if (m) params.push({ type: m[1].trim(), name: m[2] });
      else params.push({ type: trimmed, name: '' });
    }
  }
  return { returnType, params };
}

function jsonToCppLiteral(value: unknown, cppType: string): string {
  const t = cppType.trim().replace(/^const\s+/, '').replace(/&$/, '').trim();

  if (t === 'int' || t === 'long' || t === 'long long') return String(Math.round(value as number));
  if (t === 'double' || t === 'float') return formatNum(value as number, true);
  if (t === 'bool') return value ? 'true' : 'false';
  if (t === 'string') return `string("${escapeJsonString(String(value))}")`;
  if (t === 'char*' || t === 'const char*') return `"${escapeJsonString(String(value))}"`;

  // vector<T>
  const vecMatch = t.match(/^vector<(.+)>$/);
  if (vecMatch && Array.isArray(value)) {
    const inner = vecMatch[1].trim();
    const elems = (value as unknown[]).map(v => jsonToCppLiteral(v, inner));
    return `vector<${inner}>{${elems.join(', ')}}`;
  }

  // pair<A,B> — from JSON object (use values in property order)
  const pairMatch = t.match(/^pair<(.+)>$/);
  if (pairMatch && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const [aType, bType] = splitTemplateArgs(pairMatch[1]);
    const vals = Object.values(value as Record<string, unknown>);
    return `make_pair(${jsonToCppLiteral(vals[0], aType)}, ${jsonToCppLiteral(vals[1], bType)})`;
  }
  // pair from JSON array of 2
  if (pairMatch && Array.isArray(value) && value.length === 2) {
    const [aType, bType] = splitTemplateArgs(pairMatch[1]);
    return `make_pair(${jsonToCppLiteral(value[0], aType)}, ${jsonToCppLiteral(value[1], bType)})`;
  }

  // map<K,V>
  const mapMatch = t.match(/^map<(.+)>$/) || t.match(/^unordered_map<(.+)>$/);
  if (mapMatch && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const [kType, vType] = splitTemplateArgs(mapMatch[1]);
    const entries = Object.entries(value as Record<string, unknown>);
    const items = entries.map(([k, v]) => `{${jsonToCppLiteral(k, kType)}, ${jsonToCppLiteral(v, vType)}}`);
    return `${t}{${items.join(', ')}}`;
  }

  // Fallback: try as number or string
  if (typeof value === 'number') return formatNum(value, false);
  if (typeof value === 'string') return `string("${escapeJsonString(value)}")`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function generateCppWrapper(userCode: string, functionName: string, testCases: TestCase[], functionSignature: string): string {
  const parsed = parseCppSignature(functionSignature);
  if (!parsed) throw new Error(`Cannot parse C++ signature: ${functionSignature}`);

  const headers = new Set<string>();
  headers.add('#include <iostream>');
  headers.add('#include <string>');
  headers.add('#include <vector>');
  headers.add('#include <map>');
  headers.add('#include <sstream>');
  headers.add('#include <iomanip>');

  // Extract any #include from user code so we don't duplicate
  const userLines = userCode.split('\n');
  for (const line of userLines) {
    const inc = line.match(/^\s*#include\s+[<"].+[>"]/);
    if (inc) headers.add(inc[0].trim());
  }

  const testBlocks: string[] = [];
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const args = parsed.params.map((p, j) => jsonToCppLiteral(tc.input[j], p.type));
    testBlocks.push(`    {
        auto __r = ${functionName}(${args.join(', ')});
        cout << "${SENTINEL_START}" << endl;
        cout << __toJson(__r) << endl;
        cout << "${SENTINEL_END}" << endl;
    }`);
  }

  return `${[...headers].join('\n')}
using namespace std;

// === USER CODE ===
${userCode}
// === END USER CODE ===

// --- JSON output helpers ---
string __toJson(int v) { return to_string(v); }
string __toJson(long long v) { return to_string(v); }
string __toJson(double v) {
    ostringstream oss;
    oss << setprecision(15) << v;
    string s = oss.str();
    if (s.find('.') == string::npos && s.find('e') == string::npos) s += ".0";
    return s;
}
string __toJson(bool v) { return v ? "true" : "false"; }
string __toJson(const string& v) {
    string r = "\\"";
    for (char c : v) {
        if (c == '"') r += "\\\\\\"";
        else if (c == '\\\\') r += "\\\\\\\\";
        else if (c == '\\n') r += "\\\\n";
        else r += c;
    }
    return r + "\\"";
}
string __toJson(const char* v) { return v ? __toJson(string(v)) : "null"; }
template<typename T>
string __toJson(const vector<T>& v) {
    string r = "[";
    for (size_t i = 0; i < v.size(); i++) {
        if (i) r += ", ";
        r += __toJson(v[i]);
    }
    return r + "]";
}
template<typename A, typename B>
string __toJson(const pair<A,B>& p) {
    return "[" + __toJson(p.first) + ", " + __toJson(p.second) + "]";
}
template<typename K, typename V>
string __toJson(const map<K,V>& m) {
    string r = "{";
    bool first = true;
    for (auto& kv : m) {
        if (!first) r += ", ";
        first = false;
        r += __toJson(kv.first) + ": " + __toJson(kv.second);
    }
    return r + "}";
}

int main() {
${testBlocks.join('\n')}
    return 0;
}
`;
}

// ---------------------------------------------------------------------------
// Java wrapper generation
// ---------------------------------------------------------------------------

function parseJavaSignature(sig: string): { returnType: string; params: { type: string; name: string }[] } | null {
  // Strip "public static " prefix
  let s = sig.trim().replace(/^public\s+static\s+/, '');

  const parenIdx = s.indexOf('(');
  if (parenIdx === -1) return null;
  const closeIdx = s.lastIndexOf(')');
  const beforeParen = s.slice(0, parenIdx).trim();
  const paramStr = s.slice(parenIdx + 1, closeIdx);

  const nameMatch = beforeParen.match(/(\w+)\s*$/);
  if (!nameMatch) return null;
  const returnType = beforeParen.slice(0, nameMatch.index!).trim();

  const params: { type: string; name: string }[] = [];
  if (paramStr.trim()) {
    for (const p of splitTemplateArgs(paramStr)) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      const m = trimmed.match(/^(.+?)\s+(\w+)$/);
      if (m) params.push({ type: m[1].trim(), name: m[2] });
      else params.push({ type: trimmed, name: '' });
    }
  }
  return { returnType, params };
}

function jsonToJavaLiteral(value: unknown, javaType: string): string {
  const t = javaType.trim();

  if (t === 'int') return String(Math.round(value as number));
  if (t === 'long') return String(Math.round(value as number)) + 'L';
  if (t === 'double') return formatNum(value as number, true);
  if (t === 'float') return formatNum(value as number, true) + 'f';
  if (t === 'boolean') return value ? 'true' : 'false';
  if (t === 'String') return `"${escapeJsonString(String(value))}"`;

  // int[]
  if (t === 'int[]' && Array.isArray(value)) {
    return `new int[]{${(value as number[]).map(v => String(Math.round(v))).join(', ')}}`;
  }
  // double[]
  if (t === 'double[]' && Array.isArray(value)) {
    return `new double[]{${(value as number[]).map(v => formatNum(v, true)).join(', ')}}`;
  }
  // String[]
  if (t === 'String[]' && Array.isArray(value)) {
    return `new String[]{${(value as string[]).map(v => `"${escapeJsonString(String(v))}"`).join(', ')}}`;
  }
  // String[][]
  if (t === 'String[][]' && Array.isArray(value)) {
    const rows = (value as unknown[][]).map(row => {
      if (Array.isArray(row)) {
        return `new String[]{${row.map(v => `"${escapeJsonString(String(v))}"`).join(', ')}}`;
      }
      return `new String[]{}`;
    });
    return `new String[][]{${rows.join(', ')}}`;
  }

  // List<T>
  const listMatch = t.match(/^List<(.+)>$/);
  if (listMatch && Array.isArray(value)) {
    const inner = listMatch[1].trim();
    const elems = (value as unknown[]).map(v => jsonToJavaLiteral(v, inner));
    return `new ArrayList<>(Arrays.asList(${elems.join(', ')}))`;
  }

  // Map<K,V> from JSON object
  const mapMatch = t.match(/^Map<(.+)>$/);
  if (mapMatch && typeof value === 'object' && value !== null && !Array.isArray(value)) {
    const [kType, vType] = splitTemplateArgs(mapMatch[1]);
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length <= 10) {
      const args = entries.flatMap(([k, v]) => [jsonToJavaLiteral(k, kType), jsonToJavaLiteral(v, vType)]);
      return `Map.of(${args.join(', ')})`;
    }
    // For > 10 entries, use HashMap with put calls (shouldn't happen in test inputs)
    const puts = entries.map(([k, v]) => `put(${jsonToJavaLiteral(k, kType)}, ${jsonToJavaLiteral(v, vType)});`);
    return `new java.util.HashMap<>() {{ ${puts.join(' ')} }}`;
  }

  // Boxed types in generic contexts
  if (t === 'Integer') return String(Math.round(value as number));
  if (t === 'Double') return formatNum(value as number, true);
  if (t === 'Boolean') return value ? 'true' : 'false';
  if (t === 'Object') {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? String(value) : formatNum(value, true);
    }
    if (typeof value === 'string') return `"${escapeJsonString(value)}"`;
    if (typeof value === 'boolean') return value ? 'true' : 'false';
  }

  // Fallback
  if (typeof value === 'number') return formatNum(value, false);
  if (typeof value === 'string') return `"${escapeJsonString(value)}"`;
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  return String(value);
}

function generateJavaWrapper(userCode: string, functionName: string, testCases: TestCase[], functionSignature: string): string {
  const parsed = parseJavaSignature(functionSignature);
  if (!parsed) throw new Error(`Cannot parse Java signature: ${functionSignature}`);

  // Extract imports from user code
  const userLines = userCode.split('\n');
  const imports: string[] = [];
  const bodyLines: string[] = [];
  for (const line of userLines) {
    if (line.trimStart().startsWith('import ')) imports.push(line);
    else bodyLines.push(line);
  }

  // Always include these
  const allImports = new Set(imports);
  allImports.add('import java.util.*;');

  const testBlocks: string[] = [];
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const args = parsed.params.map((p, j) => jsonToJavaLiteral(tc.input[j], p.type));
    testBlocks.push(`            {
                var __r = ${functionName}(${args.join(', ')});
                System.out.println("${SENTINEL_START}");
                System.out.println(__toJson(__r));
                System.out.println("${SENTINEL_END}");
            }`);
  }

  return `${[...allImports].join('\n')}

public class Main {
    // === USER CODE ===
    ${bodyLines.join('\n    ')}
    // === END USER CODE ===

    // --- JSON output helpers ---
    static String __toJson(int v) { return String.valueOf(v); }
    static String __toJson(long v) { return String.valueOf(v); }
    static String __toJson(double v) {
        if (v == Math.floor(v) && !Double.isInfinite(v)) {
            return String.valueOf((long) v) + ".0";
        }
        return String.valueOf(v);
    }
    static String __toJson(boolean v) { return v ? "true" : "false"; }
    static String __toJson(String v) {
        if (v == null) return "null";
        StringBuilder sb = new StringBuilder("\\"");
        for (char c : v.toCharArray()) {
            if (c == '"') sb.append("\\\\\\"");
            else if (c == '\\\\') sb.append("\\\\\\\\");
            else if (c == '\\n') sb.append("\\\\n");
            else sb.append(c);
        }
        return sb.append("\\"").toString();
    }
    static String __toJson(int[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(v[i]);
        }
        return sb.append("]").toString();
    }
    static String __toJson(double[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(__toJson(v[i]));
        }
        return sb.append("]").toString();
    }
    static String __toJson(String[] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(__toJson(v[i]));
        }
        return sb.append("]").toString();
    }
    static String __toJson(String[][] v) {
        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < v.length; i++) {
            if (i > 0) sb.append(", ");
            sb.append(__toJson(v[i]));
        }
        return sb.append("]").toString();
    }
    @SuppressWarnings("unchecked")
    static String __toJson(Object v) {
        if (v == null) return "null";
        if (v instanceof Integer) return __toJson(((Integer) v).intValue());
        if (v instanceof Long) return __toJson(((Long) v).longValue());
        if (v instanceof Double) return __toJson(((Double) v).doubleValue());
        if (v instanceof Boolean) return __toJson(((Boolean) v).booleanValue());
        if (v instanceof String) return __toJson((String) v);
        if (v instanceof int[]) return __toJson((int[]) v);
        if (v instanceof double[]) return __toJson((double[]) v);
        if (v instanceof String[]) return __toJson((String[]) v);
        if (v instanceof String[][]) return __toJson((String[][]) v);
        if (v instanceof List) {
            List<?> list = (List<?>) v;
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < list.size(); i++) {
                if (i > 0) sb.append(", ");
                sb.append(__toJson(list.get(i)));
            }
            return sb.append("]").toString();
        }
        if (v instanceof Map) {
            Map<?,?> map = (Map<?,?>) v;
            StringBuilder sb = new StringBuilder("{");
            boolean first = true;
            for (Map.Entry<?,?> e : map.entrySet()) {
                if (!first) sb.append(", ");
                first = false;
                sb.append(__toJson(e.getKey())).append(": ").append(__toJson(e.getValue()));
            }
            return sb.append("}").toString();
        }
        return __toJson(v.toString());
    }

    public static void main(String[] args) {
        try {
${testBlocks.join('\n')}
        } catch (Exception e) {
            System.err.println(e.getMessage());
        }
    }
}
`;
}

// ---------------------------------------------------------------------------
// C wrapper generation
// ---------------------------------------------------------------------------

function parseCSignature(sig: string): { returnType: string; params: { type: string; name: string }[] } | null {
  if (sig === '/* See description */') return null;

  const parenIdx = sig.indexOf('(');
  if (parenIdx === -1) return null;
  const closeIdx = sig.lastIndexOf(')');
  const beforeParen = sig.slice(0, parenIdx).trim();
  const paramStr = sig.slice(parenIdx + 1, closeIdx);

  // For C, return type + function name. Last word is the name.
  // Handle pointer return types: "char* functionName" → returnType="char*", name="functionName"
  const nameMatch = beforeParen.match(/(\w+)\s*$/);
  if (!nameMatch) return null;
  const returnType = beforeParen.slice(0, nameMatch.index!).trim();

  const params: { type: string; name: string }[] = [];
  if (paramStr.trim()) {
    for (const p of paramStr.split(',')) {
      const trimmed = p.trim();
      if (!trimmed) continue;
      // Match patterns like: "const char* word", "int n", "char** potions", "double* lengths"
      const m = trimmed.match(/^(.+?)\s+(\w+)$/);
      if (m) {
        // Reassemble pointer stars: "char *" → "char*", "const char *" → "const char*"
        let type = m[1].trim();
        let name = m[2];
        // Handle "char * *name" style
        while (name.startsWith('*')) {
          type += '*';
          name = name.slice(1);
        }
        params.push({ type, name });
      } else {
        params.push({ type: trimmed, name: '' });
      }
    }
  }
  return { returnType, params };
}

function generateCWrapper(userCode: string, functionName: string, testCases: TestCase[], functionSignature: string): string {
  const parsed = parseCSignature(functionSignature);
  if (!parsed) throw new Error(`Cannot parse C signature: ${functionSignature}`);

  const headers = new Set<string>();
  headers.add('#include <stdio.h>');
  headers.add('#include <stdlib.h>');
  headers.add('#include <string.h>');

  // Extract includes from user code
  const userLines = userCode.split('\n');
  for (const line of userLines) {
    const inc = line.match(/^\s*#include\s+[<"].+[>"]/);
    if (inc) headers.add(inc[0].trim());
  }

  const isVoid = parsed.returnType === 'void';

  // Detect output parameter pattern: void return + last param is a pointer named "out" or similar
  let outputParam: { type: string; name: string; baseType: string; size: number } | null = null;
  if (isVoid && parsed.params.length > 0) {
    const lastP = parsed.params[parsed.params.length - 1];
    if (lastP.type.includes('*') && (lastP.name === 'out' || lastP.name === 'result' || lastP.name === 'output')) {
      const baseType = lastP.type.replace('*', '').trim();
      // Infer output size from first test case expected output
      const expected = testCases[0]?.expectedOutput;
      const size = Array.isArray(expected) ? expected.length : 1;
      outputParam = { type: lastP.type, name: lastP.name, baseType, size };
    }
  }

  if (isVoid && !outputParam) {
    throw new Error(`Cannot wrap void C function without detectable output parameter: ${functionSignature}`);
  }

  const testBlocks: string[] = [];
  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const lines: string[] = [];
    const args: string[] = [];
    let inputIdx = 0;

    const paramsToProcess = outputParam ? parsed.params.slice(0, -1) : parsed.params;

    for (let j = 0; j < paramsToProcess.length; j++) {
      const p = paramsToProcess[j];

      // Check if this is an array parameter (pointer type followed by int length)
      const isPointer = p.type.includes('*');
      const nextParam = paramsToProcess[j + 1];
      const nextIsLength = nextParam && (nextParam.type === 'int' || nextParam.type === 'size_t');

      if (isPointer && nextIsLength && Array.isArray(tc.input[inputIdx])) {
        const arr = tc.input[inputIdx] as unknown[];
        const varName = `__arr_${i}_${j}`;
        const baseType = p.type.replace(/\*+/, '').replace('const ', '').trim();

        if (baseType === 'char') {
          // char** — array of strings
          lines.push(`        char* ${varName}[] = {${arr.map(v => `"${escapeJsonString(String(v))}"`).join(', ')}};`);
        } else if (baseType === 'double') {
          lines.push(`        double ${varName}[] = {${arr.map(v => formatNum(v as number, true)).join(', ')}};`);
        } else if (baseType === 'int') {
          lines.push(`        int ${varName}[] = {${arr.map(v => String(Math.round(v as number))).join(', ')}};`);
        } else {
          lines.push(`        ${baseType} ${varName}[] = {${arr.map(v => String(v)).join(', ')}};`);
        }

        args.push(varName);
        args.push(String(arr.length)); // length param
        j++; // skip the length parameter
        inputIdx++;
      } else if (isPointer && p.type.includes('char')) {
        // Single string: const char* or char*
        args.push(`"${escapeJsonString(String(tc.input[inputIdx]))}"`);
        inputIdx++;
      } else {
        // Scalar value
        const val = tc.input[inputIdx];
        if (p.type === 'int' || p.type === 'long') args.push(String(Math.round(val as number)));
        else if (p.type === 'double' || p.type === 'float') args.push(formatNum(val as number, true));
        else args.push(String(val));
        inputIdx++;
      }
    }

    // Output param buffer
    if (outputParam) {
      const expectedSize = Array.isArray(tc.expectedOutput) ? (tc.expectedOutput as unknown[]).length : outputParam.size;
      lines.push(`        ${outputParam.baseType} __out_${i}[${expectedSize}];`);
      args.push(`__out_${i}`);
    }

    // Function call + print result
    if (isVoid && outputParam) {
      lines.push(`        ${functionName}(${args.join(', ')});`);
      lines.push(`        printf("${SENTINEL_START}\\n");`);
      const expectedSize = Array.isArray(tc.expectedOutput) ? (tc.expectedOutput as unknown[]).length : outputParam.size;
      if (outputParam.baseType === 'int') {
        lines.push(`        printf("[");`);
        lines.push(`        for (int __k = 0; __k < ${expectedSize}; __k++) { if (__k) printf(", "); printf("%d", __out_${i}[__k]); }`);
        lines.push(`        printf("]\\n");`);
      } else if (outputParam.baseType === 'double') {
        lines.push(`        printf("[");`);
        lines.push(`        for (int __k = 0; __k < ${expectedSize}; __k++) { if (__k) printf(", "); printf("%.15g", __out_${i}[__k]); }`);
        lines.push(`        printf("]\\n");`);
      }
      lines.push(`        printf("${SENTINEL_END}\\n");`);
    } else {
      const retType = parsed.returnType;
      lines.push(`        ${retType} __r_${i} = ${functionName}(${args.join(', ')});`);
      lines.push(`        printf("${SENTINEL_START}\\n");`);
      if (retType === 'int' || retType === 'long') {
        lines.push(`        printf("%d\\n", __r_${i});`);
      } else if (retType === 'double' || retType === 'float') {
        lines.push(`        printf("%.15g\\n", __r_${i});`);
      } else if (retType.includes('char*')) {
        // String return — print as JSON string
        lines.push(`        if (__r_${i}) {`);
        lines.push(`            printf("\\"");`);
        lines.push(`            for (const char* __p = __r_${i}; *__p; __p++) {`);
        lines.push(`                if (*__p == '"') printf("\\\\\\"");`);
        lines.push(`                else if (*__p == '\\\\') printf("\\\\\\\\");`);
        lines.push(`                else if (*__p == '\\n') printf("\\\\n");`);
        lines.push(`                else putchar(*__p);`);
        lines.push(`            }`);
        lines.push(`            printf("\\"\\n");`);
        lines.push(`        } else printf("null\\n");`);
      } else {
        lines.push(`        printf("%d\\n", __r_${i});`);
      }
      lines.push(`        printf("${SENTINEL_END}\\n");`);
    }

    testBlocks.push(`    {\n${lines.join('\n')}\n    }`);
  }

  return `${[...headers].join('\n')}

// === USER CODE ===
${userCode}
// === END USER CODE ===

int main() {
${testBlocks.join('\n')}
    return 0;
}
`;
}

// ---------------------------------------------------------------------------
// LLM fallback for unsupported C signatures
// ---------------------------------------------------------------------------

async function executeFallbackLLM(
  userCode: string, problem: CodingProblem, language: CodingLanguage, tests: TestCase[],
): Promise<ExecutionResult> {
  try {
    const evalResult = await evaluateCodeWithGemini(userCode, problem, language);
    return {
      passed: evalResult.passed,
      totalTests: evalResult.results.length,
      passedTests: evalResult.results.filter((r: { passed: boolean }) => r.passed).length,
      results: evalResult.results,
    };
  } catch (error) {
    return {
      passed: false, totalTests: tests.length, passedTests: 0, results: [],
      error: `Evaluation error: ${error}`,
    };
  }
}

// ---------------------------------------------------------------------------
// Main entry point
// ---------------------------------------------------------------------------

export async function executePiston(
  userCode: string,
  problem: CodingProblem,
  language: CodingLanguage,
): Promise<ExecutionResult> {
  const tests = [...problem.testCases, ...(problem.hiddenTestCases || [])];
  const config = PISTON_CONFIG[language];
  if (!config) {
    return { passed: false, totalTests: tests.length, passedTests: 0, results: [], error: `Unsupported language: ${language}` };
  }

  // For C with complex void signatures that we can't wrap, fall back to LLM
  if (language === 'c' && (problem.functionSignature === '/* See description */' || !parseCSignature(problem.functionSignature))) {
    return executeFallbackLLM(userCode, problem, language, tests);
  }

  let fullCode: string;
  try {
    if (language === 'cpp') {
      fullCode = generateCppWrapper(userCode, problem.functionName, tests, problem.functionSignature);
    } else if (language === 'java') {
      fullCode = generateJavaWrapper(userCode, problem.functionName, tests, problem.functionSignature);
    } else {
      fullCode = generateCWrapper(userCode, problem.functionName, tests, problem.functionSignature);
    }
  } catch (err) {
    // If wrapper generation fails (e.g. void C function), fall back to LLM
    if (language === 'c') {
      return executeFallbackLLM(userCode, problem, language, tests);
    }
    return { passed: false, totalTests: tests.length, passedTests: 0, results: [], error: `Code wrapper error: ${err}` };
  }

  // Call Piston API
  let pistonResp: PistonResponse;
  try {
    const resp = await fetch('/api/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: config.language,
        version: config.version,
        files: [{ name: config.fileName, content: fullCode }],
        compile_timeout: 10000,
        run_timeout: 5000,
      }),
    });
    if (!resp.ok) throw new Error(`Piston HTTP ${resp.status}`);
    pistonResp = await resp.json();
  } catch (err) {
    // Piston API unavailable (public API is whitelist-only since 2/15/2026) — fall back to LLM evaluation
    console.warn(`Piston API unavailable (${err}), falling back to LLM evaluation`);
    return executeFallbackLLM(userCode, problem, language, tests);
  }

  // Check compilation errors
  if (pistonResp.compile && pistonResp.compile.code !== 0) {
    const stderr = pistonResp.compile.stderr || pistonResp.compile.output || '';
    return { passed: false, totalTests: tests.length, passedTests: 0, results: [], error: `Compilation error:\n${stderr.slice(0, 500)}` };
  }

  // Parse stdout for sentinel-delimited results
  const stdout = pistonResp.run.stdout || '';
  const stderr = pistonResp.run.stderr || '';

  const resultBlocks: string[] = [];
  const re = new RegExp(`${SENTINEL_START}\\n([\\s\\S]*?)${SENTINEL_END}`, 'g');
  let match;
  while ((match = re.exec(stdout)) !== null) {
    resultBlocks.push(match[1].trim());
  }

  const results: TestCaseResult[] = [];
  for (let i = 0; i < tests.length; i++) {
    const tc = tests[i];
    if (i < resultBlocks.length) {
      try {
        const actual = JSON.parse(resultBlocks[i]);
        const passed = deepEqual(actual, tc.expectedOutput);
        results.push({ input: tc.input, expected: tc.expectedOutput, actual, passed });
      } catch {
        // Try comparing as raw string if JSON parse fails
        results.push({ input: tc.input, expected: tc.expectedOutput, actual: resultBlocks[i], passed: false, error: 'Could not parse output' });
      }
    } else {
      const errMsg = stderr
        ? stderr.slice(0, 200)
        : pistonResp.run.signal
          ? `Signal: ${pistonResp.run.signal}`
          : 'No output produced';
      results.push({ input: tc.input, expected: tc.expectedOutput, actual: null, passed: false, error: errMsg });
    }
  }

  const passedCount = results.filter(r => r.passed).length;
  return {
    passed: passedCount === tests.length,
    totalTests: tests.length,
    passedTests: passedCount,
    results,
    error: (pistonResp.run.code !== 0 && passedCount < tests.length)
      ? `Runtime error (exit ${pistonResp.run.code})${stderr ? ': ' + stderr.slice(0, 200) : ''}`
      : undefined,
  };
}
