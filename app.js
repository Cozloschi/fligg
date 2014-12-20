var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var http = require('http');

var routes = require('./routes/index');
var users = require('./routes/users');
var requests = require('./routes/requests');
var profile = require('./routes/profile');
var posts = require('./routes/posts');
var files = require('./routes/files');

var app =express();





// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/requests',requests);
app.use('/profile',profile);
app.use('/posts',posts);
app.use('/files',files);


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var io = require('socket.io').listen(app.listen(3000));

io.sockets.on('connection', function (socket) {
    socket.emit('message', { message: 'welcome to the chat' });
    socket.on('send', function (data) {
        io.sockets.emit('message', data);
    });
	

});


//cronjobs

//mysql

var mysql = require('mysql');
var conn  = mysql.createConnection({
 host     : 'localhost',
 user     : 'root',
 password : '',
 database : 'quotes',
});

//write to file 
var fs = require('fs');
var os = require('os');

setInterval(function(){
  
  console.log('Cronjob Interval');
  
  var new_date = new Date();
  var data = new_date.getDay()+' '+new_date.getMonth()+' - '+new_date.getMinutes();
  
  conn.query("Delete from quotes where NOT EXISTS(Select * from users where users.user_id = quotes.user_id limit 1)",function(err,rows){
  
   
   
   if(!err)
   {
    fs.appendFile('log.txt','[ '+data+' ] Deleted '+rows.affectedRows+' quotes '+os.EOL,function(erro){
	 if(erro)
	  throw erro;
    });
   }
   else
    {
	 fs.appendFile('log.txt','[ '+data+' ] Deleted error quotes - '+err+' '+os.EOL,function(erro){
	  if(erro)
	   throw erro;
     });
	
	}
   
  });
 
 
},60000 * 60); //1h


console.log('app listen on port 3000');
