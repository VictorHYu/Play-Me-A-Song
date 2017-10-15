var express = require('express');
var path = require('path');

var formidable = require('formidable');
var fs = require('fs');

var mm = require('musicmetadata');

var index = require('./routes/index');

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

/******************** Postgres Integration */
const { Client } = require('pg');
const client = new Client({
                          connectionString: process.env.DATABASE_URL,
                          ssl: true,
                          });

client.connect();

client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
             if (err) throw err;
             for (let row of res.rows) {
             console.log(JSON.stringify(row));
             }
             client.end();
             });

module.exports = app;
