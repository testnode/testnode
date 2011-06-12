/* ansi-color */
module.exports = (function(config){
    var EventEmitter = require('events').EventEmitter;
    var cons = require('./noodleTestConsole');
    if (!config) config = {};
    var main = new EventEmitter();
    var sys = require('sys');
    if (!config.timeout) config.timeout = 4000;

    var Assertion = function(testCase, assertMethod, args, tester) {
        this.testCase = testCase;
        this.assertMethod = assertMethod;
        this.args = args;
        this.tester = tester;
        this.passed = null;
        var numberOfStackLinesToSkip = 1 /* First line which is just the name of the fake error we created: "Error" */
                                     + 1 /* Call to here */
                                     + 1 /* The caller (Test#assert) */;
        this.stack = (new Error).stack.split("\n").map(function(line){
            return line.trim();
        }).slice(numberOfStackLinesToSkip);
    };
    Assertion.prototype.execute = function() {
        this.passed = !!this.tester();
    };
    Assertion.prototype.failureMessage = function() {
        return "Expected first argument to evaluate to true";
    };
    Assertion.prototype.callString = function() {
        return this.assertMethod + '(' + sys.inspect(this.args[0]) + ')'
    };

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
      t.on('assertionPassed', function(o){
        main.emit('assertionPassed', o);
      });
      t.on('assertionFailed', function(o){
        main.emit('assertionFailed', o);
      });
      t.on('testFlunk', function(o){
        main.emit('testFlunk', o);
      });
      t.on('testStarted', function(o){
        main.emit('testStarted', o);
      });
      t.on('testTimeout', function(o){
        main.emit('testTimeout', o);
      });
      t.on('testDone', function(o){
        main.emit('testDone', o);
      });
    });

    var Context = require('./context')(Test);

    /* Relay events emitted by Context instances to the main object */
    Context.on('new', function(ctx){
      ctx.on('pushContext', function(o){
        main.emit('pushContext', o);
      });
      ctx.on('popContext', function(o){
        main.emit('popContext', o);
      });
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