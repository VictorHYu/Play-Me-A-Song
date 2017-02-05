// @namespace defined WebAudiox namespace
var WebAudiox	= WebAudiox	|| {};

var canvasCtx;
var gradient;

var lineOpacityMod  = 50;
var lineAmpMod      = 50;
var barAmpMod       = 50;
var thresholdMod    = 50;

$( function() {
  $("input").change(function() {
    if (this.id === "lineOpacity")
        lineOpacityMod = this.value;
    else if (this.id === "lineAmp")
        lineAmpMod = this.value;
    else if (this.id === "barAmp")
        barAmpMod = this.value;
    else if (this.id === "threshold")
        thresholdMod = this.value;
  });
});
  
var c4 = '#FFFFFF';
var c3 = '#2CFF8E';
var c2 = '#1975FF';
var c1 = '#2700C4';

function update1(jscolor) {
    c1 = '#' + jscolor;
    updateAllColors();
}

function update2(jscolor) {
    c2 = '#' + jscolor;
    updateAllColors();
}

function update3(jscolor) {
    c3 = '#' + jscolor;
    updateAllColors();
}

function update4(jscolor) {
    c4 = '#' + jscolor;
    updateAllColors();
}

function updateAllColors() {
    gradient	= canvasCtx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(1.00,c1);
    gradient.addColorStop(0.75,c2);
    gradient.addColorStop(0.25,c3);
    gradient.addColorStop(0.00,c4);
    canvasCtx.fillStyle	= gradient;
}

WebAudiox.Analyzer = function(analyzer, canvas){
    canvasCtx		= canvas.getContext("2d");
    updateAllColors();
    
    canvasCtx.lineWidth	= 0.5;
    
    var analyzer2volume	= new WebAudiox.Analyser2Volume(analyzer);
    
    this.update	= function(){
        
        //update settings
        canvasCtx.strokeStyle	= "rgba(255, 255, 255, " + lineOpacityMod/50 * 0.5 + ")";
        
        // draw a circle
        gradientCircle	= "rgba(255,255,255,0.1)";
        canvasCtx.fillStyle = gradientCircle;
        var maxRadius	= Math.min(canvas.height, canvas.width) * 1;
        var radius	= 5 + analyzer2volume.smoothedValue() * maxRadius*3;
        canvasCtx.beginPath();
        canvasCtx.arc(canvas.width*1.5/2, canvas.height*0.5/2, radius, 0, Math.PI*2, true);
        canvasCtx.closePath();
        canvasCtx.fill();
        
        //		display	ByteFrequencyData
        // get the average for the first channel
        var freqData	= new Uint8Array(analyzer.frequencyBinCount);
        analyzer.getByteFrequencyData(freqData);
        // normalized
        var histogram	= new Float32Array(10);
        WebAudiox.ByteToNormalizedFloat32Array(freqData, histogram);
        
        var histogramEnlarged = new Float32Array(20);
        for (var i = 0; i < 10; i++) {
            histogramEnlarged[9-i] = histogram[i];
            if(i < 9)
            histogramEnlarged[10+i] = (histogram[i] + histogram[i+1])/2;
            else histogramEnlarged[10+i] = histogram[i];
        }
        
        // amplify the histogram
        for(var i = 0; i < histogramEnlarged.length; i++) {
            histogramEnlarged[i]	= (histogramEnlarged[i])*barAmpMod/50;
            if ( histogramEnlarged[i] > 1)
                histogramEnlarged[i] = 1;
        }
        
        // draw the spectrum
        var barStep	= canvas.width / (histogramEnlarged.length-1);
        var barWidth	= barStep*0.8;
        canvasCtx.fillStyle	= gradient;
        for(var i = 0; i < histogramEnlarged.length; i++){
            canvasCtx.fillRect(i*barStep, (1-histogramEnlarged[i])*canvas.height, barWidth, canvas.height);
        }

        //		display ByteTimeDomainData
        // get the average for the first channel
        var timeData	= new Uint8Array(analyzer.fftSize);
        analyzer.getByteTimeDomainData(timeData);
        // normalized
        var histogram	= new Float32Array(60);
        WebAudiox.ByteToNormalizedFloat32Array(timeData, histogram);
        
        // amplify the histogram for the line
        for(var i = 0; i < histogram.length; i++) {
            histogram[i]	= ((histogram[i]-0.5)/3*lineAmpMod/50+0.5);
        }
        // draw the spectrum
        var barStep	= canvas.width / (histogram.length-1)
        canvasCtx.beginPath()
        for(var i = 0; i < histogram.length; i++) {
            histogram[i]	= (histogram[i]-0.5)*1.5+0.5
            canvasCtx.lineTo(i*barStep, (1-histogram[i])*canvas.height)
        }
        canvasCtx.stroke()
    }	
}

WebAudiox.AnalyserBeatDetector	= function(analyser, onBeat){
    // arguments default values
    this.holdTime		= 1
    this.decayRate		= 0.97
    this.minVolume		= 0.6
    this.frequencyBinCount	= 100
    
    var holdingTime	= 0
    this.update	= function(delta){
        var threshold	= this.minVolume + 0.2*thresholdMod/50;
        var rawVolume	= WebAudiox.AnalyserBeatDetector.compute(analyser, this.frequencyBinCount)
        if( holdingTime > 0 ){
            holdingTime	-= delta
            holdingTime	= Math.max(holdingTime, 0)
        }else if( rawVolume > threshold ){
            canvasCtx.fillStyle = "rgba(255,255,255,0.1)";
            canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
            
            holdingTime	= this.holdTime;
            threshold	= rawVolume * 1.1;
            threshold	= Math.max(threshold, this.minVolume);
        }else{
            threshold	*= this.decayRate;
            threshold	= Math.max(threshold, this.minVolume);
        }
    }
}

WebAudiox.AnalyserBeatDetector.compute	= function(analyser, width, offset){
    // handle paramerter
    width		= width  !== undefined ? width	: analyser.frequencyBinCount;
    offset		= offset !== undefined ? offset	: 0;
    // inint variable
    var freqByte	= new Uint8Array(analyser.frequencyBinCount);
    // get the frequency data
    analyser.getByteFrequencyData(freqByte);
    // compute the sum
    var sum	= 0;
    for(var i = offset; i < offset+width; i++){
        sum	+= freqByte[i];
    }
    // complute the amplitude
    var amplitude	= sum / (width*256-1);
    // return ampliture
    return amplitude;
}

