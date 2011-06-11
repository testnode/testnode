var test = require('./noodleTest')();
var subject = require('./noodleTest')({quiet: true});
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    test.it("should call the context callback", function(done) {

        subject.context("test context", function() {
          done();
          subject.it("test test", function(done2){
            done2();
          });
        });

    });

    test.it("should call the test callback", function(done) {

        subject.context("test context", function() {
          subject.it("test test", function(done2){
            done();
            done2();
          });
        });

    });

});