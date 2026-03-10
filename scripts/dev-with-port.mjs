import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';

try {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');
  if (fs.existsSync(envLocalPath)) {
    const { config } = await import('dotenv');
    config({ path: envLocalPath });
  }
} catch {}

const port = process.env.PORT || '4000';

const nextBin =
  process.platform === 'win32'
    ? path.resolve('node_modules', '.bin', 'next.cmd')
    : path.resolve('node_modules', '.bin', 'next');

const child = spawn(nextBin, ['dev', '-p', port], {
  stdio: 'inherit',
  env: process.env,
});

child.on('exit', (code) => process.exit(code ?? 0));
