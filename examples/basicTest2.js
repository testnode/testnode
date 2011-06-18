var test = require('../testnode')();
test.onFailureExitNonZero();

test.context("Example Test Suite", function() {
    this.context("Example Sub-Context", function() {
        this.it("Another Basic Test Example", function(test) {
            setTimeout(function(){
              test.assert(true);
              test.done();
            }, 2000);
        });
    });
});
