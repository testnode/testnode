module.exports = (function(test){
    var sys = require('sys');
    var color = require('ansi-color').set;

    var out = this;

    var indentSpace = '  ';

    var lastDot = false;
    var log = function(indent, text, colour) {
        if (lastDot) {
            sys.puts('');
        }
        var spaces = '';
        var i=0;
        for(i=0; i<indent; i++) {
            spaces = spaces + indentSpace;
        }
        if (text.constructor == Array) {
            text.forEach(function(tex){
                if (colour) {
                    console.log(spaces + color(tex, colour));
                } else {
                    console.log(spaces + tex);
                }
            });
        } else {
            if (colour) {
                console.log(spaces + color(text, colour));
            } else {
                console.log(spaces + text);
            }
        }

        lastDot = false
    };

    var dot = function(initialIndent, text) {
        var spaces = '';
        if (!lastDot) {
            var i=0;
            for(i=0; i<initialIndent; i++) {
                spaces = spaces + indentSpace;
            }
            lastDot = true;
        }
        sys.print(spaces + text);
    };

    var last = null;

    var loggedContexts = {};
    var logContext = function(ctx) {
      if (!loggedContexts[ctx._uniqueId()]) {
        loggedContexts[ctx._uniqueId()] = true;

        var contextIndent = ctx._depth();
        log(contextIndent-2, color(ctx._name, "yellow"));
        last = null;

      }
    };

    var eachContextForTestBottomUp = function(test, callback) {
      var ctx;
      for (ctx=test._context; ctx._parentContext !== null; ctx = ctx._parentContext) {
        callback(ctx);
      }
    };
    var eachContextForTestTopDown = function(test, callback) {
      var contexts = [];
      eachContextForTestBottomUp(test, function(ctx){
        contexts.push(ctx);
      });
      for(var i=contexts.length-1; i>=0; i--) {
        callback(contexts[i]);
      }
    };

    test.on('testStarted', function(t){
        eachContextForTestTopDown(t, function(ctx){
          logContext(ctx);
        });
        var contextIndent = t._context._depth();
        log(contextIndent-1, "it " + color(t._name, "yellow"));
        last = 'testStarted';
    });

    test.on('testTimeout', function(t){
        var contextIndent = t._context._depth();
        log(contextIndent-2, 'Did you remember to call done() for test "'+t._name+'"?', 'magenta');
        log(contextIndent-2, 'Make sure you do. We don\'t print out the stack traces until done() has been called' +"\n", 'magenta');
        last = null;
    });

    test.on('uncaughtException', function(error){
        log(0, error.stack, 'white');
        log(0, '');
    });

    test.on('testDone', function(t){
        var contextIndent = t._context._depth();
        var n = t._failures.length || t._passes.length;
        var message = (t._failures.length == 0) ? color(n + ' assertion'+(n==1?'':'s')+' passed','green') : color(n + ' assertion'+(n==1?'':'s')+" failed\n",'red');
        log(contextIndent, message);
        t._failures.forEach(function(assertion){
            var callString = assertion.callString();
            var failureMessage = assertion.failureMessage();
            if (callString) {
              log(contextIndent, callString + ' : ' + failureMessage, 'red+bold');
            } else {
              log(contextIndent, failureMessage, 'red+bold');
            }
            log(contextIndent, assertion.stack, 'white');
            log(0, '');
        });
        last = null;
    });

    test.on('testFlunk', function(t){
        var contextIndent = t._context._depth();
        //log(contextIndent, color('Failed','red')+': ' + o.message);
        last = null;
    });

    test.on('assertionPassed', function(o){
        var contextIndent = o.context._depth();
        dot(contextIndent, color('+','green'));
        last = 'assertionPassed';
    });

    test.on('assertionFailed', function(o){
        var contextIndent = o.context._depth();
        dot(contextIndent, color('x','red'));
        last = 'assertionFailed';
    });

});