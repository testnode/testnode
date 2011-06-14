module.exports = (function(Assertion, testQueue, timeout){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');
  var Test = function(context, name, testFunction) {
      this._context = context;
      this._name = name;
      this._testFunction = testFunction;
      this._failures = [];
      this._passes = [];
      EventEmitter.call(this);

      /* Rename emit() method from EventEmitter to indicate that it is private */
      this._emit = this.emit;
      delete this['emit'];

      Test.emit('new', this);
      var self = this;
      // must do this next tick so context can listen to this test's events beforehand
      process.nextTick(function(){
        testQueue.put(self);
      });
  };
  sys.inherits(Test, EventEmitter);
  events.classEvents(Test);
  Test.prototype._call = function() {
      var test = this;
      this._emit('testStarted', this);
      this.done = function() {
          clearTimeout(timer);
          test._emit('testDone', test);
      };
      var timer = setTimeout(function(){
          test._emit('testTimeout', test);
      }, timeout);
      try {
          this._testFunction.call(this, this);
      } catch(error) {
          this.flunk(error.toString(), {error: error, test: this});
      }
  };
  Test.prototype.flunk = function(message, options) {
      options = options ? options : {};
      this._emit('testFlunk', {context: this._context, message: message, options: options});
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
          this._passes.push(a);
          this._emit('assertionPassed', {context: this._context});
      } else {
          this._failures.push(a);
          this._emit('assertionFailed', {context: this._context});
      }
    }
  });

  return Test;
});