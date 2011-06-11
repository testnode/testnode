var test = require('./noodleTest')();
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    test.it("should call the first context callback", function(done) {

        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          done();
          t.it("test test", function(done2){
            done2();
          });
        });

    });

    test.it("should call the first test callback", function(done) {

        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          t.it("test test", function(done2){
            done();
            done2();
          });
        });

    });

    test.it("should call the second context callback after the first", function(done) {
        var myThis = this;

        var firstCalled = false;
        var t = require('./noodleTest')({quiet: true});
        t.context("test context", function() {
          firstCalled = true;
          t.it("test1", function(done2){
            done2();
          });
        });
        t.context("test context", function() {
          myThis.assert(firstCalled);
          done();
          t.it("test1", function(done2){
            done2();
          });
        });

    });

});