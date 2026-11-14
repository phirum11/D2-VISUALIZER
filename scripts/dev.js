#!/usr/bin/env node
const { spawn } = require('node:child_process')

// Ensure ELECTRON_RUN_AS_NODE is stripped so Electron launches in GUI desktop mode
const env = { ...process.env }
delete env.ELECTRON_RUN_AS_NODE

const child = spawn('npx', ['vite'], {
  stdio: 'inherit',
  shell: true,
  env,
})

child.on('exit', (code) => {
  process.exit(code ?? 0)
})

process.on('SIGINT', () => {
  try {
    child.kill('SIGINT')
  } catch {}
})
process.on('SIGTERM', () => {
  try {
    child.kill('SIGTERM')
  } catch {}
})
