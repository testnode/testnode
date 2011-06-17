var test = require('../noodleTest')();
test.onFailureExitNonZero();

test.context("Example Test Suite", function() {
    this.context("Example Sub-Context", function() {
        this.it("Test code throws exception", function(test) {
            throw new Error('bleh');
        });
    });
});
