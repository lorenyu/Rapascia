describe('client.util module', function(){
    describe('Rapascia.require', function(){
        var spy = jasmine.createSpy(),
            A = 'definition of A';
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
});