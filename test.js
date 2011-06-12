module.exports = (function(Assertion, testQueue, config){
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
  /* class-level event emitter for Test class */
  (function(){
    var emitter = new EventEmitter();
    Test.on = function(eventName, callback) {
      emitter.on(eventName, callback);
    };
    Test.emit = function(eventName, object) {
      emitter.emit(eventName, object);
    };
  })();
  Test.prototype._call = function() {
      var test = this;
      this.emit('testStarted', this);
      var done = function() {
          clearTimeout(timer);
          test.emit('testDone', test);
      };
      var timer = setTimeout(function(){
          test.emit('testTimeout', test);
      }, config.timeout);
      try {
          this.testFunction.call(this, done);
      } catch(error) {
          this.flunk(error.toString(), {error: error, test: this});
      }
  };
  Test.prototype.assert = function(condition) {
      var a = new Assertion(this, 'assert', [condition], function() {
          return condition;
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