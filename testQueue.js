/* Handles running the test sequentially */
module.exports = (function() {
    var begun = false;
    var q = {};
    q.array = [];
    q.put = function(test) {
      q.array.push(test);
      if (!begun) {
        begun = true;
        q.next();
      }
    };
    q.next = function() {
      if (q.array.length > 0) {
        var top = q.array[0];
        q.array = q.array.slice(1);
        var onDone = function() {
          q.next();
        };
        top.on('testDone', onDone);
        top.on('setupDone', onDone);
        top._call();
      } else {
        begun = false;
      }
    };
    return q;
});