const PISTON_API = "https://emkc.org/api/v2/piston/execute";

/**
 * Builds a self-contained Node.js script that runs the user's code against
 * every test case and prints a JSON array of results to stdout.
 */
function buildTestScript(userCode, functionName, tests) {
  const testsJson = JSON.stringify(
    tests.map((t) => ({
      input: t.input,
      expected: t.expected,
      description: t.description,
    }))
  );

  return `
${userCode}

const __tests = ${testsJson};

// Compares values for equality using JSON serialization.
// All challenge test cases use only primitives and flat arrays, so this is sufficient.
function __deepEqual(a, b) {
  return JSON.stringify(a) === JSON.stringify(b);
}

const __results = __tests.map(function(test) {
  try {
    const result = ${functionName}.apply(null, test.input);
    return {
      passed: __deepEqual(result, test.expected),
      got: result,
      description: test.description
    };
  } catch (err) {
    return {
      passed: false,
      got: "Error: " + err.message,
      description: test.description
    };
  }
});

process.stdout.write(JSON.stringify(__results) + "\\n");
`.trim();
}

/**
 * Runs user code against the challenge test cases via the Piston API.
 *
 * @returns {Promise<Array<{description: string, passed: boolean, got: unknown}>>}
 * @throws {Error} if the Piston API request fails or returns an unexpected response
 */
export async function runWithPiston(userCode, functionName, tests) {
  const script = buildTestScript(userCode, functionName, tests);

  let response;
  try {
    response = await fetch(PISTON_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        language: "javascript",
        version: "*",
        files: [{ content: script }],
      }),
    });
  } catch (networkErr) {
    throw new Error(
      `Could not reach the Piston code execution API. Check your internet connection and try again. (${networkErr.message})`
    );
  }

  if (!response.ok) {
    throw new Error(
      `Piston API returned an error (HTTP ${response.status}). Please try again.`
    );
  }

  const data = await response.json();

  // Piston puts compilation errors in compile.stderr and runtime output in run
  const stderr = (data.run?.stderr || "").trim();
  const stdout = (data.run?.stdout || "").trim();

  if (!stdout) {
    const errorDetail = stderr || "No output was produced.";
    throw new Error(`Code execution failed:\n${errorDetail}`);
  }

  let results;
  try {
    results = JSON.parse(stdout);
  } catch {
    throw new Error(
      `Unexpected output from code execution:\n${stdout}${stderr ? "\n" + stderr : ""}`
    );
  }

  return results;
}
