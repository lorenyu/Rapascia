var GameTime = module.exports = function() {
    this.update();
};
GameTime.prototype.update = function() {
    this.millis = this.now();
};
GameTime.prototype.now = function() {
    return new Date().getTime();
};

