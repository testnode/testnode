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
            top.onDone(function(){
              q.next();
            });
            top._call();
          } else {
            begun = false;
          }
        };
        return q;
    })();

    var Test = function(context, name, testFunction) {
        this.context = context;
        this.name = name;
        this.testFunction = testFunction;
        this.failures = [];
        this.passes = [];
        this.doneCallbacks = [];
        testQueue.put(this);
        //this._call();
    };
    Test.prototype.onDone = function(callback) {
      this.doneCallbacks.push(callback);
    };
    Test.prototype._call = function() {
        var test = this;
        main.emit('testStarted', this);
        var done = function() {
            clearTimeout(timer);
            main.emit('testDone', test);
            test.doneCallbacks.forEach(function(c){
              c(test);
            });
        };
        var timer = setTimeout(function(){
            main.emit('testTimeout', test);
        }, config.timeout);
        try {
            this.testFunction.call(this, done);
        } catch(error) {
            this.flunk(error.toString(), {error: error, test: this});
        }
    };
    Test.prototype.assert = function(condition) {
        var a = new Assertion(this, 'assert', [condition], function() {
            return condition;
        });
        a.execute();
        if (a.passed) {
            this.passes.push(a);
            main.emit('assertionPassed', {context: this.context});
        } else {
            this.failures.push(a);
            main.emit('assertionFailed', {context: this.context});
        }
    };
    Test.prototype.flunk = function(message, options) {
        options = options ? options : {};
        main.emit('testFlunk', {context: this.context, message: message, options: options});
    };

    var Context = function(name, parentContext) {
      this.name = name;
      this.parentContext = parentContext;
      this.subContexts = [];
      this.tests = [];
    };
    Context.prototype.context = function(name, callback) {
      var ctx = new Context(name, this);
      this.subContexts.push(ctx);
      main.emit('pushContext', {name: name, context: ctx});
      callback.apply(ctx);
      main.emit('popContext', {name: name, context: ctx});
    };
    Context.prototype.it = function(name, callback) {
      this.tests.push(new Test(this, name, callback));
    };
    Context.prototype._depth = function() {
      var parent = this;
      var i = 0;
      while(parent) {
        parent = parent.parentContext;
        i++;
      }
      return i;
    };

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