function drawCanvas () {
    var context	= new AudioContext();

    // Create lineOut
    var lineOut	= new WebAudiox.LineOut(context);
    lineOut.volume	= 0.2;

    var analyzer	= context.createAnalyser();
    analyzer.connect(lineOut.destination);
    lineOut.destination	= analyzer;

    //get file input
    musicFile = "/javascripts/A Sky Full of Stars.mp3";
    
    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, musicFile, function(buffer){
        var source	= context.createBufferSource();
        source.buffer	= buffer;
        source.loop	= true;
        source.connect(lineOut.destination);
        source.start(0);
    });

    // create and add the canvas
    var canvas = document.getElementById("canvas");
    var ctx		= canvas.getContext("2d");

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
