var test = require('../noodleTest')();
test.onFailureExitNonZero();

doSomethingAsychronously(function() {
   test.context("Message", function() {
        this.context("NullMessage", function() {
            this.it("should do something", function() {
                this.assert(true);
                this.assert(false);
                this.assertEqual("123", 135);
                //done();
                setTimeout(this.done, 1000);
            });
            this.it("should do something 2", function() {
                var t = this;
                setTimeout(function(){
                  t.assert(true);
                  setTimeout(function(){
                    t.assert(true);
                    setTimeout(function(){
                      t.assert(true);
                      setTimeout(t.done, 900);
                    },900);
                  },900);
                },900);
            });
            this.it("should do something else", function() {
                //this.assert(false);
                this.assert(true);
                this.assert(false);
                this.done();
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