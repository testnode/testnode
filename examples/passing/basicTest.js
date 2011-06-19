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
