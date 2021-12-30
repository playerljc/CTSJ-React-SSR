#!/usr/bin/env node

const build = require('../build.js');
const start = require('../start.js');
const commandArgs = require('../commandArgs.js');

commandArgs.initCommandArgs();

const contextconfig = commandArgs.getArg('contextconfig');
const config = commandArgs.getArg('config');
const port = commandArgs.getArg('port');

build({
  contextconfig,
  config,
}).then(() => {
  start({ type: 'dev', port });
});
