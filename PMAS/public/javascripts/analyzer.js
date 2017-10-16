/*  Draws visuals using the audio analyzer
 */

var ctx;
var settings = {}

//var colours = ['#2700C4', '#1975FF', '#2CFF8E', '#FFFFFF'];
var colours = ['#C49035', '#FF8037', '#FFF4DE', '#FFFFFF'];

$(
    function setup() {
        settings.frequencyAmp = 50;
        settings.beatThreshold = 50;
        settings.type = "Histogram";
  
        ctx = canvas.getContext('2d');
        recolourCanvas();
        ctx.lineWidth = 0.5;
  
        for (var i = 0; i < 4; i++) {
            $('#colour' + i).val(colours[i]);
        }
    }
);

function updateColour(index, jscolor) {
    colours[index] = '#' + jscolor;
    recolourCanvas();
}

function recolourCanvas() {
    settings.gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    for (i = 0; i < 4; i++) {
        settings.gradient.addColorStop(0.25 + (0.25 * i), colours[i]);
    }
    ctx.fillStyle = settings.gradient;
}

Analyzer = function(analyzer, canvas){
    
    var beatDetector = new WebAudiox.AnalyserBeatDetector(analyzer, canvas);
    var volume = new WebAudiox.Analyser2Volume(analyzer);
    var snowflakes = [];
    
    this.update	= function(){
        
        //update settings
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + settings.lineOpacity/50 * 0.5 + ')';
        
        if (settings.type == "Histogram") {
            displayBarAnalyzer();
        }
        else if (settings.type == "Circular") {
            displayCircleAnalyzer();
        }
        else if (settings.type == "Line") {
            displayLineAnalyzer();
        }
    }
    
    function displayBarAnalyzer() {
        // draw a circle for volume
        translucent = 'rgba(255,255,255,0.1)';
        ctx.fillStyle = translucent;
        var maxRadius = Math.min(canvas.height, canvas.width) * 3;
        var radius = 5 + volume.smoothedValue() * maxRadius;
        ctx.beginPath();
        ctx.arc(canvas.width*1.5/2, canvas.height*0.5/2, radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        
        // draw the spectrum
        var histogram = getHistogramData();
        var barStep = canvas.width / (histogram.length - 1);
        var barWidth = barStep * 0.8;
        ctx.fillStyle = settings.gradient;
        for (var i = 0; i < histogram.length; i++) {
            ctx.fillRect(i * barStep, (1 - histogram[i]) * canvas.height, barWidth, canvas.height);
        }
        
        // beat detection
        if (beatDetector.update()) {
            ctx.fillStyle = 'rgba(255,255,255,0.1)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }
    
    function displayCircleAnalyzer() {
        var maxRadius = Math.min(canvas.height, canvas.width) / 2;
        var radius = 25 + volume.smoothedValue() * maxRadius;
        
        // beat detection -> add snowflakes
        if (beatDetector.update()) {
            for (var i = 0; i < 3; i++) {
                snowflakes.push({
                    x: Math.random() * canvas.width,
                    dx: Math.random() * 2 - 1,
                    y: Math.random() * -3,
                    dy: Math.random() + 3,
                    r: Math.random() + 0.5
                });
            }
        }
        
        // update snowflakes
        for (var i = 0; i < snowflakes.length; i++) {
            var s = snowflakes[i];
            var speedBoostX = volume.rawValue() * 10;
            var speedBoostY = volume.rawValue() * 10;
            
            s.x += s.dx + speedBoostX;
            s.y += s.dy + speedBoostY;
            
            if (s.y > canvas.height)
                snowflakes.splice(i,1);
        }
        
        // draw snowflakes
        ctx.fillStyle = colours[3];
        ctx.beginPath();
        for(var i = 0; i < snowflakes.length; i++) {
            var s = snowflakes[i];
            ctx.moveTo(s.x, s.y);
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2, true);
        }
        ctx.closePath();
        ctx.fill();
        
        // draw horizontal histogram for frequency
        var histogram = getHistogramData();
        var barStep = radius * 2 / (histogram.length - 1);
        var barHeight = barStep * 0.5;
        
        ctx.fillStyle = colours[2];
        for (var i = 0; i < histogram.length; i++) {
            var height = i * barStep;
            var width = histogram[i] * canvas.width;
            ctx.fillRect((canvas.width - width) / 2 , i * barStep + canvas.height / 2 - radius, width, barHeight);
        }
        
        // draw a circle for volume
        var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0,
                                                canvas.width / 2, canvas.height / 2, radius);
        gradient.addColorStop(0.5, colours[1]);
        gradient.addColorStop(1, colours[0]);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.fill();
    }
    
    function getHistogramData() {
        // get the average for the first channel
        var freqData = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(freqData);
        
        // normalized
        var histogram = new Float32Array(10);
        WebAudiox.ByteToNormalizedFloat32Array(freqData, histogram);
        
        // enlarge array
        var histogramEnlarged = new Float32Array(20);
        for (var i = 0; i < 10; i++) {
            histogramEnlarged[9 - i] = histogram[i];
            if(i < 9)
                histogramEnlarged[10 + i] = (histogram[i] + histogram[i + 1]) / 2;
            else
                histogramEnlarged[10 + i] = histogram[i];
        }
        
        // amplify the histogram
        for(var i = 0; i < histogramEnlarged.length; i++) {
            histogramEnlarged[i] = histogramEnlarged[i] * settings.frequencyAmp / 50;
            if (histogramEnlarged[i] > 1)
                histogramEnlarged[i] = 1;
        }
        return histogramEnlarged;
    }
}
