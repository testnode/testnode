module.exports = (function(){
  var EventEmitter = require('events').EventEmitter;
  var relayEvents = function(fromObject, toObject, events) {
    events.forEach(function(eventName){
      fromObject.on(eventName, function(o){
        toObject.emit(eventName, o);
      });
    });
  };
  return {
    EventEmitter: EventEmitter,
    relayEvents: relayEvents
  };
})();