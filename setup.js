module.exports = (function(testQueue){
  var events = require('./events');
  var EventEmitter = events.EventEmitter;
  var sys = require('sys');

  var Setup = function(context, type, setupFunction) {
      this._context = context;
      this._type = type;
      this._setupFunction = setupFunction;
      EventEmitter.call(this);

      /* Rename emit() method from EventEmitter to indicate that it is private */
      this._emit = this.emit;
      delete this['emit'];

      Setup.emit('new', this);
      var self = this;
      // must do this next tick so context can listen to our events beforehand
      process.nextTick(function(){
        testQueue.put(self);
      });
  };
  sys.inherits(Setup, EventEmitter);
  events.classEvents(Setup);
  Setup.prototype._call = function() {
      var setup = this;
      this._emit('setupStarted', this);
      var resumeFunction = function() {
        setup._emit('setupDone', setup);
      };
      this._setupFunction.call(this, resumeFunction);
  };

  return Setup;
});