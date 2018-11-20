var express = require('express');
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
var mm = require('musicmetadata');

var index = require('./routes/index');
var app = express();

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'uploads')));

/******************** Display index */
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

/******************** File uploads */
app.post('/upload', function (req, res) {
    console.log("Received file upload");

    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', function (field, file) {
        fs.rename(file.path, path.join(form.uploadDir, 'uploadedFile.mp3'));
    });

    form.parse(req, function () {
        res.writeHead(200, { 'content-type': 'text/plain' });
        res.write('Received Upload');
        res.end();
    });
});

/******************** Music Metadata */
app.get('/musicmetadata', function (req, res) {
    console.log("Received metadata request");

    // get music metadata
    var readableStream = fs.createReadStream(path.join(__dirname, req.query.filepath));
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
