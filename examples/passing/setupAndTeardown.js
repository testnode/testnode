var sys = require('sys');
var test = require('../../testnode')();
test.onFailureExitNonZero();

/**
 * This is a simple exmaple of the 'run' function, which can be used
 * for simple setup and teardown.
 *
 * The callbacks passed to run are executed in the order they are
 * defined.
 */

test.context("Example Test Suite", function() {
    this.context("Example of using run() for setup and teardown", function() {
        var a;

        this.run(function(done){
          a = 0;
          done();
        });

        this.it("Test run callback has been called", function(test) {
            a = a + 1;
            test.assertEqual(1, a); // 'a' will be NaN if beforeAll function is not called
            test.done();
        });

        this.it("Test run() has been called once, followed by a test", function(test) {
            a = a + 1;
            test.assertEqual(2, a);
            test.done();
        });

        /* You can't make assertion inside the run function.
         * If you need to, use a test (.it()) instead of run()
         */
        this.run(function(done){
          global.someSideEffect = true;
          sys.puts('setupAndTeardown.js: a = ' + a);
          done();
        });

    });
    this.context("Another context", function() {

        /*
         * The previous context's run function will have been called before we
         * get here.
         */
        this.it("Previous context's last run() function was called", function(test) {
            test.assert(global.someSideEffect);
            test.done();
        });

    });
});
