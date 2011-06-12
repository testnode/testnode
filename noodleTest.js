/* ansi-color */
module.exports = (function(config){
    var events = require('./events');
    var EventEmitter = events.EventEmitter;
    var cons = require('./noodleTestConsole');
    if (!config) config = {};
    var main = new EventEmitter();
    var sys = require('sys');
    if (!config.timeout) config.timeout = 4000;

    var Assertion = require('./assertion');

    var testQueue = (function() {
        var begun = false;
        var q = {};
        q.array = [];
        q.put = function(test) {
          q.array.push(test);
          if (!begun) {
            begun = true;
            q.next();
          }
        };
        q.next = function() {
          if (q.array.length > 0) {
            var top = q.array[0];
            q.array = q.array.slice(1);
            top.on('testDone', function(){
              q.next();
            });
            top._call();
          } else {
            begun = false;
          }
        };
        return q;
    })();

    var Test = require('./test')(Assertion, testQueue, config);

    /* Relay events emitted by Test instances to the main object */
    Test.on('new', function(t){
      events.relayEvents(t, main, ['assertionPassed', 'assertionFailed', 'testFlunk', 'testStarted', 'testTimeout', 'testDone']);
    });

    var Context = require('./context')(Test);

    /* Relay events emitted by Context instances to the main object */
    Context.on('new', function(ctx){
      events.relayEvents(ctx, main, ['pushContext', 'popContext']);
    });

    var topLevelContexts = [];

    main.context = function(name, callback) {
      var ctx = new Context(name, null);
      topLevelContexts.push(ctx);
      main.emit('pushContext', {name: name, context: ctx});
      callback.apply(ctx);
      main.emit('popContext', {name: name, context: ctx});
    };

    var seen = false;
    var seenFailure = function() {
      seen = true;
    };
    main.on('assertionFailed', seenFailure);
    main.on('testFlunk', seenFailure);

    main.onFailureExitNonZero = function() {
        process.on('exit', function(a) {
            if (seen) {
                /* Hack */
                process.kill(process.pid, 'SIGHUP');
            }
        });
    };

    if (!config['quiet']) {
      cons(main);
    }

    return main;
});