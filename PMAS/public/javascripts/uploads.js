//handles file uploads from users
$(function(){
    $("#fileSelector").on("change",function(){
        alert("Upload Starting!");
                             
        var files = $(this).get(0).files;

        if (files.length > 0) {
            var formData = new FormData();
            var file = files[0];
            formData.append('uploads[]', file, file.name);
                                    
            $.ajax({
                url: '/upload',
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(data){
                    console.log('Upload successful!\n' + data);
                },
                xhr: function() {
                    // create an XMLHttpRequest
                    var xhr = new XMLHttpRequest();
                    return xhr;
                }
            });
        }
    });
});
