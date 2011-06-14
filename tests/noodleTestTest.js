var test = require('../noodleTest')();
var EventEmitter = require('events').EventEmitter;
var sys = require('sys');
test.onFailureExitNonZero();

test.context("NoodleTest dogfood test", function() {

    this.context('Environment', function() {
      this.context('instantiation', function() {
        this.it('should return the same instance when given the same config', function() {
          var t1 = require('../noodleTest')({quiet: true});
          var t2 = require('../noodleTest')({quiet: true});
          this.assertEqual(t1, t2);
          this.done();
        });
        this.it('should return a different instance when given different configs', function() {
          var t1 = require('../noodleTest')({quiet: true, timeout: 1000});
          var t2 = require('../noodleTest')({quiet: true});
          this.assertNotEqual(t1, t2);
          this.done();
        });
      });
    });

    this.context('Basic Execution', function() {
      this.it("should call the first context callback", function(outerTest) {
          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            outerTest.done();
            this.it("test test", function(innerTest){
              innerTest.done();
            });
          });
      });

      this.it("should call the first test callback", function(outerTest) {

          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            this.it("test test", function(innerTest){
              outerTest.done();
              innerTest.done();
            });
          });

      });

      this.it("should call the second context callback after the first", function(outerTest) {
        var firstCalled = false;
          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            firstCalled = true;
            this.it("test1", function(innerTest){
              innerTest.done();
            });
          });
          t.context("test context", function() {
            outerTest.assert(firstCalled);
            outerTest.done();
            this.it("test1", function(innerTest){
              innerTest.done();
            });
          });

      });

      this.it("should call the second test callback after the first", function(outerTest) {
        var firstCalled = false;
          var t = require('../noodleTest')({quiet: true});
          t.context("test context", function() {
            this.it("test 1", function(innerTest){
              firstCalled = true;
              innerTest.done();
            });
            this.it("test 1", function(innerTest){
              outerTest.assert(firstCalled);
              outerTest.done();
              innerTest.done();
            });
          });

      });
    });

    this.context('Assertions', function() {
      this.it("should keep Assertion in test's failed array if an assertion fails", function(outerTest) {
        var ee = new EventEmitter();

          var t = require('../noodleTest')({quiet: true});

          ee.on('setupDone', function(test){
            outerTest.assert(test._failures.length > 0);
            outerTest.assert(test._passes.length == 0);
            outerTest.done();
          });

          t.context("test context", function() {
            this.it("test1", function(innerTest){
              innerTest.assert(false);
              innerTest.done();
              ee.emit('setupDone', this);
            });
          });

      });

      this.it("should emit assertionFailed event when an assertion fails", function(outerTest) {
        var seenAssertionFailedEvent = false;
          var finish = function() {
            outerTest.assert(seenAssertionFailedEvent);
            outerTest.done();
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
            this.it("test1", function(innerTest){
              innerTest.assert(false);
              innerTest.done();
            });
          });

      });

      this.it("assertArrayEqual will pass when given equal arrays", function(test) {
          this.assertArrayEqual([1,'2'], [1,'2']);
          this.assertArrayEqual([1,'2',[3,'4']], [1,'2',[3,'4']]);
          test.done();
      });

      this.it("assertArrayEqual will fail when given inequal arrays", function(outerTest) {
        var failed = false;
          var finish = function() {
            clearTimeout(timer);
            outerTest.assert(failed);
            outerTest.done();
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
            this.it('test test', function(innerTest){
              innerTest.assertArrayEqual([1,'2',[3,'4']], [1,'2',[3,'5']]);
              innerTest.done();
            });
          });

      });

    });

    this.context('Stack trace', function() {
      this.it("should be trimmed such that the first line is the client code", function(outerTest) {
        var t = require('../noodleTest')({quiet: true});
          t.context('test context', function() {
            this.it('test test', function(innerTest){
              innerTest.assert(false);

              var firstStackLine = innerTest._failures[0].stack[0];
              // client's test function will be called "testFunction" in the stack trace
              outerTest.assert(firstStackLine.indexOf('._testFunction'));

              innerTest.done();
              outerTest.done();
            });
          });

      });
    });

});