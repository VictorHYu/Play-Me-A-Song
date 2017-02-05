// @namespace defined WebAudiox namespace
var WebAudiox	= WebAudiox	|| {};

var canvasCtx;
var gradient;

var c4 = '#ffffff';
var c3 = '#ffff00';
var c2 = '#ff0000';
var c1 = '#000000';

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
    
    canvasCtx.lineWidth	= 1;
    canvasCtx.strokeStyle	= "rgba(255, 255, 255, 0.2)";
    
    var analyzer2volume	= new WebAudiox.Analyser2Volume(analyzer);
    
    this.update	= function(){
        
        // draw a circle
        var maxRadius	= Math.min(canvas.height, canvas.width) * 0.3;
        var radius	= 1 + analyzer2volume.smoothedValue() * maxRadius;
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
        // draw the spectrum
        var barStep	= canvas.width / (histogram.length-1);
        var barWidth	= barStep*0.8;
        canvasCtx.fillStyle	= gradient;
        for(var i = 0; i < histogram.length; i++){
            canvasCtx.fillRect(i*barStep, (1-histogram[i])*canvas.height, barWidth, canvas.height);
        }

        //		display ByteTimeDomainData
        // get the average for the first channel
        var timeData	= new Uint8Array(analyzer.fftSize);
        analyzer.getByteTimeDomainData(timeData);
        // normalized
        var histogram	= new Float32Array(60);
        WebAudiox.ByteToNormalizedFloat32Array(timeData, histogram);
        
        // amplify the histogram
        for(var i = 0; i < histogram.length; i++) {
            histogram[i]	= (histogram[i]-0.5)/3+0.5
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

