import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const [mode, ...args] = process.argv.slice(2);
const env = { ...process.env };
if (mode === 'esp') {
  env.NEXT_PUBLIC_APP_PLATFORM = 'esp';
  env.NEXT_STATIC_EXPORT = '1';
}
if (mode === 'static') env.NEXT_STATIC_EXPORT = '1';
const child = spawn(process.execPath, [require.resolve('next/dist/bin/next'), ...args], { stdio: 'inherit', env });
child.on('exit', (code) => {
  process.exitCode = code ?? 1;
});
child.on('error', (error) => {
  console.error(error);
  process.exitCode = 1;
});
