/*   Simplified version of a Savitzky-Golay filter
 *      Used for smoothing data
 *
 *   Full version:
 *   https://github.com/mljs/savitzky-golay
 */

function smoothData(data) {
  var windowSize = 5;

  var step = Math.floor(windowSize / 2);

  var ans = new Array(data.length - 2 * step);
  var C = [-2, -1, 0, 1, 2];

  var det = 10;
  for (var k = step; k < (data.length - step); k++) {
    var d = 0;
    for (var l = 0; l < C.length; l++)
      d += C[l] * data[l + k - step] / det;
    ans[k - step] = d;
  }

  return ans;
}
