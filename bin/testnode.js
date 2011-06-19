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
var cwd = process.cwd();
var dirArg = process.ARGV[2];
var dir = dirArg;

if (!dirArg) {
  sys.puts("Usage: testnode TESTS_DIRECTORY");
  process.exit(0);
}

var dedup = function(array) {
  var newArray = [];
  var i;
  for(i=0; i<array.length; i++) {
    var value = array[i];
    if (newArray.indexOf(value) == -1) {
      newArray.push(value);
    }
  }
  return newArray;
};

dir = dir.charAt(0) == '/' ? dir : cwd + '/' + dir;
dir = (dir.charAt(dir.length-1)=='/') ? (dir + '**') : (dir + '/**');
glob.glob(dir + '/**.js', null, function(error, files){
  runner.run(dedup(files));
});