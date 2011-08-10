(function(Rapascia, undefined ) {

/**
 * Inherit the prototype methods from one constructor into another.
 *
 * Example:
 *
 *     function foo(){};
 *     foo.prototype.hello = function(){ console.log( this.words )};
 *     
 *     function bar(){
 *       this.words = "Hello world";
 *     };
 *     
 *     io.util.inherit(bar,foo);
 *     var person = new bar();
 *     person.hello();
 *     // => "Hello World"
 *
 * @param {Constructor} ctor The constructor that needs to inherit the methods.
 * @param {Constructor} superCtor The constructor to inherit from.
 * @api public
 */
var util = Rapascia.util = {};
util.inherit = function(ctor, superCtor){
    // no support for `instanceof` for now
    for (var i in superCtor.prototype){
        ctor.prototype[i] = superCtor.prototype[i];
    }
};

Rapascia.require = function(cls, callback) {
    var parts = cls.split('.'),
        last,
        node;
    if (parts.shift() != 'Rapascia') {
        return;
    }
    
    node = Rapascia;
    try {
        _.each(parts, function(part) {
            node = node[part];
            if (!node) {
                throw 'class ' + cls + ' undefined';
            }
        });
        callback(node);
    } catch (err) {
        $(Rapascia).one('class-defined:' + cls, function() {
            node = Rapascia;
            _.each(parts, function(part) {
                node = node[part];
            });
            callback(node);
        });
    }
};

Rapascia.define = function(cls, definition) {
    var parts = cls.split('.'),
        cur,
        last;
    if (parts.shift() != 'Rapascia') {
        return;
    }
    
    last = parts.pop();
    node = Rapascia;
    _.each(parts, function(part) {
        node[part] = node[part] || {};
        node = node[part];
    });
    node[last] = definition;
    $(Rapascia).trigger('class-defined:' + cls);
    return definition;
};

/**
 * Convenience method for adding getters/setters to classes.
 * NOTE: This method uses closures so it is less efficient than defining the property explicitly
 * 
 * Usage:
 *   var Person = function() {
 *       this._age = 50;
 *   };
 *   util.addProperty(Person, 'age');
 * 
 *   var person = new Person();
 *   person.age(60); // set age
 *   assert(person.age() == 60); // get age
 */
util.addProperty = function(cls, property) {
    cls.prototype[property] = function(value) {
        if (value === undefined) {
            return this['_' + property];
        }
        this['_' + property] = value;
    };
};

var math = util.math = {};


math.stepwiseConstant = function(steps, constants) {
    return function(n) {
        
    };
};

/**
 * generates and returns a function f, such that f(x) = mx + b.
 * 
 * Usage:
 *   var f = math.slopeIntercept(2,3);
 *   assert(f(0) == 3);
 *   assert(f(1) == 5);
 */
math.slopeIntercept = function(m, b) {
    return function(x) {
        return m*x + b;
    };
};


/**
 * Underscore plugins
 */
_.mixin({
    sum: function(list) {
        return _.reduce(list, function(memo, num) {
            return memo + num;
        });
    }
});


/**
 * jQuery plugins
 */
$.fn.rapascia = function(method) {
    if (method == 'getModel') {
        var models = this.map(function() {
            var $this = $(this),
                modelClass = $this.attr('model'),
                modelid = $this.attr('modelid');
            //console.log(Rapascia.models[modelClass].get(modelid));
            return Rapascia.models[modelClass].get(modelid);
        });
        return models;
    }
    return this;
};
    
})(Rapascia);
