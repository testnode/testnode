module.exports = (function(){
  var sys = require('sys');
  var events = require('./events');
  function Assertion(testCase, assertMethod, args, tester, failureMessageFunction) {
      this.testCase = testCase;
      this.assertMethod = assertMethod;
      this.args = args;
      this.tester = tester;
      this.failureMessageFunction = failureMessageFunction;
      this.passed = null;
      var numberOfStackLinesToSkip = 1 /* First line which is just the name of the fake error we created: "Error" */
                                   + 1 /* Call to here */
                                   + 1 /* The caller (Test#assert) */;
      this.stack = (new Error).stack.split("\n").map(function(line){
          return line.trim();
      }).slice(numberOfStackLinesToSkip);
  }
  Assertion.prototype.execute = function() {
      this.passed = !!this.tester();
  };
  Assertion.prototype.failureMessage = function() {
    return this.failureMessageFunction(this.args);
  };
  Assertion.prototype.callString = function() {
      return this.assertMethod;
  };

  events.classEvents(Assertion);
  Assertion.assertions = [];
  Assertion.addAssertion = function(methodName, assertionFunction, failureMessageFunction) {
    var a = {methodName: methodName, assertionFunction: assertionFunction, failureMessageFunction: failureMessageFunction};
    Assertion.assertions.push(a);
    Assertion.emit('assertionAdded', a);
  };

  return Assertion;
})();
