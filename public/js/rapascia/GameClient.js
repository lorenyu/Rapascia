(function(window, undefined ) {
    
var Rapascia = window.Rapascia = {};

var GameClient = Rapascia.GameClient = function(socket) {
    this.socket = socket;
    socket.on('tick', function(data) {
        $('.time').text(data.time);
    });
};
GameClient.prototype.sendCommand = function(command) {
    this.socket.emit('player-command', command);
};

})(window);
