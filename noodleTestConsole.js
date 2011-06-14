module.exports = (function(test){
    var sys = require('sys');
    var color = require('ansi-color').set;

    var out = this;

    var lastDot = false;
    var log = function(indent, text, colour) {
        if (lastDot) {
            sys.puts('');
        }
        var spaces = '';
        var i=0;
        for(i=0; i<indent; i++) {
            spaces = spaces + '  ';
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
                spaces = spaces + '  ';
            }
            lastDot = true;
        }
        sys.print(spaces + text);
    };

    var last = null;

    test.on('pushContext', function(o){
        var contextIndent = o.context._depth();
        log(contextIndent, color(o.context._name, "yellow"));
        last = null;
    });

//    test.on('popContext', function(o){
//        log(0, '');
//    });

    test.on('testStarted', function(t){
        var contextIndent = t._context._depth();
        log(contextIndent+1, "it " + color(t._name, "yellow"));
        last = 'testStarted';
    });

    test.on('testTimeout', function(t){
        var contextIndent = t._context._depth();
        log(contextIndent, 'Did you remember to call done() for test "'+t._name+'"?', 'magenta');
        log(contextIndent, 'Make sure you do. We don\'t print out the stack traces until done() has been called' +"\n", 'magenta');
        last = null;
    });

    test.on('testDone', function(t){
        var contextIndent = t._context._depth();
        var n = t._failures.length || t._passes.length;
        var message = (t._failures.length == 0) ? color(n + ' assertion'+(n==1?'':'s')+' passed','green') : color(n + ' assertion'+(n==1?'':'s')+" failed\n",'red');
        log(contextIndent+2, message);
        t._failures.forEach(function(assertion){
            var callString = assertion.callString();
            var failureMessage = assertion.failureMessage();
            log(contextIndent+2, callString + ' : ' + failureMessage, 'red+bold');
            log(contextIndent+2, assertion.stack, 'white');
            log(0, '');
        });
        last = null;
    });

    test.on('testFlunk', function(o){
        var contextIndent = o.context._depth();
        log(contextIndent+2, o.context + ': '+color('Failed','red')+': ' + o.message);
        last = null;
    });

    test.on('assertionPassed', function(o){
        var contextIndent = o.context._depth();
        dot(contextIndent+2, color('+','green'));
        last = 'assertionPassed';
    });

    test.on('assertionFailed', function(o){
        var contextIndent = o.context._depth();
        dot(contextIndent+2, color('x','red'));
        last = 'assertionFailed';
    });

});