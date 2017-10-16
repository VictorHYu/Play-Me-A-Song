var source;         // audio source
var isPlaying;      // boolean - if audio is playing
var musicFile = '/music/A Sky Full of Stars.mp3';   // default music file

function play() {
    //stop music
    if (source) {
        source.stop(0);
        isPlaying = false;
    }
    
    var context	= new AudioContext();

    // Create lineOut
    var lineOut	= new WebAudiox.LineOut(context);
    lineOut.volume = 0.2;

    var analyzer = context.createAnalyser();
    analyzer.connect(lineOut.destination);
    lineOut.destination	= analyzer;

    // create and add the canvas
    var canvas = document.getElementById( 'canvas' );
    var ctx = canvas.getContext( '2d' );

    // create the analyzer object
    var analyzerCanvas = new Analyzer(analyzer, canvas);

    // load music and play it immediately
    WebAudiox.loadBuffer(context, musicFile, function(buffer) {
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop = false;
        source.connect(lineOut.destination);
        source.start(0);
        isPlaying = true;
                         
        source.onended = function() {
            isPlaying = false;
        };
                         
        // animate
        requestAnimationFrame(function update() {
            if (isPlaying) {
                //loop
                requestAnimationFrame(update);
                // clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                // update visuals
                analyzerCanvas.update();
            }
            else {
                // clear the canvas
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                context.close();
            }
        });
    });
}
