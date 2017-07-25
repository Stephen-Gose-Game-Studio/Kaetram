/* global log, Detect */

define(['jquery', '../page'], function($, Page) {

    return Page.extend({

        init: function(game) {
            var self = this;

            self._super('#settingsPage');

            self.game = game;
            self.audio = game.audio;
            self.storage = game.storage;
            self.renderer = game.renderer;
            self.camera = game.renderer.camera;

            self.volume = $('#volume');
            self.sfx = $('#sfx');
            self.brightness = $('#brightness');

            self.info = $('#info');
            self.soundButton = $('#soundButton');

            self.soundCheck = $('#soundCheck');
            self.cameraCheck = $('#cameraCheck');
            self.debugCheck = $('#debugCheck');
            self.animateCheck = $('#animateCheck');
            self.nameCheck = $('#nameCheck');
            self.levelCheck = $('#levelCheck');

            self.loaded = false;

            self.load();
        },

        load: function() {
            var self = this;

            if (self.loaded)
                return;

            self.volume.val(self.getMusicLevel());
            self.sfx.val(self.getSFXLevel());
            self.brightness.val(self.getBrightness());

            self.game.app.updateRange(self.volume);
            self.game.app.updateRange(self.sfx);
            self.game.app.updateRange(self.brightness);

            self.renderer.adjustBrightness(self.getBrightness());

            self.volume.on('input', function() {
                if (self.audio.song)
                    self.audio.song.volume = this.value / 100;
            });

            self.brightness.on('input', function() {
                self.renderer.adjustBrightness(this.value);
            });

            self.volume.change(function() {
                self.setMusicLevel(this.value);
            });

            self.sfx.change(function() {
                self.setSFXLevel(this.value);
            });

            self.brightness.change(function() {
                self.setBrightness(this.value);
            });

            self.soundCheck.click(function() {
                var isActive = self.soundCheck.hasClass('active');

                self.audio.toggle();

                self.setSound(!isActive);

                if (isActive) {
                    self.audio.reset(self.audio.song);
                    self.audio.song = null;

                    self.soundCheck.removeClass('active');
                    self.soundButton.addClass('active');
                } else {
                    self.audio.update();

                    self.soundCheck.addClass('active');
                    self.soundButton.removeClass('active');
                }
            });

            self.soundButton.click(function() {
                var isActive = self.soundButton.hasClass('active');

                self.audio.toggle();

                self.setSound(isActive);

                if (isActive) {
                    self.audio.update();

                    self.soundCheck.addClass('active');
                    self.soundButton.removeClass('active');
                } else {
                    self.audio.reset(self.audio.song);
                    self.audio.song = null;

                    self.soundCheck.removeClass('active');
                    self.soundButton.addClass('active');
                }
            });

            self.cameraCheck.click(function() {
                var active = self.cameraCheck.hasClass('active');

                if (active)
                    self.renderer.camera.decenter();
                else
                    self.renderer.camera.center();

                self.cameraCheck.toggleClass('active');

                self.setCamera(!active);
            });

            self.debugCheck.click(function() {
                var active = self.debugCheck.hasClass('active');

                self.debugCheck.toggleClass('active');

                self.renderer.debugging = !active;

                self.setDebug(!active);
            });

            self.animateCheck.click(function() {
                var active = self.animateCheck.hasClass('active');

                self.animateCheck.toggleClass('active');

                self.renderer.animateTiles = !active;

                self.setAnimate(!active);
            });

            self.nameCheck.click(function() {
                var active = self.nameCheck.hasClass('active');

                self.nameCheck.toggleClass('active');

                self.renderer.drawNames = !active;

                self.setName(!active);
            });

            self.levelCheck.click(function() {
                var active = self.levelCheck.hasClass('active');

                self.levelCheck.toggleClass('active');

                self.renderer.drawLevels = !active;

                self.setName(!active);
            });


            if (self.getSound()) {
                self.soundCheck.addClass('active');
                self.soundButton.removeClass('active');
            } else
                self.soundButton.addClass('active');

            if (self.getCamera())
                self.cameraCheck.addClass('active');
            else
                self.camera.centered = false;

            if (self.getDebug()) {
                self.debugCheck.addClass('active');
                self.renderer.debugging = true;
            }

            if (self.getAnimatedTiles())
                self.animateCheck.addClass('active');
            else
                self.renderer.animateTiles = false;

            if (self.getName())
                self.nameCheck.addClass('active');
            else
                self.renderer.drawNames = false;

            if (self.getLevel())
                self.levelCheck.addClass('active');
            else
                self.renderer.drawLevels = false;

            self.loaded = true;
        },

        setMusicLevel: function(musicLevel) {
            var self = this;

            self.storage.data.settings.music = musicLevel;
            self.storage.save();
        },

        setSFXLevel: function(sfxLevel) {
            var self = this;

            self.storage.data.settings.sfx = sfxLevel;
            self.storage.save();
        },

        setBrightness: function(brightness) {
            var self = this;

            self.storage.data.settings.brightness = brightness;
            self.storage.save();
        },

        setSound: function(state) {
            var self = this;

            self.storage.data.settings.soundEnabled = state;
            self.storage.save();
        },

        setCamera: function(state) {
            var self = this;

            self.storage.data.settings.centerCamera = state;
            self.storage.save();
        },

        setDebug: function(state) {
            var self = this;

            self.storage.data.settings.debug = state;
            self.storage.save();
        },

        setAnimate: function(state) {
            var self = this;

            self.storage.data.settings.animateTiles = state;
            self.storage.save();
        },

        setName: function(state) {
            var self = this;

            self.storage.data.settings.showNames = state;
            self.storage.save();
        },

        setLevel: function(state) {
            var self = this;

            self.storage.data.settings.showLevels = state;
            self.storage.save();
        },

        getMusicLevel: function() {
            return this.storage.data.settings.music;
        },

        getSFXLevel: function() {
            return this.storage.data.settings.sfx;
        },

        getBrightness: function() {
            return this.storage.data.settings.brightness;
        },

        getSound: function() {
            return this.storage.data.settings.soundEnabled;
        },

        getCamera: function() {
            return this.storage.data.settings.centerCamera;
        },

        getDebug: function() {
            return this.storage.data.settings.debug;
        },

        getAnimatedTiles: function() {
            return this.storage.data.settings.animateTiles;
        },

        getName: function() {
            return this.storage.data.settings.showNames;
        },

        getLevel: function() {
            return this.storage.data.settings.showLevels;
        }


    });

});