var _ = require('underscore'),
    util = require('util'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    fs = require('fs'),
    express = require('express'),
    jade = require('jade'),
    placeholder = require('placeholder'),
    server,
    socket,
    Game = require('./game/models/Game.js'),
    GameServer = require('./game/server/GameServer.js'),
    PORT = process.env.C9_PORT,
    HOST = '0.0.0.0';

placeholder.install({
    express: express,
    jade: jade
});

var log = util.puts;

// change directory to location of server.js (i.e. this file)
var serverDir = path.dirname(process.argv[1]);
process.chdir(serverDir);

var app = express.createServer();



// globals
var gamesById = {};



// helpers
function loadGame(req, res, next) {
    // You would fetch your user from the db
    var game = gamesById[req.params.gameid];
    if (game) {
        req.game = game;
        next();
    } else {
        next(new Error('Failed to load game ' + req.params.gameid));
    }
}


app.set('view engine', 'jade');

app.get('/', function(req, res, next){
    res.render('index', {
        gamesById: gamesById
    });
});

app.get('/tests', function(req, res, next){
    res.render('tests');
});

app.get('/game', function(req, res, next){
    res.render('game');
});

app.get('/game/:gameid', loadGame, function(req, res, next){
    res.render('game', {
        game: req.game
    });
});

app.get('/js/rapascia/rapascia.js', function(req, res, next) {
    var files = [],
        directories = ['util/', '', 'models/', 'views/', 'commands/'], // these directories are in the order in which they should be included
        directoriesToRead,
        fileContents = {};


    directoriesToRead = directories.length;
    var dirDone = function() {
        directoriesToRead -= 1;
        if (directoriesToRead <= 0) {
            var data = _.map(directories, function(dir) { // map through directories in the order specified by the 'directories' array
                return fileContents[dir].join('\n');
            }).join('\n');
            
            data = 'window.Rapascia = {};\n' + data;
            res.contentType('js');
            res.send(data);
        }
    };
    
    _.each(directories, function(dir) {
        var dirpath = __dirname + '/game/client/' + dir;
        fs.readdir(dirpath, function(err, files) {
            if (err) throw err;
            
            fileContents[dir] = [];
            
            var filesToRead = files.length;
            var fileDone = function() {
                filesToRead -= 1;
                if (filesToRead <= 0) {
                    dirDone();
                }
            };
            
            _.each(files, function(filename) {
                var filepath = dirpath + filename;
                fs.readFile(filepath, function(err, data) {
                    fileContents[dir].push(data);
                    fileDone();
                });
            });
        });
    });
});

// unused
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

app.use(express.compiler({ src: __dirname + '/public', enable: ['less'] }));
app.use(express['static'](__dirname + '/public/'));

app.listen(PORT, HOST);

io = io.listen(app);
io.set('log level', 1);

var socket = io.of('/rapascia/');
socket.on('connection', function(client) {
    client.once('create-game', function() {
        console.log('create game msg received');
        var game = new Game();
        gamesById[game.id] = game;
        
        var gameSocket = io.of('/rapascia/game/' + game.id);
        var gameServer = new GameServer(game, gameSocket);
        
        client.broadcast.emit('game-created', game.id);
        client.emit('redirect-to-game', game.id);
    });
});

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
