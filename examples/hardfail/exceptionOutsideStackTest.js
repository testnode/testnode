var test = require('testnode')();
test.onFailureExitNonZero();
test.handleUncaughtExceptions();

test.context("Example Test Suite", function() {
    this.context("Example Sub-Context", function() {
        this.it("Test code throws exception on next tick", function(test) {
            process.nextTick(function(){
              throw new Error('bleh');
            });
        });
    });
});
