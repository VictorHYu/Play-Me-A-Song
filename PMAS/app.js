var express = require('express');
var path = require('path');

var formidable = require('formidable');
var fs = require('fs');

var mm = require('musicmetadata');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

// displays homepage when site is loaded
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

// handles file uploads
app.post('/upload', function(req, res){
    console.log("Received file upload");
         
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, 'uploadedFile.mp3'));
    });
         
    form.parse(req, function() {
       res.writeHead(200, {'content-type': 'text/plain'});
       res.write('Received Upload');
       res.end();
    });
});

// handles retrieving file metadata
app.get('/musicmetadata', function(req, res) {
    console.log("Received metadata request");
    
    // get music metadata
    var readableStream = fs.createReadStream(path.join(__dirname, 'uploads/uploadedFile.mp3'));
    var parser = mm(readableStream, function (err, metadata) {
        if (err)
            throw err;
        console.log(metadata);
                    
        // send response
        res.setHeader('Content-Type', 'application/json');
        res.send(metadata);
                    
        readableStream.close();
    });
});

module.exports = app;
