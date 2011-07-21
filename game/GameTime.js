var GameTime = module.exports = function() {
    this.update();
};

GameTime.prototype.update = function() {
    this.millis = new Date().getTime();
};
