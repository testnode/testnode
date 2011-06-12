module.exports = (function(Test){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');
  function Context(name, parentContext) {
    this.name = name;
    this.parentContext = parentContext;
    this.subContexts = [];
    this.tests = [];
    EventEmitter.call(this);
    Context.emit('new', this);
  }
  sys.inherits(Context, EventEmitter);
  /* class-level event emitter for Context class */
  (function(){
    var emitter = new EventEmitter();
    Context.on = function(eventName, callback) {
      emitter.on(eventName, callback);
    };
    Context.emit = function(eventName, object) {
      emitter.emit(eventName, object);
    };
  })();
  Context.prototype.context = function(name, callback) {
    var ctx = new Context(name, this);
    this.subContexts.push(ctx);
    this.emit('pushContext', {name: name, context: ctx});
    callback.apply(ctx);
    this.emit('popContext', {name: name, context: ctx});
  };
  Context.prototype.it = function(name, callback) {
    this.tests.push(new Test(this, name, callback));
  };
  Context.prototype._depth = function() {
    var parent = this;
    var i = 0;
    while(parent) {
      parent = parent.parentContext;
      i++;
    }
    return i;
  };
  return Context;
});