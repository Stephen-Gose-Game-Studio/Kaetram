define(['jquery', '../renderer/pointers/pointer'], function($, Pointer) {

    return Class.extend({

        init: function(game) {
            var self = this;

            self.game = game;
            self.pointers = {};

            self.scale = self.getScale();

            self.container = $('#bubbles');
        },

        create: function(id, type) {
            var self = this;

            if (id in self.pointers)
                return;

            var element = $('<div id="' + id +'" class="pointer"></div>');

            self.setSize(element);

            self.container.append(element);

            self.pointers[id] = new Pointer(id, element, type);
        },

        setSize: function(element) {
            var self = this;

            self.updateScale();

            element.css({
                'width': (16 + 16 * self.scale) + 'px',
                'height': (16 + 16 * self.scale) + 'px',
                'margin': 'inherit',
                'margin-top': '-' + (6 * self.scale) + 'px',
                'top': (10 * self.scale) + 'px',
                'background': 'url("img/' + self.scale + '/pointer.png")'
            });
        },

        clean: function() {
            var self = this;

            _.each(self.pointers, function(pointer) { pointer.destroy(); });
            self.pointers = {};
        },

        destroy: function(pointer) {
            var self = this;

            delete self.pointers[pointer.id];
            pointer.destroy();
        },

        set: function(pointer, posX, posY) {
            var self = this;

            self.updateScale();
            self.updateCamera();

            var tileSize = 16 * self.scale,
                x = ((posX - self.camera.x) * self.scale),
                width = parseInt(pointer.element.css('width') + 24),
                offset = (width / 2) - (tileSize / 2), y;

            y = ((posY - self.camera.y) * self.scale) - (tileSize * 2);

            pointer.element.css('left', (x - offset) + 'px');
            pointer.element.css('top' , y + 'px');
        },

        setToEntity: function(entity) {
            var self = this,
                pointer = self.get(entity.id);

            if (!pointer)
                return;

            self.updateScale();

            self.set(pointer, entity.x, entity.y);
        },

        setToPosition: function(id, x, y) {
            var self = this,
                pointer = self.get(id);

            if (!pointer)
                return;

            self.set(pointer, x, y);
        },

        setRelative: function(id, x, y) {
            var self = this,
                pointer = self.get(id);

            if (!pointer)
                return;

            pointer.element.css('left', (x * self.scale) + 'px');
            pointer.element.css('top', (y * self.scale) + 'px');
        },

        update: function() {
            var self = this;

            _.each(self.pointers, function(pointer) {

                switch (pointer.type) {
                    case Modules.Pointers.Entity:

                        var entity = self.game.entities.get(pointer.id);

                        if (entity)
                            self.setToEntity(entity);
                        else
                            self.destroy(pointer);

                        break;

                    case Modules.Pointers.Position:

                        if (pointer.x !== -1 && pointer.y !== -1)
                            self.set(pointer, pointer.x, pointer.y);

                        break;
                }

            });
        },

        get: function(id) {
            var self = this;

            if (id in self.pointers)
                return self.pointers[id];

            return null;
        },

        updateScale: function() {
            this.scale = this.getScale();
        },

        updateCamera: function() {
            this.camera = this.game.renderer.camera;
        },

        getScale: function() {
            return this.game.getScaleFactor();
        }

    });

});