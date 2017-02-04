// @namespace defined WebAudiox namespace
var WebAudiox	= WebAudiox	|| {};

WebAudiox.Analyzer = function(analyzer, canvas){
    var canvasCtx		= canvas.getContext("2d");
    
    var gradient	= canvasCtx.createLinearGradient(0,0,0,canvas.height);
    gradient.addColorStop(1.00,'#000000');
    gradient.addColorStop(0.75,'#ff0000');
    gradient.addColorStop(0.25,'#ffff00');
    gradient.addColorStop(0.00,'#ffffff');
    canvasCtx.fillStyle	= gradient;
    
    canvasCtx.lineWidth	= 5;
    canvasCtx.strokeStyle	= "rgb(255, 255, 255)";
    
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
    }	
}

