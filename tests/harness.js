let passed = 0;
let failed = 0;
let currentSuite = '';

export function describe(name, fn) {
  currentSuite = name;
  fn();
}

export function it(name, fn) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`  ✗ ${name}`);
    console.error(`    ${err.message}`);
  }
}

export function assertEqual(actual, expected, msg) {
  if (actual !== expected) {
    throw new Error(
      (msg ? msg + ': ' : '') +
      `expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`
    );
  }
}

export function assertDeepEqual(actual, expected, msg) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(
      (msg ? msg + ': ' : '') +
      `expected ${e}, got ${a}`
    );
  }
}

export function summary() {
  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exit(1);
}
