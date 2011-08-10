describe('client.util module', function(){
    var util = Rapascia.util;
    
    describe('Rapascia.require', function(){
        var spy,
            A;
        beforeEach(function() {
            spy = jasmine.createSpy();
            A = 'definition of A';
        });
        it('should fire the callback with the class definition when the class is defined with Rapascia.define', function(){
            Rapascia.require('Rapascia.A', spy);
            Rapascia.define('Rapascia.A', A);
            expect(spy).toHaveBeenCalledWith(A);
        });
        
        it('should immediately fire the callback with the class definition if the class was already defined with Rapascia.define', function(){
            Rapascia.define('Rapascia.A', A);
            Rapascia.require('Rapascia.A', spy);
            expect(spy).toHaveBeenCalledWith(A);
        });
    });
    
    describe('util.addProperty', function() {
        var Foo,
            foo;
        beforeEach(function() {
            Foo = function() {
                this._prop = 'x';
            };
            util.addProperty(Foo, 'prop');
            foo = new Foo();
        });
        it('should add property getters to a class', function() {
            expect(foo.prop()).toBe('x');
        });
        it('should add property setters to a class', function() {
            foo.prop('y');
            expect(foo.prop()).toBe('y');
        });
    });
    
    describe('util.math.slopeIntercept', function(m, b) {
        var f;
        it('should correctly model the function f(x) = mx + b', function() {
            var m = -0.2,
                b = 1;
            f = util.math.slopeIntercept(-0.2, 1); // f(x) = -0.2x + 1
            expect(f(0)).toBe(1);
            expect(f(2)).toBe(0.6);
            expect(f(-2)).toBe(1.4);
        });
    });
});