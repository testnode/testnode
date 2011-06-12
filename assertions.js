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

  var arraysEqual = function(a, b) {
    if (a.length != b.length) return false;
    var i;
    for(i=0; i<a.length; i++) {
      var aVal = a[i];
      var bVal = b[i];
      if (aVal != bVal) {
        if (aVal instanceof Array) {
          if (!arraysEqual(aVal, bVal)) {
            return false;
          }
        } else {
          return false;
        }
      }
    }
    return true;
  };

  Assertion.addAssertion('assertArrayEqual', function(expected, actual) {
    return arraysEqual(expected,actual);
  }, function(expected, actual) {
    return "Expected " + sys.inspect(expected) + ", but got " + sys.inspect(actual);
  });

};