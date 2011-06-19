#!/usr/bin/env node
/*
 * Suite runner.
 *
 * Run each test file in a directory one by one.
 *
 * To be called like:
 *
 *     testnode TESTS_DIRECTORY
 *
 * The first argument must be a directory. It only looks at the first
 * argument - ie. it does not support shell globbing.
 *
 */
var sys = require('sys');
var glob = require('glob');
var runner = require('../runner');
var dirArg = process.ARGV[2];
var dir;

if (!dirArg) {
  sys.puts("Usage: testnode TESTS_DIRECTORY");
  process.exit(0);
}

dir = (dirArg.charAt(dirArg.length-1)=='/') ? (dirArg + '**') : (dirArg + '/**');
glob.glob(dir + '/**', null, function(error, files){
  runner.run(files);
});