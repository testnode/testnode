TestNode
========

A testing library/framework for Node.js

TestNode aims to be unobtrusive and unassuming about the environment
in which it will run. That's the goal - we will no-doubt fall short
of this goal somewhere, but we'll try our best.

It's a BDD-esc library in it's syntax, but that's about as far as it
goes in terms of BDD.

Example
-------

**Basic Syntax**:

    var test = require('testnode')();
    test.onFailureExitNonZero();

    test.context("Example Test Suite", function() {
        this.context("Example Sub-Context", function() {
            this.it("Basic Test Example", function(test) {
                test.assert(true);
                test.done();
            });
        });
    });

**Executing tests**:

    node examples/basicTest.js

OR *coming soon*:

    testnode testsDirectory

See the examples directory for more examples.

Installation
------------

Install with npm:

    npm install testnode

More doco coming soon :)

