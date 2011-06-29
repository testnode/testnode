module.exports = (function(Test, Setup){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');

  var first = function(a) {
    return a[0];
  };
  var last = function(a) {
    return a[a.length-1];
  };

  function Context(name, parentContext) {
    this._name = name;
    this._parentContext = parentContext;
    this._subContexts = [];
    this._tests = [];
    this._setups = {};
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
    //this._emit('pushContext', {name: name, context: ctx});
    callback.call(ctx, ctx);
    //this._emit('popContext', {name: name, context: ctx});

    var self = this;
    if (ctx._tests.length > 0) {
      first(ctx._tests).on('testStarted', function() {
        //sys.puts('first test started');
        self._emit('pushContext', {name: name, context: ctx});
      });
      last(ctx._tests).on('testDone', function() {
        //sys.puts('last test done');
        self._emit('popContext', {name: name, context: ctx});
      });
    }
    if (ctx._subContexts.length > 0) {
      first(ctx._subContexts).on('pushContext', function() {
        //sys.puts('first context started');
        self._emit('pushContext', {name: name, context: ctx});
      });
      last(ctx._subContexts).on('popContext', function() {
        self._emit('popContext', {name: name, context: ctx});
      });
    }
  };
  Context.prototype.it = function(name, callback) {
    this._tests.push(new Test(this, name, callback));
  };
  Context.prototype.beforeAll = function(callback) {
    this._setups['beforeAll'] = this._setups['beforeAll'] || [];
    this._setups['beforeAll'].push(new Setup(this, 'beforeAll', callback));
  };
  Context.prototype.afterAll = function(callback) {
    this._setups['afterAll'] = this._setups['afterAll'] || [];
    this._setups['afterAll'].push(new Setup(this, 'afterAll', callback));
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
  Context.prototype._uniqueId = function() {
    if (!this._uniqueId_) {
      var parent = this;
      var idArray = [];
      idArray.push(parent._name);
      while(parent) {
        parent = parent._parentContext;
        if (parent) idArray.push(parent._name);
      }
      this._uniqueId_ = idArray.join('<');
    }
    return this._uniqueId_;
  };
  return Context;
});