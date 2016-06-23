#!/usr/bin/env node

const execSync = require('child_process').execSync;

const secret = require('./secret');

const fullHost = `${secret.username}@${secret.host}`;
const sshCmd = `ssh ${fullHost} "mkdir -p ${secret.path}"`;
const scpCmd = `scp -r build/* ${fullHost}:${secret.path}`;

execSync(sshCmd, {
  stdio: 'inherit',
});

execSync(scpCmd, {
  stdio: 'inherit',
});
