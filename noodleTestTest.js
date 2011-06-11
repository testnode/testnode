var test = require('./noodleTest')();
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    this.it("should call the first context callback", function(done) {
        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          done();
          this.it("test test", function(done2){
            done2();
          });
        });
    });

    this.it("should call the first test callback", function(done) {

        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          this.it("test test", function(done2){
            done();
            done2();
          });
        });

    });

    this.it("should call the second context callback after the first", function(done) {
        var myThis = this;

        var firstCalled = false;
        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          firstCalled = true;
          this.it("test1", function(done2){
            done2();
          });
        });
        t.context("test context", function() {
          myThis.assert(firstCalled);
          done();
          this.it("test1", function(done2){
            done2();
          });
        });

    });

});