var util = require('util'),
    http = require('http'),
    path = require('path'),
    io = require('socket.io'),
    express = require('express'),
    jade = require('jade'),
    placeholder = require('placeholder'),
    server,
    socket,
    Game = require('./game/models/Game.js'),
    Player = require('./game/models/Player.js'),
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

app.get('/game', function(req, res, next){
    res.render('game');
});

app.get('/game/:gameid', loadGame, function(req, res, next){
    res.render('game', {
        game: req.game
    });
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

app.use(express['static'](__dirname + '/public/'));

app.listen(PORT, HOST);

io = io.listen(app);

var socket = io.of('/rapascia/');
socket.on('connection', function(client) {
    client.once('create-game', function() {
        console.log('create game msg received');
        var game = new Game();
        gamesById[game.id] = game;
        
        var gameSocket = io.of('/rapascia/game/' + game.id);
        gameSocket.on('connection', function(playerClient) {
            var player = new Player();
            player.joinGame(game);
            gameSocket.emit('player-joined', {
                name: player.name
            });
            playerClient.on('start-game', function() {
                if (!game.timeStarted) {
                    game.timeStarted = new Date().getTime();
                    var gameServer = new GameServer(gameSocket);
                    gameServer.start();
                }
            });
            playerClient.once('disconnect', function() {
                playerClient.broadcast.emit('player-left', {
                    name: player.name
                });
            });
        });
        
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
