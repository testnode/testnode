module.exports = (function(){
  var sys = require('sys');
  function Assertion(testCase, assertMethod, args, tester) {
      this.testCase = testCase;
      this.assertMethod = assertMethod;
      this.args = args;
      this.tester = tester;
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
      return "Expected first argument to evaluate to true";
  };
  Assertion.prototype.callString = function() {
      return this.assertMethod + '(' + sys.inspect(this.args[0]) + ')'
  };
  return Assertion;
})();
