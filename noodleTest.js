/* ansi-color */
module.exports = (function(config){
    if (!config) config = {};
    if (!config.timeout) config.timeout = 4000;

    var events = require('./events');
    var EventEmitter = events.EventEmitter;
    var sys = require('sys');
    var cons = require('./noodleTestConsole');
    var Assertion = require('./assertion');
    var testQueue = require('./testQueue')();
    var Test = require('./test')(Assertion, testQueue, config.timeout);
    var main = new EventEmitter();

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