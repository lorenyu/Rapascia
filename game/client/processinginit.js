var sketch = function(processing) {
    processing.setup = GameProcessingRenderer.setup;
    processing.draw = function() {
        Input.update();
        GameProcessingRenderer.update();
    
    };
};

new Processing(canvas, sketch);
