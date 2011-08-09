(function(Rapascia, undefined ) {
    
var util = Rapascia.util;

var Unit,
    Tile;
Rapascia.require('Rapascia.models.Unit', function(cls) { Unit = cls; });
Rapascia.require('Rapascia.models.Tile', function(cls) { Tile = cls; });

/**
 * MoveCommand
 */
var MoveCommand = Rapascia.define('Rapascia.commands.Move', function(units, from, to) {
    //console.log(units);
    this.name = 'move';
    this.units = units;
    this.from = from;
    this.to = to;
});
MoveCommand.prototype.execute = function() {
    
    var player = this.from.player();
    if (player.energy() < 3) {
        return;
    }
    player.energy(player.energy() - 3);
    
    this.from.removeUnits(this.units);
    
    if (this.from.player() !== this.to.player()) {
        
        // attack
        
        var attackingUnits = this.units,
            defendingUnits = this.to.units(),
            attackingDamage,
            defendingDamage,
            damage,
            attacker,
            defender;
        
        while (attackingUnits.length > 0 && defendingUnits.length > 0) {
            
            attackingDamage = _.sum(_.invoke(attackingUnits, 'damage'));
            defendingDamage = _.sum(_.invoke(defendingUnits, 'damage'));
            
            while (attackingDamage > 0 && defendingUnits.length > 0) {
                
                defender = defendingUnits[0];
                damage = Math.min(attackingDamage, defender.health());
                
                attackingDamage -= damage;
                defender.health( defender.health() - damage );
                
                if (defender.health() <= 0) {
                    defendingUnits.shift();
                }
            }
            
            while (defendingDamage > 0 && attackingUnits.length > 0) {
                
                attacker = attackingUnits[0];
                damage = Math.min(defendingDamage, attacker.health());
                
                defendingDamage -= damage;
                attacker.health( attacker.health() - damage );
                
                if (attacker.health() <= 0) {
                    attackingUnits.shift();
                }
            }
            
        }
        
        // advance remaining units
        if (defendingUnits.length === 0) {
            this.to.addUnits(attackingUnits);
        }
        
        // reset health
        _.invoke(this.to.units(), 'health', Unit.HEALTH_PER_UNIT);
        _.invoke(this.from.units(), 'health', Unit.HEALTH_PER_UNIT);
        
    } else {
        this.to.addUnits(this.units);
    }
};
MoveCommand.prototype.serialize = function() {
    return {
        name: this.name,
        units: _.map(this.units, function(unit) {
            return unit.id();
        }),
        from: this.from.id(),
        to: this.to.id()
    };
};
MoveCommand.deserialize = function(command) {
    var units = _.map(command.units, function(unitid) {
            return Unit.get(unitid);
        }),
        from = Tile.get(command.from),
        to = Tile.get(command.to);
    
    return new MoveCommand(units, from, to);
};

})(Rapascia);
