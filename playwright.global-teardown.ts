import { runFinalE2ECleanup } from './e2e/support/api/final-cleanup';

const globalTeardown = async (): Promise<void> => {
  await runFinalE2ECleanup();
};

export default globalTeardown;
