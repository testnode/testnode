module.exports = (function(Test){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');
  function Context(name, parentContext) {
    this._name = name;
    this._parentContext = parentContext;
    this._subContexts = [];
    this._tests = [];
    EventEmitter.call(this);

    /* Rename emit() method from EventEmitter to indicate that it is private */
    this._emit = this.emit;
    delete this['emit'];

    Context.emit('new', this);
  }
  sys.inherits(Context, EventEmitter);
  events.classEvents(Context);
  Context.prototype.context = function(name, callback) {
    var ctx = new Context(name, this);
    this._subContexts.push(ctx);
    this._emit('pushContext', {name: name, context: ctx});
    callback.call(ctx, ctx);
    this._emit('popContext', {name: name, context: ctx});
  };
  Context.prototype.it = function(name, callback) {
    this._tests.push(new Test(this, name, callback));
  };
  Context.prototype._depth = function() {
    var parent = this;
    var i = 0;
    while(parent) {
      parent = parent._parentContext;
      i++;
    }
    return i;
  };
  return Context;
});