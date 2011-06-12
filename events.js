module.exports = (function(){
  var EventEmitter = require('events').EventEmitter;
  var relayEvents = function(fromObject, toObject, events) {
    events.forEach(function(eventName){
      fromObject.on(eventName, function(o){
        toObject.emit(eventName, o);
      });
    });
  };
  var classEvents = function(klass) {
    /* class-level event emitter */
    var emitter = new EventEmitter();
    klass.on = function(eventName, callback) {
      emitter.on(eventName, callback);
    };
    klass.emit = function(eventName, object) {
      emitter.emit(eventName, object);
    };
  };
  return {
    EventEmitter: EventEmitter,
    relayEvents: relayEvents,
    classEvents: classEvents
  };
})();