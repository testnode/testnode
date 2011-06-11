var test = require('./noodleTest');
test.onFailureExitNonZero();

doSomethingAsychronously(function() {
   test.context("Message", function() {
        test.context("NullMessage", function() {
            test.it("should do something", function(done) {
                this.assert(true);
                //this.assert(false);
                //done();
                setTimeout(done, 1000);
            });
            test.it("should do something else", function(done) {
                //this.assert(false);
                this.assert(true);
                this.assert(false);
                done();
            });
        });
   });
});

/*
 * This function is here just to demonstrate that it can asynchronisity.
 * For example, this could be loading dependencies that are needed to run the test.
 */
function doSomethingAsychronously(callback) {
    process.nextTick(callback);
}