$( document ).ready(function() {
    // disables the start button for 5 seconds
    function disableButton() {
        document.getElementById( 'start-button' ).disabled = true;
        setTimeout(function() {
           document.getElementById( 'start-button' ).disabled = false;
        }, 5000);
    };
           
    $( '#start-button' ).click(function(e) {
        disableButton();
        pickAudio();
        drawCanvas();
    });

    // change selected song when a new one is chosen
    $( '.song-selection' ).click(function(e) {
        $( '#selected-song' ).html($( this ).html());
    });
});
