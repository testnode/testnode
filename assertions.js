module.exports = function(Assertion) {
  var sys = require('sys');

  Assertion.addAssertion('assert', function(condition) {
    return condition;
  }, function(condition) {
    return "Expected first argument to evaluate to true";
  });

  Assertion.addAssertion('assertEqual', function(expected, actual) {
    return expected == actual;
  }, function(expected, actual) {
    return "Expected " + sys.inspect(expected) + ", but got " + sys.inspect(actual);
  });

};