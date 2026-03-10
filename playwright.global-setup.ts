import { runFinalE2ECleanup } from './e2e/support/api/final-cleanup';

const globalSetup = async (): Promise<void> => {
  await runFinalE2ECleanup();
};

export default globalSetup;
