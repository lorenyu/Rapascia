var util = require('util');

var GameProcessingRenderer = this.exports = function(canvas) {
    var sketch = new Processing.Sketch(function (processing) {
        
    });
};
util.inherits(GameProcessingRenderer, processing);

GameProcessingRenderer.prototype.update = function(time) {
    this.draw();
};

GameProcessingRenderer.prototype.tick = function() {
};

