var test = require('../noodleTest')();
test.onFailureExitNonZero();

doSomethingAsychronously(function() {
   test.context("Example Test Suite", function() {
        this.context("A Sub-Context in asyncExample.js", function(context) {
            doSomethingElseAsychronously(function() {
              context.it("should do something 1", function() {
                  this.assert(true);
                  this.assert(false);
                  this.assertEqual("123", 135);
                  setTimeout(this.done, 1000);
              });
            });
            this.it("should do something 2", function() {
                var t = this;
                setTimeout(function(){
                  t.assert(true);
                  setTimeout(function(){
                    t.assert(true);
                    setTimeout(function(){
                      t.assert(true);
                      setTimeout(t.done, 600);
                    },600);
                  },600);
                },600);
            });
            this.it("should do something else", function() {
                this.assert(true);
                this.assert(false);
                this.done();
            });
        });
   });
});

/*
 * These functions are here to demonstrate that it can handle asynchronisity.
 * For example, these could be loading dependencies that are needed to run the test.
 */
function doSomethingAsychronously(callback) {
    process.nextTick(callback);
}
function doSomethingElseAsychronously(callback) {
    process.nextTick(callback);
}