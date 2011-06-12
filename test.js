module.exports = (function(Assertion, testQueue, timeout){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');
  var Test = function(context, name, testFunction) {
      this.context = context;
      this.name = name;
      this.testFunction = testFunction;
      this.failures = [];
      this.passes = [];
      EventEmitter.call(this);
      Test.emit('new', this);
      testQueue.put(this);
  };
  sys.inherits(Test, EventEmitter);
  events.classEvents(Test);
  Test.prototype._call = function() {
      var test = this;
      this.emit('testStarted', this);
      var done = function() {
          clearTimeout(timer);
          test.emit('testDone', test);
      };
      var timer = setTimeout(function(){
          test.emit('testTimeout', test);
      }, timeout);
      try {
          this.testFunction.call(this, done);
      } catch(error) {
          this.flunk(error.toString(), {error: error, test: this});
      }
  };
  Test.prototype.assert = function(condition) {
      var a = new Assertion(this, 'assert', [condition], function() {
          return condition;
      }, function(args) {
        return "Expected first argument to evaluate to true";
      });
      a.execute();
      if (a.passed) {
          this.passes.push(a);
          this.emit('assertionPassed', {context: this.context});
      } else {
          this.failures.push(a);
          this.emit('assertionFailed', {context: this.context});
      }
  };
  Test.prototype.assertEqual = function(expected, actual) {
      var a = new Assertion(this, 'assertEqual', [expected, actual], function() {
          return expected == actual;
      }, function(args) {
        return "Expected " + sys.inspect(expected) + ", but got " + sys.inspect(actual);
      });
      a.execute();
      if (a.passed) {
          this.passes.push(a);
          this.emit('assertionPassed', {context: this.context});
      } else {
          this.failures.push(a);
          this.emit('assertionFailed', {context: this.context});
      }
  };
  Test.prototype.flunk = function(message, options) {
      options = options ? options : {};
      this.emit('testFlunk', {context: this.context, message: message, options: options});
  };
  return Test;
});