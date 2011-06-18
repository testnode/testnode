module.exports = function(main) {

    /* Ensure script exits non-zero on test failure, to ease use in
     * Continuous Integration environments.
     * Client code must call onFailureExitNonZero() to get this feature
     */

    var seenFailure = false;
    var seenFailureCallback = function() {
      seenFailure = true;
    };
    main.on('assertionFailed', seenFailureCallback);
    main.on('testFlunk', seenFailureCallback);
    main.on('uncaughtException', seenFailureCallback);

    var calledOnFailureExitNonZero = false;
    main.onFailureExitNonZero = function() {
        if (!calledOnFailureExitNonZero) {
          calledOnFailureExitNonZero = true;
          process.on('exit', function(a) {
              if (seenFailure) {
                  /* Hack */
                  process.kill(process.pid, 'SIGHUP');
              }
          });
        }
    };

    main.handleUncaughtExceptions = function() {
        process.on('uncaughtException', function (error) {
            main.emit('uncaughtException', error);
        });
    };

};