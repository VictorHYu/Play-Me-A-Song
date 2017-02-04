function drawCanvas () {
    var context	= new AudioContext();

    // Create lineOut
    var lineOut	= new WebAudiox.LineOut(context);
    lineOut.volume	= 0.2;

    var analyzer	= context.createAnalyser();
    analyzer.connect(lineOut.destination);
    lineOut.destination	= analyzer;

    //get file input
    var musicFile = document.getElementById("musicFile");
    
    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, musicFile, function(buffer){
        var source	= context.createBufferSource();
        source.buffer	= buffer;
        source.loop	= true;
        source.connect(lineOut.destination);
        source.start(0);
    });

    // create and add the canvas
    var canvas	= document.createElement('canvas');
    canvas.width	= window.innerWidth/2;
    canvas.height	= window.innerHeight/2;
    var ctx		= canvas.getContext("2d");
    document.body.appendChild(canvas);

    // create the object
    var analyzerCanvas	= new WebAudiox.Analyzer(analyzer, canvas);

    // loop and update
    requestAnimationFrame(function update() {
        requestAnimationFrame(update);
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // put the sound in the canvas
        analyzerCanvas.update();
    })
}
