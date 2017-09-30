// handles file uploads from users
$( function() {
  $("#file-selector").on("change", function() {
    var files = $(this).get(0).files;
    
    // file upload success
    if (files.length > 0) {
                         
      alert("Upload Starting!");
                         
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
          console.log(res);
        },
        xhr: function() {
          var xhr = new XMLHttpRequest();
          return xhr;
        }
      })
                  
      // get file metadata from server
      $.ajax({
        url: '/musicmetadata',
        type: 'GET',
        data: 'placeholder',
        success: function(res) {
          console.log("Music metadata retrieved!\n" + res);
        },
        dataType: 'json'
      });
    }
  });
});
