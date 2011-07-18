var Player = module.exports = function() {
    process.EventEmitter.call(this);
    this.id = Math.random();
    this.name = 'Player'+this.id;
    this.game = null;
    
    this.joinGame = function(game) {
        this.game = game;
        this.game.addPlayer(this);
        this.emit('message', {
            type: 'joinGame',
            player: this,
            game: this.game
        });
        return true;
    };
        
    this.leaveGame = function() {
        if (!this.game) {
            return false;
        }
        this.game.removePlayer(this);
        this.emit('message', {
            type: 'leaveGame',
            player: this,
            game: this.game
        });
            
        this.game = null;
        return true;
    };
};