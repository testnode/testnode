var test = require('./testnode')();
var sys = require('sys');
test.onFailureExitNonZero();
module.exports = {
  run: function(files) {
    files.forEach(function(file){
      sys.puts('Loading file ' + file);
      require(file);
    });
  }
};