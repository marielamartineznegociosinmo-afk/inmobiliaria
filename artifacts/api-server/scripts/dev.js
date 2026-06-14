#!/usr/bin/env node
const { spawn } = require('child_process');

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

function run(cmd, args, opts = {}) {
  const p = spawn(cmd, args, { stdio: 'inherit', shell: true, ...opts });
  return new Promise((resolve, reject) => {
    p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`))));
    p.on('error', reject);
  });
}

(async () => {
  try {
    await run('pnpm', ['run', 'build'], { cwd: __dirname + '/..' });
    await run('pnpm', ['run', 'start'], { cwd: __dirname + '/..' });
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
