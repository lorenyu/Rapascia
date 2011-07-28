(function(window, undefined ) {
    
var Rapascia = window.Rapascia = {};

var GameClient = Rapascia.GameClient = function(socket) {
    this.socket = socket;
    socket.on('tick', $.proxy(this.tick, this));
};
GameClient.prototype.tick = function(data) {
    $('.time').text(data.time); // for debugging
    
    var commands = data.commands,
        time = data.time,
        timeElapsed;
    
    timeElapsed = time - this.time;    
    
    // process player commands
    
    // update game state
    
    this.time = time;
};

GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

})(window);
