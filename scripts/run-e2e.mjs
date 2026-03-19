import { spawn } from 'node:child_process';

const args = process.argv.slice(2);
const targetPattern = /(^e2e\/specs\/)|(\.spec\.[jt]s$)/;

const targetArgs = args.filter((value) => targetPattern.test(value));
const flagArgs = args.filter((value) => !targetPattern.test(value));

const isAuthTarget = (value) => value.includes('/auth/') || value.startsWith('e2e/specs/auth');

const authTargets = targetArgs.filter(isAuthTarget);
const appTargets = targetArgs.filter((value) => !isAuthTarget(value));

const runLane = async (lane, laneTargets) => {
  const laneArgs = [...flagArgs, ...laneTargets];

  await new Promise((resolve, reject) => {
    const child = spawn(
      'npx',
      ['playwright', 'test', ...laneArgs],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          PLAYWRIGHT_E2E_LANE: lane,
        },
        stdio: 'inherit',
        shell: process.platform === 'win32',
      },
    );

    child.on('exit', (code, signal) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Playwright ${lane} lane failed with ${signal ? `signal ${signal}` : `exit code ${code}`}.`,
        ),
      );
    });

    child.on('error', reject);
  });
};

const run = async () => {
  if (targetArgs.length === 0) {
    await runLane('auth', []);
    await runLane('app', []);
    return;
  }

  if (authTargets.length > 0) {
    await runLane('auth', authTargets);
  }

  if (appTargets.length > 0) {
    await runLane('app', appTargets);
  }
};

run().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
