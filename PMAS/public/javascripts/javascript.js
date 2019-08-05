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
    play();
  });

  // change selected song when a new one is chosen
  $( '#song-dropdown' ).change(function() {
    musicFile = presets[$( this )[0].selectedIndex];
  });

  // change analyzer type
  $( '#type-dropdown' ).change(function() {
    settings.type = $( this )[0].selectedIndex;
  });

  // settings change handler
  $( 'input' ).change(function() {
    for (var setting in settings) {
      if (this.id === setting) {
        settings[setting] = this.value;
      }
    }
  });
});

var presets = [
  '/music/A Sky Full of Stars.mp3',
  '/music/Airplanes.mp3',
  '/music/Fade.mp3',
  '/music/Hey Soul Sister.mp3',
  '/music/Jar of Hearts.mp3',
  '/music/Maps.mp3',
  '/music/Perfect.mp3',
  '/music/Save Me.mp3',
  '/music/Talking to the Moon.mp3',
  '/music/What I\'ve Done.mp3',
  '/uploadedFile.mp3'
];
