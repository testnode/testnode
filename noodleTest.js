/* ansi-color */
module.exports = (function(config){
    var cons = require('./noodleTestConsole');
    if (!config) config = {};
    var test = {};
    var sys = require('sys');

    if (!config.timeout) config.timeout = 4000;
    // Whether to run the tests sequentially. If false, output will be screwy.
    config.sequential = true;

    var eventListeners = {};
    var triggerEvent = function(eventName) {
        var args = arguments;
        if (eventListeners[eventName]) {
            var Break = {};
            try {
                eventListeners[eventName].forEach(function(callback){
                    var result = callback.apply(test, [].slice.call(args, 1));
                    if (result === false) {
                        throw Break;
                    }
                });
            } catch(e) {
                if (e!==Break) throw e;
            }
        }
    };
    test.on = function(eventName, callback) {
        if (!eventListeners[eventName]) {
            eventListeners[eventName] = [];
        }
        eventListeners[eventName].push(callback);
    };

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
        triggerEvent('testStarted', this);
        var done = function() {
            clearTimeout(timer);
            triggerEvent('testDone', test);
            test.doneCallbacks.forEach(function(c){
              c(test);
            });
        };
        var timer = setTimeout(function(){
            triggerEvent('testTimeout', test);
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
            triggerEvent('assertionPassed', {context: this.context});
        } else {
            this.failures.push(a);
            triggerEvent('assertionFailed', {context: this.context});
        }
    };
    Test.prototype.flunk = function(message, options) {
        options = options ? options : {};
        triggerEvent('testFlunk', {context: this.context, message: message, options: options});
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
      triggerEvent('pushContext', {name: name, context: ctx});
      callback.apply(ctx);
      triggerEvent('popContext', {name: name, context: ctx});
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

    test.context = function(name, callback) {
      var ctx = new Context(name, null);
      topLevelContexts.push(ctx);
      triggerEvent('pushContext', {name: name, context: ctx});
      callback.apply(ctx);
      triggerEvent('popContext', {name: name, context: ctx});
    };
  /*
    test.context = function(name, callback) {
        contextStack.push(name);
        triggerEvent('pushContext', {name: name, context: copyContext()});
        callback();
        contextStack.pop();
        triggerEvent('popContext', {name: name, context: copyContext()});
    };
    test.it = function(name, callback) {
        var t = arguments[2] || new Test(copyContext(), name);
        triggerEvent('testStarted', t);
        var done = function() {
            clearTimeout(timer);
            triggerEvent('testDone', t);
            triggerEvent('testDone2', t);
        };
        var timer = setTimeout(function(){
            triggerEvent('testTimeout', t);
        }, config.timeout);
        try {
            callback.call(t, done);
        } catch(error) {
            test.flunk(error.toString(), {error: error, test: t});
        }
    };
    */

    /* patch sequential behaviour into it() */
    /*
    (function(originalTestIt){
        var queue = [];
        var begun = false;
        var waitingTakes = 0;
        var take = function() {
            var first = queue[0];
            queue = queue.slice(1);
            originalTestIt(first[0], first[1], first[2]);
        };
        var put = function(a) {
            queue.push(a);
            if (waitingTakes) {
                waitingTakes = 0;
                take();
            }
        };
        var takeLater = function() {
            waitingTakes++;
        };
        test.it = function(name, callback) {
            if (!begun) {
                begun = true;
                takeLater();
            }
            var t = new Test(copyContext(), name);
            put([name, callback, t]);
        };
        test.on('testDone2', function(t){
            if (queue.length > 0) {
                take();
            } else {
                takeLater();
            }
        });

        test.on('popContext', function(o){
            return false;
        });


    })(test.it);
    */

    var seen = false;
    var seenFailure = function() {
      seen = true;
    };
    test.on('assertionFailed', seenFailure);
    test.on('testFlunk', seenFailure);

    test.onFailureExitNonZero = function() {
        process.on('exit', function(a) {
            if (seen) {
                /* Hack */
                process.kill(process.pid, 'SIGHUP');
            }
        });
    };

    if (!config['quiet']) {
      cons(test);
    }

    return test;
});