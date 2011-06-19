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

