var test = require('../noodleTest')();
test.onFailureExitNonZero();

doSomethingAsychronously(function() {
   test.context("Message", function() {
        this.context("NullMessage", function() {
            this.it("should do something", function(done) {
                this.assert(true);
                this.assert(false);
                //done();
                setTimeout(done, 1000);
            });
            this.it("should do something 2", function(done) {
                var t = this;
                setTimeout(function(){
                  t.assert(true);
                  setTimeout(function(){
                    t.assert(true);
                    setTimeout(function(){
                      t.assert(true);
                      setTimeout(done, 900);
                    },900);
                  },900);
                },900);
            });
            this.it("should do something else", function(done) {
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