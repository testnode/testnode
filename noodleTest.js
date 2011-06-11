/* ansi-color */
module.exports = (function(config){
    var cons = require('./noodleTestConsole');
    if (!config) config = {};
    var test = {};
    var sys = require('sys');

    if (!config.timeout) config.timeout = 4000;
    // Whether to run the tests sequentially. If false, output will be screwy.
    config.sequential = true;

    var contextStack = [];

    var copyContext = function() {
        return contextStack.join(':').split(':');
    };

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

    var Test = function(context, name) {
        this.context = context;
        this.name = name;
        this.failures = [];
        this.passes = [];
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

    test.flunk = function(message, options) {
        options = options ? options : {};
        triggerEvent('testFlunk', {context: copyContext(), message: message, options: options});
    };

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

    /* patch sequential behaviour into it() */
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

    test.anyFailures = function() {
        return true;
    };

    test.onFailureExitNonZero = function() {
        process.on('exit', function(a) {
            if (test.anyFailures()) {
                /* Hack */
                process.kill(process.pid, 'SIGTERM');
            }
        });
    };

    if (!config['quiet']) {
      cons(test);
    }

    return test;
});