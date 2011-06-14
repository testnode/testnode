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
      this.done = function() {
          clearTimeout(timer);
          test.emit('testDone', test);
      };
      var timer = setTimeout(function(){
          test.emit('testTimeout', test);
      }, timeout);
      try {
          this.testFunction.call(this, this);
      } catch(error) {
          this.flunk(error.toString(), {error: error, test: this});
      }
  };
  Test.prototype.flunk = function(message, options) {
      options = options ? options : {};
      this.emit('testFlunk', {context: this.context, message: message, options: options});
  };

  Assertion.on('assertionAdded', function(definition){
    var methodName = definition['methodName'];
    var assertionFunction = definition['assertionFunction'];
    var failureMessageFunction = definition['failureMessageFunction'];
    Test.prototype[methodName] = function() {
      var args = arguments;
      var a = new Assertion(this, methodName, args, function() {
          return assertionFunction.apply(this, args);
      }, function() {
        return failureMessageFunction.apply(this, args);
      });
      a.execute();
      if (a.passed) {
          this.passes.push(a);
          this.emit('assertionPassed', {context: this.context});
      } else {
          this.failures.push(a);
          this.emit('assertionFailed', {context: this.context});
      }
    }
  });

  return Test;
});