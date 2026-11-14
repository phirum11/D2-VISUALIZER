#!/usr/bin/env node
const { spawn } = require('node:child_process')

const env = { ...process.env, TEST_PHASE10: '1' }
delete env.ELECTRON_RUN_AS_NODE

const electronBinary = require('electron')
console.log('[TEST RUNNER] Launching Electron GUI mode with binary:', electronBinary)

const child = spawn(electronBinary, ['.', '--no-sandbox'], {
  stdio: 'inherit',
  shell: false,
  env,
})

child.on('exit', (code) => {
  console.log('[TEST RUNNER] Electron exited with code:', code)
  process.exit(code ?? 0)
})

process.on('SIGINT', () => {
  try {
    child.kill('SIGINT')
  } catch {}
})
