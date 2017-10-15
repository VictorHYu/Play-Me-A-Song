var WebAudiox = WebAudiox || {};

var ctx;
var gradient;
var settings = {}

$(
    function setup() {
        settings.lineOpacity    = 50;
        settings.lineAmp        = 50;
        settings.barAmp         = 50;
        settings.threshold      = 50;
  
        ctx = canvas.getContext('2d');
        recolourCanvas();
        ctx.lineWidth = 0.5;
    }
);

var colours = ['#2700C4', '#1975FF', '#2CFF8E', '#FFFFFF'];

function updateColour(index, jscolor) {
    colours[index] = '#' + jscolor;
    recolourCanvas();
}

function recolourCanvas() {
    gradient = ctx.createLinearGradient(0,0,0,canvas.height);
    
    for (i = 0; i < 4; i++) {
        gradient.addColorStop(0.25 + (0.25 * i), colours[i]);
    }

    ctx.fillStyle = gradient;
}

// WebAudiox Analyzer 
WebAudiox.Analyzer = function(analyzer, canvas){
    
    var beatDetector = new WebAudiox.AnalyserBeatDetector(analyzer, canvas);
    var volume = new WebAudiox.Analyser2Volume(analyzer);
    
    this.update	= function(){
        
        //update settings
        ctx.strokeStyle = 'rgba(255, 255, 255, ' + settings.lineOpacity/50 * 0.5 + ")";
        
        // draw a circle
        gradientCircle = 'rgba(255,255,255,0.1)';
        ctx.fillStyle = gradientCircle;
        var maxRadius = Math.min(canvas.height, canvas.width) * 1;
        var radius = 5 + volume.smoothedValue() * maxRadius * 3;
        ctx.beginPath();
        ctx.arc(canvas.width*1.5/2, canvas.height*0.5/2, radius, 0, Math.PI*2, true);
        ctx.closePath();
        ctx.fill();
        
        //        display ByteTimeDomainData
        // get the average for the first channel
        var timeData = new Uint8Array(analyzer.fftSize);
        analyzer.getByteTimeDomainData(timeData);
        // normalized
        var histogram = new Float32Array(60);
        WebAudiox.ByteToNormalizedFloat32Array(timeData, histogram);
        
        // amplify the histogram for the line
        for(var i = 0; i < histogram.length; i++) {
            histogram[i] = ((histogram[i]-0.5)/3*settings.lineAmp/50+0.5);
        }
        // draw the spectrum
        var barStep    = canvas.width / (histogram.length-1)
        ctx.beginPath()
        for(var i = 0; i < histogram.length; i++) {
            histogram[i] = (histogram[i]-0.5)*1.5+0.5
            ctx.lineTo(i*barStep, (1-histogram[i])*canvas.height)
        }
        ctx.stroke();
        
        //		display	ByteFrequencyData
        // get the average for the first channel
        var freqData = new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(freqData);
        // normalized
        var histogram = new Float32Array(10);
        WebAudiox.ByteToNormalizedFloat32Array(freqData, histogram);
        
        var histogramEnlarged = new Float32Array(20);
        for (var i = 0; i < 10; i++) {
            histogramEnlarged[9-i] = histogram[i];
            if(i < 9)
                histogramEnlarged[10+i] = (histogram[i] + histogram[i+1])/2;
            else
                histogramEnlarged[10+i] = histogram[i];
        }
        
        // amplify the histogram
        for(var i = 0; i < histogramEnlarged.length; i++) {
            histogramEnlarged[i] = (histogramEnlarged[i])*settings.barAmp/50;
            if (histogramEnlarged[i] > 1)
                histogramEnlarged[i] = 1;
        }
        
        // draw the spectrum
        var barStep	= canvas.width / (histogramEnlarged.length-1);
        var barWidth = barStep*0.8;
        ctx.fillStyle	= gradient;
        for(var i = 0; i < histogramEnlarged.length; i++){
            ctx.fillRect(i*barStep, (1-histogramEnlarged[i])*canvas.height, barWidth, canvas.height);
        }
    }	
}
