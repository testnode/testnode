var test = require('../testnode')();
test.onFailureExitNonZero();

test.context("Example Test Suite", function() {
    this.context("Example Sub-Context", function() {
        this.it("A Failing Test Example", function(test) {
            test.assert(false);
            test.done();
        });
    });
});
