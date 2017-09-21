var defaultOptions = {
    windowSize: 5,
    derivative: 1,
    polynomial: 2,
    pad: 'none',
    padValue: 'replicate'
};

function smoothData(data, h) {
    var options = defaultOptions;
    if ((options.windowSize % 2 === 0) || (options.windowSize < 5) || !(Number.isInteger(options.windowSize)))
        throw new RangeError('Invalid window size (should be odd and at least 5 integer number)');
    if ((options.derivative < 0) || !(Number.isInteger(options.derivative)))
        throw new RangeError('Derivative should be a positive integer');
    if ((options.polynomial < 1) || !(Number.isInteger(options.polynomial)))
        throw new RangeError('Polynomial should be a positive integer');

    var step = Math.floor(options.windowSize / 2);

    /*if (options.pad === 'pre') {
        data = padArray(data, {size: step, value: options.padValue});
    }*/

    var ans =  new Array(data.length - 2*step);
    var C = [-2,-1,0,1,2], norm = 10;

    var det = norm * Math.pow(h, options.derivative);
    for (var k = step; k < (data.length - step); k++) {
        var d = 0;
        for (var l = 0; l < C.length; l++)
            d += C[l] * data[l + k - step] / det;
        ans[k - step] = d;
    }

    /*if (options.pad === 'post') {
        ans = padArray(ans, {size: step, value: options.padValue});
    }*/

    return ans;
}
