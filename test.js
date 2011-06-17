module.exports = (function(Assertion, testQueue, timeout){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');

  /* Flunk instance is called as if it were an Assertion instance */
  var Flunk = function(test, error) {
    this.test = test;
    this.error = error;
    var numberOfStackLinesToSkip = 1 /* First line which is just the name of the fake error we created: "Error" */;
    this.stackLines = error.stack.split("\n").map(function(line){
        return line.trim();
    });
    this.stack = this.stackLines.slice(numberOfStackLinesToSkip);
    this._failureMessage = this.stackLines[0];
  };
  Flunk.prototype.failureMessage = function() {
    return this._failureMessage;
  };
  Flunk.prototype.callString = function() {
    return null;
  };

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
      var doneCalled = false;
      this.done = function() {
          doneCalled = true;
          clearTimeout(timer);
          test._emit('testDone', test);
      };
      var timer = setTimeout(function(){
          test._emit('testTimeout', test);
      }, timeout);
      try {
          this._testFunction.call(this, this);
      } catch(error) {
          if (!doneCalled) {
            clearTimeout(timer);
          }
          this._failures.push(new Flunk(this, error));
        test._emit('testDone', this);
          //this._emit('testFlunk', this);
          //this.flunk();
      }
  };
  /*Test.prototype.flunk = function() {
      this._emit('testFlunk', this);
  };*/

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