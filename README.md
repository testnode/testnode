TestNode
========

A testing library/framework for Node.js

TestNode aims to be unobtrusive and unassuming about the environment
in which it will run. That's the goal - we will no-doubt fall short
of this goal somewhere, but we'll try our best.

It's a BDD-esc library in it's syntax, but that's about as far as it
goes in terms of BDD.

Usage and Example
-----------------

**Executing tests**:

    node examples/basicTest.js

OR

    testnode testsDirectory

**Basic Syntax**:

```javascript
var test = require('testnode')();
test.onFailureExitNonZero();

test.context("Example Test Suite", function() {
    this.context("Example Sub-Context", function() {
        this.it("should run a basic example test", function(test) {
            test.assert(true);
            test.done();
        });
    });
});
```

**Output**:

```
Example Test Suite
  Example Sub-Context
    it should run a basic example test
      +
      1 assertion passed
```

See the examples directory for more examples.

Installation
------------

Install with npm:

    npm install testnode

More doco coming soon :)

Example Output
--------------

(has colour, which is not shown here)


    joel@joel3:/usr/local/lib/node/testnode$ testnode examples/passing
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/passing/basicTest.js
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/passing/basicTest2.js
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/passing/setupAndTeardown.js
    Example Test Suite
      Example Sub-Context
        it Basic Test Example
          +
          1 assertion passed
        it Another Basic Test Example
          +
          1 assertion passed
      Example of using run() for setup and teardown
        it Test run callback has been called
          +
          1 assertion passed
        it Test run() has been called once, followed by a test
          +
          1 assertion passed
    setupAndTeardown.js: a = 2
      Another context
        it Previous context's last run() function was called
          +
          1 assertion passed
    
    
    joel@joel3:/usr/local/lib/node/testnode$ testnode examples/failing
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/exceptionTest.js
    Loading file /usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/failingTest.js
    Example Test Suite
      Example Sub-Context
        it Test code throws exception
          1 assertion failed
    
          Error: bleh
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/exceptionTest.js:7:19)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
          at Object.next (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:22:13)
          at Object.put (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:10:11)
          at Array.1 (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:40:19)
          at EventEmitter._tickCallback (node.js:170:26)
    
        it A Failing Test Example
          x
          1 assertion failed
    
          assert : Expected first argument to evaluate to true
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/failingTest.js:7:18)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
          at Object.next (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:22:13)
          at Object.put (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:10:11)
          at Array.2 (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:40:19)
          at EventEmitter._tickCallback (node.js:170:26)
    
      A Sub-Context in asyncExample.js
        it should do something 2
          +++
          3 assertions passed
        it should do something else
          +x
          1 assertion failed
    
          assert : Expected first argument to evaluate to true
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js:30:22)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
          at Object.next (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:22:13)
          at [object Object].<anonymous> (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:18:13)
          at [object Object].<anonymous> (events.js:81:20)
          at Object._onTimeout (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:52:16)
          at Timer.callback (timers.js:83:39)
    
        it should do something 1
          +xx
          2 assertions failed
    
          assert : Expected first argument to evaluate to true
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js:10:24)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
          at Object.next (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:22:13)
          at [object Object].<anonymous> (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:18:13)
          at [object Object].<anonymous> (events.js:81:20)
          at [object Object].done (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:52:16)
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js:31:22)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
    
          assertEqual : Expected '123', but got 135
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js:11:24)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
          at Object.next (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:22:13)
          at [object Object].<anonymous> (/usr/local/lib/node/.npm/testnode/0.1.4/package/testQueue.js:18:13)
          at [object Object].<anonymous> (events.js:81:20)
          at [object Object].done (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:52:16)
          at [object Object]._testFunction (/usr/local/lib/node/.npm/testnode/0.1.4/package/examples/failing/asyncExample.js:31:22)
          at [object Object]._call (/usr/local/lib/node/.npm/testnode/0.1.4/package/test.js:56:30)
    

