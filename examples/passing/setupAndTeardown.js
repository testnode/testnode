var sys = require('sys');
var test = require('../../testnode')();
test.onFailureExitNonZero();

/**
 * This is a simple exmaple of the 'beforeAll' and 'afterAll' functions.
 *
 * IMPORTANT NOTE: The names of the functions are just to aid readability,
 * but they do not accurately convey how the functions work:
 *
 * The beforeAll and afterAll functions are actually indentical.
 * When they are run is actually dependent on their position in the
 * code. For instance, if you to change his example and rename 'beforeAll'
 * to 'afterAll', and rename the 'afterAll' to 'beforeAll', it would
 * behave identically.
 *
 * Likewise, if you were to move the afterAll function to the top of the
 * context block, you would change the behaviour. The afterAll function
 * would execute BEFORE the tests.
 */

test.context("Example Test Suite", function() {
    this.context("Example of beforeAll and afterAll", function() {
        var a;

        this.beforeAll(function(done){
          a = 0;
          done();
        });

        this.it("Test beforeAll has been called", function(test) {
            a = a + 1;
            test.assertEqual(1, a); // 'a' will be NaN if beforeAll function is not called
            test.done();
        });

        this.it("Test beforeAll has been called once, followed by a test", function(test) {
            a = a + 1;
            test.assertEqual(2, a);
            test.done();
        });

        /* You can't make assertion inside the afterAll function.
         * If you need to, use a test (.it()) instead of afterAll()
         */
        this.afterAll(function(done){
          global.someSideEffect = true;
          sys.puts('setupAndTeardown.js: a = ' + a);
          done();
        });

    });
    this.context("Another context", function() {

        /*
         * The previous context's afterAll function will have been called before we
         * get here.
         */
        this.it("Previous context's afterAll function was called", function(test) {
            test.assert(global.someSideEffect);
            test.done();
        });

    });
});
