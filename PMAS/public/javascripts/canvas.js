var source;
var musicFile = '/music/A Sky Full of Stars.mp3';

function drawCanvas() {
    var context	= new AudioContext();

    // Create lineOut
    var lineOut	= new WebAudiox.LineOut(context);
    lineOut.volume = 0.2;

    var analyzer = context.createAnalyser();
    analyzer.connect(lineOut.destination);
    lineOut.destination	= analyzer;
    
    //stop music
    if (source) {
        source.stop(0);
    }
    
    // load music and play it immediately
    WebAudiox.loadBuffer(context, musicFile, function(buffer){
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop	= false;
        source.connect(lineOut.destination);
        source.start(0);
    });

    // create and add the canvas
    var canvas = document.getElementById('canvas');
    var ctx = canvas.getContext('2d');

    // create the object
    var analyzerCanvas = new WebAudiox.Analyzer(analyzer, canvas);
    var beatDetector = new WebAudiox.AnalyserBeatDetector(analyzer, canvas);

    // loop and update
    requestAnimationFrame(function update() {
        requestAnimationFrame(update);
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // put the sound in the canvas
        analyzerCanvas.update();
        beatDetector.update();
    });
    
    //clear canvas at the end
}

var presets = {
    "A Sky Full of Stars - Coldplay": '/music/A Sky Full of Stars.mp3',
    "Airplanes - B.o.B": '/music/Airplanes.mp3',
    "Fade - Alan Walker": '/music/Fade.mp3',
    "Hey Soul Sister - Train": '/music/Hey Soul Sister.mp3',
    "Jar of Hearts - Christina Perri": '/music/Jar of Hearts.mp3',
    "Maps - Maroon 5": '/music/Maps.mp3',
    "Perfect - Hedley": '/music/Perfect.mp3',
    "Save Me - BTS": '/music/Save Me.mp3',
    "Talking to the Moon - Bruno Mars": '/music/Talking to the Moon.mp3',
    "What I've Done - Linkin Park": '/music/What I\'ve Done.mp3',
    "Uploaded File": '/uploadedFile.mp3'
};

function pickAudio() {
    var songName = $('#selected-song').html();
    
    if (songName in presets) {
        musicFile = presets[songName];
    }
}
