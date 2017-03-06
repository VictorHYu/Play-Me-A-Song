var express = require('express');
var path = require('path');

var formidable = require('formidable');
var fs = require('fs');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));

//displays homepage when site is loaded
app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.use(express.static(path.join(__dirname, 'public')));

//handles file uploads
app.post('/upload', function(req, res){
    var form = new formidable.IncomingForm();
    form.uploadDir = path.join(__dirname, '/uploads');

    form.on('file', function(field, file) {
        fs.rename(file.path, path.join(form.uploadDir, "uploadedFile"));
    });

    form.parse(req);
});

module.exports = app;
