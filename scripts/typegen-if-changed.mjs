/**
 * Runs `chakra typegen` only when theme source files are staged for commit.
 * Called from the Husky pre-commit hook.
 *
 * Exit codes:
 *   0 — typegen ran successfully, or was not needed
 *   1 — typegen failed
 */

import { execSync } from 'node:child_process';

const THEME_DIR = 'src/shared/config/theme/';

function getStagedFiles() {
  try {
    return execSync('git diff --cached --name-only', { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
  } catch {
    // Not inside a git repo or no staged files — skip
    return [];
  }
}

const staged = getStagedFiles();
const themeChanged = staged.some((f) => f.startsWith(THEME_DIR));

if (!themeChanged) process.exit(0);

const changed = staged.filter((f) => f.startsWith(THEME_DIR));
console.log(
  `[typegen] Theme files changed:\n  ${changed.join('\n  ')}\nRegenerating Chakra types...`,
);

try {
  execSync('npm run typegen', { stdio: 'inherit' });
  console.log('[typegen] Done.');
} catch {
  console.error('[typegen] chakra typegen failed — commit aborted.');
  process.exit(1);
}
