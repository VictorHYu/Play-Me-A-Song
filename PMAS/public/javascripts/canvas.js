var source;
var musicFile = "/music/A Sky Full of Stars.mp3";

function drawCanvas() {
    var context	= new AudioContext();

    // Create lineOut
    var lineOut	= new WebAudiox.LineOut(context);
    lineOut.volume	= 0.2;

    var analyzer	= context.createAnalyser();
    analyzer.connect(lineOut.destination);
    lineOut.destination	= analyzer;
    
    //stop music
    if (source) {
        source.stop(0);
    }
    
    // load a sound and play it immediately
    WebAudiox.loadBuffer(context, musicFile, function(buffer){
        source = context.createBufferSource();
        source.buffer = buffer;
        source.loop	= false;
        source.connect(lineOut.destination);
        source.start(0);
    });

    // create and add the canvas
    var canvas = document.getElementById("canvas");
    var ctx		= canvas.getContext("2d");

    // create the object
    var analyzerCanvas	= new WebAudiox.Analyzer(analyzer, canvas);
    var beatDetector = new WebAudiox.AnalyserBeatDetector(analyzer, canvas);

    // loop and update
    requestAnimationFrame(function update() {
        requestAnimationFrame(update);
        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // put the sound in the canvas
        analyzerCanvas.update();
        beatDetector.update();
    })
    //clear canvas at the end
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

var A_Sky_Full_of_Stars     = "/music/A Sky Full of Stars.mp3";
var Airplanes               = "/music/Airplanes.mp3";
var Fade                    = "/music/Fade.mp3";
var Hey_Soul_Sister         = "/music/Hey Soul Sister.mp3";
var Jar_of_Hearts           = "/music/Jar of Hearts.mp3";
var Maps                    = "/music/Maps.mp3";
var Perfect                 = "/music/Perfect.mp3";
var Save_Me                 = "/music/Save Me.mp3";
var Talking_to_the_Moon     = "/music/Talking to the Moon.mp3";
var What_Ive_Done           = "/music/What I've Done.mp3";
var Uploaded_File           = "/uploadedFile.mp3";

function pickAudio() {
    var temp = document.getElementById("selected-song").innerHTML;
    if (temp === "Airplanes - B.o.B")
        musicFile = Airplanes;
    else if (temp === "Fade - Alan Walker")
        musicFile = Fade;
    else if (temp === "Hey Soul Sister - Train")
        musicFile = Hey_Soul_Sister;
    else if (temp === "Jar of Hearts - Christina Perri")
        musicFile = Jar_of_Hearts;
    else if (temp === "Maps - Maroon 5")
        musicFile = Maps;
    else if (temp === "Perfect - Hedley")
        musicFile = Perfect;
    else if (temp === "Save Me - BTS")
        musicFile = Save_Me;
    else if (temp === "Talking to the Moon - Bruno Mars")
        musicFile = Talking_to_the_Moon;
    else if (temp === "What I've Done - Linkin Park")
        musicFile = What_Ive_Done;
    else if (temp === "Uploaded File")
        musicFile = Uploaded_File;
}
