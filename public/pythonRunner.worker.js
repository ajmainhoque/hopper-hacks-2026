/* eslint-disable no-var, no-restricted-globals */
/**
 * Web Worker that executes Python code locally via Pyodide (CPython compiled to WebAssembly).
 * Loaded as a classic (non-module) worker so importScripts works.
 */

var PYODIDE_CDN = 'https://cdn.jsdelivr.net/pyodide/v0.27.1/full/';
var pyodide = null;
var initPromise = null;

function initPyodide() {
  if (initPromise) return initPromise;
  initPromise = new Promise(function (resolve, reject) {
    try {
      importScripts(PYODIDE_CDN + 'pyodide.js');
    } catch (err) {
      reject(new Error('Failed to load Pyodide from CDN: ' + err));
      return;
    }
    // loadPyodide is now available globally
    loadPyodide({ indexURL: PYODIDE_CDN })
      .then(function (py) {
        pyodide = py;
        resolve(py);
      })
      .catch(reject);
  });
  return initPromise;
}

function deepEqual(a, b) {
  if (a === b) return true;
  // Treat undefined and null as equivalent
  if ((a === undefined || a === null) && (b === undefined || b === null)) return true;
  if (a == null || b == null) return false;
  // Numeric comparison with epsilon (also handles bool-number coercion: true==1, false==0)
  var na = typeof a === 'boolean' ? (a ? 1 : 0) : typeof a === 'number' ? a : NaN;
  var nb = typeof b === 'boolean' ? (b ? 1 : 0) : typeof b === 'number' ? b : NaN;
  if (!isNaN(na) && !isNaN(nb)) {
    return Math.abs(na - nb) < 1e-9;
  }
  // String-to-number leniency: "3" == 3, etc.
  if ((typeof a === 'string' && typeof b === 'number') || (typeof a === 'number' && typeof b === 'string')) {
    var sn = typeof a === 'string' ? Number(a) : Number(b);
    var nn = typeof a === 'number' ? a : b;
    if (!isNaN(sn)) return Math.abs(sn - nn) < 1e-9;
  }
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every(function (v, i) { return deepEqual(v, b[i]); });
  }
  if (typeof a === 'object' && typeof b === 'object') {
    var ak = Object.keys(a).sort();
    var bk = Object.keys(b).sort();
    if (ak.length !== bk.length) return false;
    return ak.every(function (k, i) { return k === bk[i] && deepEqual(a[k], b[k]); });
  }
  return false;
}

self.onmessage = async function (e) {
  var d = e.data;

  // Pre-load / warm-up message
  if (d.type === 'init') {
    try {
      await initPyodide();
      self.postMessage({ type: 'ready' });
    } catch (err) {
      self.postMessage({ type: 'error', error: String(err) });
    }
    return;
  }

  var userCode = d.userCode;
  var functionName = d.functionName;
  var testCases = d.testCases;
  var requestId = d.requestId;
  var results = [];

  try {
    var py = await initPyodide();

    // Clean user-defined globals from previous runs, preserving builtins
    py.runPython(
      'for __k__ in list(globals().keys()):\n' +
      '    if not __k__.startswith("_"):\n' +
      '        try:\n' +
      '            del globals()[__k__]\n' +
      '        except Exception:\n' +
      '            pass\n'
    );

    // Define the user's function(s)
    py.runPython(userCode);

    for (var i = 0; i < testCases.length; i++) {
      var tc = testCases[i];
      try {
        // Pass inputs via Pyodide globals to avoid string escaping issues
        py.globals.set('__inputs_json__', JSON.stringify(tc.input));
        py.globals.set('__func_name__', functionName);

        py.runPython(
          'import json as __json__\n' +
          '__inputs__ = __json__.loads(__inputs_json__)\n' +
          '__fn__ = globals().get(__func_name__)\n' +
          'if __fn__ is None:\n' +
          '    raise NameError("Function \'" + __func_name__ + "\' not found. Did you rename it?")\n' +
          '__result__ = __fn__(*__inputs__)\n' +
          'if isinstance(__result__, (list, dict, tuple, set, int, float, str, bool, type(None))):\n' +
          '    __result_json__ = __json__.dumps(__result__)\n' +
          'else:\n' +
          '    __result_json__ = __json__.dumps(str(__result__))\n'
        );

        var rj = py.globals.get('__result_json__');
        var actual = JSON.parse(rj);
        var passed = deepEqual(actual, tc.expectedOutput);
        results.push({ input: tc.input, expected: tc.expectedOutput, actual: actual, passed: passed });
      } catch (err) {
        var errStr = String(err);
        // Extract the last meaningful line from the Python traceback
        var lines = errStr.split('\n').filter(function (l) { return l.trim(); });
        var shortErr = lines[lines.length - 1] || errStr;
        results.push({
          input: tc.input,
          expected: tc.expectedOutput,
          actual: null,
          passed: false,
          error: shortErr
        });
      }
    }
  } catch (err) {
    self.postMessage({
      requestId: requestId,
      passed: false,
      totalTests: testCases.length,
      passedTests: 0,
      results: [],
      error: 'Python error: ' + String(err)
    });
    return;
  }

  var pc = results.filter(function (r) { return r.passed; }).length;
  self.postMessage({
    requestId: requestId,
    passed: pc === results.length,
    totalTests: results.length,
    passedTests: pc,
    results: results
  });
};
