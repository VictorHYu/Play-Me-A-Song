var UPLOADED_SONG_INDEX = 10;

// handles file uploads from users
$( function() {
  $( "#file-selector" ).on("change", function() {
    var files = $(this).get(0).files;

    // file upload success
    if (files.length > 0) {
      $( '#upload-status' ).text("Uploading...");

      // post file data to server
      var formData = new FormData();
      var file = files[0];
      formData.append('uploads[]', file, file.name);

      $.ajax({
        url: '/upload',
        type: 'POST',
        data: formData,
        processData: false, // processes data and changes it into a query string
        contentType: false,
        success: function(res) {
          $( '#upload-status' ).text("Complete");
          document.getElementById("song-dropdown").selectedIndex = UPLOADED_SONG_INDEX;
          $( '#song-dropdown' ).change();
        },
        xhr: function() {
          var xhr = new XMLHttpRequest();
          return xhr;
        }
      })
    }
  });
});
