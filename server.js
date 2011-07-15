var util = require('util'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    server,
    socket,
    PORT = process.env.C9_PORT,
    HOST = '0.0.0.0';

var log = util.puts;

// change directory to location of server.js (i.e. this file)
var serverDir = path.dirname(process.argv[1]);
process.chdir(serverDir);

var express = require('express');

var app = express.createServer();

app.set('view engine', 'jade');

app.get('/', function(req, res, next){
    res.render('index');
});

app.get('/game', function(req, res, next){
    res.render('game');
});

app.get('/static/game/:filename', function(req, res, next){
    var filepath;
    if (['GameKernel.js'].indexOf(req.params.filename) !== -1) {
        filepath = __dirname + '/game/' + req.params.filename;
        res.sendfile(filepath);
    } else {
        filepath = __dirname + '/game/client/' + req.params.filename;
        path.exists(filepath, function (exists) {
            if (exists) {
                res.sendfile(filepath);
            } else {
                return next();
            }
        });
    }
});

app.use(express.static(__dirname + '/static/'));

app.listen(PORT, HOST);

/*
server = http.createServer(function(req, res){
  // your normal server code
  var path = url.parse(req.url).pathname;
  switch (path){
    case '/':
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.write('<h1>Welcome. Try the <a href="/chat.html">chat</a> example.</h1>');
      res.end();
      break;
      
    case '/json.js':
    case '/chat.html':
      fs.readFile(__dirname + path, function(err, data){
        if (err) return send404(res);
        res.writeHead(200, {'Content-Type': path == 'json.js' ? 'text/javascript' : 'text/html'})
        res.write(data, 'utf8');
        res.end();
      });
      break;
      
    default: send404(res);
  }
}),

send404 = function(res){
  res.writeHead(404);
  res.write('404');
  res.end();
};


server.listen(PORT, HOST);

socket = io.listen(server);
socket.on('connection', function(client){
  client.send({ buffer: buffer });
  client.broadcast({ announcement: client.sessionId + ' connected' });
  
  client.on('message', function(message){
    var msg = { message: [client.sessionId, message] };
    buffer.push(msg);
    if (buffer.length > 15) buffer.shift();
    client.broadcast(msg);
  });

  client.on('disconnect', function(){
    client.broadcast({ announcement: client.sessionId + ' disconnected' });
  });
});
*/
