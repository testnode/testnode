/* ansi-color */
module.exports = (function(){
    var hashConfig = function(config) {
      var keys = Object.keys(config).sort();
      var pairs = [];
      for(var i=0; i<keys.length;i++) {
        var key = keys[i];
        if (config.hasOwnProperty(key)) {
          var string = key + '=' + config[key];
          pairs.push(string);
        }
      }
      return pairs.join(';');
    };
    var instances = {};
    return (function(config){
        if (!config) config = {};
        if (!config.timeout) config.timeout = 4000;

        var configHash = hashConfig(config);
        if (instances[configHash]) return instances[configHash];

        var events = require('./events');
        var EventEmitter = events.EventEmitter;
        var sys = require('sys');
        var addConsoleOutputConcerns = require('./testnodeConsole');
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

        var topContext = new Context("Top Level Context", null);

        main.context = function(name, callback) {
          topContext.context(name, callback);
        };

        addSystemConcerns(main);
        if (!config['quiet']) {
          addConsoleOutputConcerns(main);
        }

        instances[configHash] = main;
        return main;
    });
})();