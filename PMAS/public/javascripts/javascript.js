/*  Contains functions and event handlers for UI controls
 */

$( document ).ready(function() {
                    
    // disables the start button for 5 seconds
    function disableButton() {
        document.getElementById( 'start-button' ).disabled = true;
        setTimeout(function() {
           document.getElementById( 'start-button' ).disabled = false;
        }, 5000);
    };
   
    // start button handler
    $( '#start-button' ).click(function() {
        disableButton();
        pickAudio();
        play();
    });

    // change selected song when a new one is chosen
    $( '.song-selection' ).click(function() {
        $( '#selected-song' ).html($( this ).html());
    });
                    
    // change analyzer type
    $( '.analyzer-type' ).click(function() {
        settings.type = $( this ).html();
    });
          
    // settings change handler
    $( 'input' ).change(function() {
        for (var setting in settings) {
            if (this.id === setting) {
                settings[setting] = this.value;
            }
        }
    });
                    
    function pickAudio() {
        var songName = $( '#selected-song' ).html();
                    
        if (songName in presets) {
            musicFile = presets[songName];
        }
        else {
            console.log("Error, can't find song");
        }
    }
});

var presets = {
    "A Sky Full of Stars - Coldplay":   '/music/A Sky Full of Stars.mp3',
    "Airplanes - B.o.B":                '/music/Airplanes.mp3',
    "Fade - Alan Walker":               '/music/Fade.mp3',
    "Hey Soul Sister - Train":          '/music/Hey Soul Sister.mp3',
    "Jar of Hearts - Christina Perri":  '/music/Jar of Hearts.mp3',
    "Maps - Maroon 5":                  '/music/Maps.mp3',
    "Perfect - Hedley":                 '/music/Perfect.mp3',
    "Save Me - BTS":                    '/music/Save Me.mp3',
    "Talking to the Moon - Bruno Mars": '/music/Talking to the Moon.mp3',
    "What I've Done - Linkin Park":     '/music/What I\'ve Done.mp3',
    "Uploaded File":                    '/uploadedFile.mp3'
};
