var cls = require('../../../../../lib/class'),
    Items = require('../../../../../util/items'),
    Messages = require('../../../../../network/messages'),
    Packets = require('../../../../../network/packets'),
    Utils = require('../../../../../util/utils');

module.exports = Enchant = cls.Class.extend({

    /**
     * Tier 1 - Damage/Armour boost (1-5%)
     * Tier 2 - Damage boost (1-10% & 10% for special ability or special ability level up)
     * Tier 3 - Damage boost (1-15% & 15% for special ability or special ability level up)
     * Tier 4 - Damage boost (1-20% & 20% for special ability or special ability level up)
     * Tier 5 - Damage boost (1-40% & 25% for special ability or special ability level up)
     */


    init: function(player) {
        var self = this;

        self.player = player;

        self.selectedItem = null;
        self.selectedShards = null;
    },

    convert: function(shard) {
        var self = this;

        if (!Items.isShard(shard.id) || !self.player.inventory.hasSpace())
            return;

        var tier = Items.getShardTier(shard.id);

        if (shard.count < 11 && tier > 5)
            return;

        for (var i = 0; i < shard.count; i += 10) {
            self.player.inventory.remove(shard.id, 10, shard.index);

            self.player.inventory.add({
                id: shard.id + 1,
                count: 1,
                ability: -1,
                abilityLevel: -1
            });
        }

    },

    enchant: function() {
        var self = this;

        if (!self.selectedItem) {
            self.player.notify('You have not selected an item to enchant.');
            return;
        }

        if (!self.selectedShards) {
            self.player.notify('You have to select shards to infuse.');
            return;
        }

        if (!self.verify()) {
            self.player.notify('This item cannot be enchanted.');
            return;
        }

        if (self.selectedShards.count < 10) {
            self.player.notify('You must have a minimum of 10 shards to enchant.');
            return;
        }

        /**
         * Implement probabilities here based on the number of shards
         * and reason them out.
         */

        var tier = self.selectedItem.tier;

        self.selectedItem.count = Utils.randomInt(1, tier === 5 ? 40 : 5 * tier);

        if (tier < 2)
            return;

        if (self.hasAbility(self.selectedItem))
            if (self.selectedItem.abilityLevel < 5)
                self.selectedItem.abilityLevel++;
        else
            self.generateAbility();

        self.player.inventory.remove(self.selectedShards.id, 10, self.selectedShards.index);
    },

    generateAbility: function() {
        var self = this,
            type = Items.getType(self.selectedItem.id),
            probability = Utils.randomInt(0, 100);

        if (probability > 5 + (5 * self.selectedShards.tier))
            return;

        switch (type) {
            case 'armor':
            case 'armorarcher':

                self.selectedItem.ability = Utils.randomInt(2, 3);


                break;

            case 'weapon':

                self.selectedItem.ability = Utils.randomInt(0, 1);

                break;

            case 'weaponarcher':

                self.selectedItem.ability = Utils.randomInt(4, 5);

                break;

            case 'pendant':

                break;

            case 'ring':

                break;

            case 'boots':

                break;

        }
    },
    
    verify: function() {
        return Items.isEnchantable(this.selectedItem.id) && Items.isShard(this.selectedShards.id);  
    },

    add: function(type, item) {
        var self = this,
            isItem = item === 'item';

        if (isItem && !Items.isEnchantable(item.id))
            return;

        if (type === 'item') {
            if (self.selectedItem)
                self.remove('item');

            self.selectedItem = item;

        } else if (type === 'shards') {

            if (self.selectedShards)
                self.remove('shards');

            self.selectedShards = item;
        }

        self.player.send(new Messages.Enchant(Packets.EnchantOpcode.Select, {
            type: type,
            index: item.index
        }));
    },

    remove: function(type) {
        var self = this,
            index;

        if (type === 'item' && self.selectedItem) {

            index = self.selectedItem.index;

            self.selectedItem = null;

        } else if (type === 'shards' && self.selectedShards) {

            index = self.selectedShards.index;


            self.selectedShards = null;
        }

        self.player.send(new Messages.Enchant(Packets.EnchantOpcode.Remove, {
            type: type,
            index: index
        }));
    },

    hasAbility: function(item) {
        return item.ability !== -1;
    }

});