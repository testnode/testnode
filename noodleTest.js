/* ansi-color */
module.exports = (function(config){
    if (!config) config = {};
    if (!config.timeout) config.timeout = 4000;

    var events = require('./events');
    var EventEmitter = events.EventEmitter;
    var sys = require('sys');
    var addConsoleOutputConcerns = require('./noodleTestConsole');
    var addSystemConcerns = require('./system');
    var Assertion = require('./assertion');
    var testQueue = require('./testQueue')();
    var Test = require('./test')(Assertion, testQueue, config.timeout);
    require('./assertions')(Assertion);
    var Context = require('./context')(Test);
    var main = new EventEmitter();

    /* Relay events emitted by Test and Context instances to the main object */
    Test.on('new', function(t){
      events.relayEvents(t, main, ['assertionPassed', 'assertionFailed', 'testFlunk', 'testStarted', 'testTimeout', 'testDone']);
    });
    Context.on('new', function(ctx){
      events.relayEvents(ctx, main, ['pushContext', 'popContext']);
    });

    var topLevelContexts = [];

    main.context = function(name, callback) {
      var ctx = new Context(name, null);
      topLevelContexts.push(ctx);
      main.emit('pushContext', {name: name, context: ctx});
      callback.call(ctx, ctx);
      main.emit('popContext', {name: name, context: ctx});
    };

    addSystemConcerns(main);
    if (!config['quiet']) {
      addConsoleOutputConcerns(main);
    }

    return main;
});