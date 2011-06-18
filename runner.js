/*
 * Suite runner.
 * To be called like
 *     node runner.js TESTS_DIRECTORY
 *
 * This currently very basic, and largely inadequate.
 * It simply runs each test file one by one.
 * It will need to:
 *   + agregate contexts together when they are spread over multiple files.
 *   + report on the results of running the test files
 *   - including exiting with non-zero whenever any test fails
 */
var test = require('./testnode')();
var sys = require('sys');
var glob = require('glob');
var control = new (require('events').EventEmitter);
test.onFailureExitNonZero();
test.suiteMode();

var dir = process.ARGV[2];
if (!dir) {
  sys.puts("Usage: node runner.js TESTS_DIRECTORY");
  process.exit(0);
}
var files;

var getFiles = function() {
  dir = (dir.charAt(dir.length-1)=='/') ? (dir + '**') : (dir + '/**');
  glob.glob(dir + '/**', null, function(error, matches){
    files = matches;
    control.emit('getFilesDone');
  });
};

control.on('getFilesDone', function(){
  files.forEach(function(file){
    sys.puts('Loading file ' + file);
    require('./' + file);
  });
});

getFiles();