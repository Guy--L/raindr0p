var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fileUpload = require('express-fileupload');

var index = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(fileUpload());

app.use('/', index);
app.use('/users', users);

const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/guy';

app.post('/upload', function (req, res) {
    if (!req.files)
        return res.status(400).send('No files were uploaded.');

    let sampleFile = req.files.sampleFile;
    if (sampleFile == null)
        return res.status(400).send('No files were uploaded.');

    sampleFile.mv('uploads/'+sampleFile.name, function (err) {
        if (err)
            return res.status(500).send(err);
        if (connectionString.indexOf('localhost')==-1)
	    pg.defaults.ssl = true;
	pg.connect(connectionString, (er2, client, done) => {
            if (er2) {
                done();
                console.log(er2);
                return res.status(500).json({ success: false, data: er2 });
            }
            client.query("insert into raindrop (filename, sourceid, stamp) values ($1, $2, timezone('UTC', now()))",
                [sampleFile.name, req.body.sourceid],
                function (er3, result) {
                    if (er3) {
                        console.log(er3);
                    } 
                });
            done();
        });
        res.send('File uploaded!');
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not *Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


module.exports = app;
