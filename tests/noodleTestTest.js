var test = require('../noodleTest')();
var EventEmitter = require('events').EventEmitter;
var sys = require('sys');
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    this.context('Basic Execution', function() {
      this.it("should call the first context callback", function(done) {
          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            done();
            this.it("test test", function(done2){
              done2();
            });
          });
      });

      this.it("should call the first test callback", function(done) {

          var t = require('../noodleTest')({quiet: true});
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
          var t = require('../noodleTest')({quiet: true});
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

      this.it("should call the second test callback after the first", function(done) {
          var myThis = this;

          var firstCalled = false;
          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            this.it("test 1", function(done2){
              firstCalled = true;
              done2();
            });
            this.it("test 1", function(done2){
              myThis.assert(firstCalled);
              done();
              done2();
            });
          });

      });
    });

    this.context('Assertions', function() {
      this.it("should keep Assertion in test's failed array if an assertion fails", function(done) {
          var myThis = this;

          var ee = new EventEmitter();

          var t = require('../noodleTest')({quiet: true});

          ee.on('setupDone', function(test){
            myThis.assert(test.failures.length > 0);
            myThis.assert(test.passes.length == 0);
            done();
          });

          t.context("test context", function() {
            this.it("test1", function(done2){
              this.assert(false);
              done2();
              ee.emit('setupDone', this);
            });
          });

      });

      this.it("should emit assertionFailed event when an assertion fails", function(done) {
          var myThis = this;

          var seenAssertionFailedEvent = false;
          var finish = function() {
            myThis.assert(seenAssertionFailedEvent);
            done();
          };

          var t = require('../noodleTest')({quiet: true});
          var timer = setTimeout(function(){
            finish();
          }, 200);
          t.on('assertionFailed', function() {
            seenAssertionFailedEvent = true;
            clearTimeout(timer);
            finish();
          });

          t.context("test context", function() {
            this.it("test1", function(done2){
              this.assert(false);
              done2();
            });
          });

      });

      this.it("assertArrayEqual will pass when given equal arrays", function(done) {
          this.assertArrayEqual([1,'2'], [1,'2']);
          this.assertArrayEqual([1,'2',[3,'4']], [1,'2',[3,'4']]);
          done();
      });

      this.it("assertArrayEqual will fail when given inequal arrays", function(done) {
          var myThis = this;

          var failed = false;
          var finish = function() {
            clearTimeout(timer);
            myThis.assert(failed);
            done();
          };

          var t = require('../noodleTest')({quiet: true});
          t.on('assertionFailed', function() {
            failed = true;
            finish();
          });
          t.on('assertionPassed', function() {
            finish();
          });
          var timer = setTimeout(function(){
            finish();
          },200);
          t.context('test context', function() {
            this.it('test test', function(done2){
              this.assertArrayEqual([1,'2',[3,'4']], [1,'2',[3,'5']]);
              done2();
            });
          });

      });

    });

    this.context('Stack trace', function() {
      this.it("should be trimmed such that the first line is the client code", function(done) {
          var myThis = this;

          var t = require('../noodleTest')({quiet: true});
          t.context('test context', function() {
            this.it('test test', function(done2){
              this.assert(false);

              var firstStackLine = this.failures[0].stack[0];
              // client's test function will be called "testFunction" in the stack trace
              myThis.assert(firstStackLine.indexOf('.testFunction'));

              done2();
              done();
            });
          });

      });
    });

});