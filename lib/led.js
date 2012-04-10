// Derived and adapted from
// https://github.com/rwldrn/duino/blob/development/lib/led.js
var events = require("events"),
    util = require("util");

function Led( opts ) {

  this.firmata = opts.board.firmata;
  this.mode = this.firmata.MODES.OUTPUT;
  this.pin = opts.pin || 9; // Use a PWM pin
  this.level = 0;
  this.interval = null;

  // Set the output mode
  this.firmata.pinMode( this.pin, this.mode );
};

Led.prototype.on = function() {
  this.firmata.digitalWrite( this.pin, this.firmata.HIGH );
  this.level = 255;
  return this;
};

Led.prototype.off = function() {
  this.firmata.digitalWrite( this.pin, this.firmata.LOW );
  this.level = 0;
  return this;
};

Led.prototype.brightness = function( val ) {
  this.level = val;
  this.firmata.analogWrite( this.pin, val );
  return this;
};

Led.prototype.fade = function( rate ) {
  // Reset pinMode to PWM
  // TODO: check if this pin is capable of PWM
  //       log error if not capable
  if ( this.mode !== this.firmata.MODES.PWM ) {
    this.mode = this.firmata.MODES.PWM;
    this.firmata.pinMode( this.pin, this.mode );
  }

  var to = ( rate || 5000 ) / ( 255 * 2 ),
      direction;

  this.interval = setInterval(function() {
    if ( +this.level === 0 ) {
      direction = 1;
    }
    if ( +this.level === 255 ) {
      direction = -1;
    }

    this.brightness( this.level + direction );
  }.bind(this), to);
};

Led.prototype.strobe = function( rate ) {
  // Reset pinMode to OUTPUT
  if ( this.mode !== this.firmata.MODES.OUTPUT ) {
    this.mode = this.firmata.MODES.OUTPUT;
    this.firmata.pinMode( this.pin, this.mode );
  }

  this.interval = setInterval(function() {
    if ( this.level ) {
      this.off();
    } else {
      this.on();
    }
  }.bind(this), rate || 1000);

  return this;
};

Led.prototype.stop = function() {
  clearInterval( this.interval );
  return this.off();
};

module.exports = Led;