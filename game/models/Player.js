var Player = module.exports = function() {
    this.id = Math.random();
    this.name = 'Player'+this.id;
    this.game = null;
};