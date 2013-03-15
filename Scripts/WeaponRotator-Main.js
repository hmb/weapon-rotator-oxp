"use strict";

this.name           = "WeaponRotatorMain"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 20013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements the main functionality of weapon rotator";
this.version        = "0.1"

// --------------------------------------------
// world script event member functions

this.startUp = function()
{
  this.rotateSound = new SoundSource;
  this.rotateSound.sound = "weapon-rotator-lb-rotate.ogg";
  this.rotateSound.loop = false;
  this.rotating = false;
}

this.playerBoughtEquipment = function(equipmentKey)
{
  var equipment2RemoveKey = null;

  if (equipmentKey == "EQ_LB_WEAPON_ROTATOR") {
    equipment2RemoveKey = "EQ_PROF_WEAPON_ROTATOR";
  }
  else if (equipmentKey == "EQ_PROF_WEAPON_ROTATOR") {
    equipment2RemoveKey = "EQ_LB_WEAPON_ROTATOR";
  }
  
  if (equipment2RemoveKey != null) {
    var equipment2Remove = EquipmentInfo.infoForKey(equipment2RemoveKey);
    if (equipment2Remove!=null) {
      player.ship.removeEquipment(equipment2RemoveKey);
      player.credits += equipment2Remove.price / 10.0;
    }
  }
  
}

// --------------------------------------------
// world script private member functions

this._rotateWeapons = function(clockwise)
{
  // avoid double invocation
  if (this.rotating)
    return;

  this.rotating = true;
  
  // start sound and timer
  this.rotateSound.play();
  this.rotationTimer = new Timer(this, this._finishRotation, 1.7)
  // remember data and weapons
  this.clockwise = clockwise;
  this.forwardWeapon = player.ship.forwardWeapon;
  this.portWeapon = player.ship.portWeapon;
  this.aftWeapon = player.ship.aftWeapon;
  this.starboardWeapon = player.ship.starboardWeapon;

  // remove weapons, so no fire is possible
  player.ship.forwardWeapon = null;
  player.ship.portWeapon = null;
  player.ship.aftWeapon = null;
  player.ship.starboardWeapon = null;

  // replace crosshairs with custom version, depending on rotation direction
  this.crosshairs = player.ship.crosshairs;
  if (clockwise) {
    player.ship.crosshairs = "weapon-rotator-xhairs-r.plist";
  }
  else {
    player.ship.crosshairs = "weapon-rotator-xhairs-l.plist";
  }
}

this._finishRotation = function()
{
  // stop timer
  this.rotationTimer.stop();
  delete this.rotationTimer;

  // re-fit rotated weapons
  if (this.clockwise) {
    player.ship.forwardWeapon = this.portWeapon;
    player.ship.portWeapon = this.aftWeapon;
    player.ship.aftWeapon = this.starboardWeapon;
    player.ship.starboardWeapon = this.forwardWeapon;
   }
   else {
    player.ship.forwardWeapon = this.starboardWeapon;
    player.ship.portWeapon = this.forwardWeapon;
    player.ship.aftWeapon = this.portWeapon;
    player.ship.starboardWeapon = this.aftWeapon;
  }
  
  // forget remembered weapons
  this.forwardWeapon = null;
  this.portWeapon = null;
  this.aftWeapon = null;
  this.starboardWeapon = null;
  // re-install crosshairs
  player.ship.crosshairs = this.crosshairs;
  this.crosshairs = null;

  // determine viewport weapon for display message
  var viewWeapon = false;
  switch (player.ship.viewDirection)
  {
  case "VIEW_FORWARD":
    viewWeapon = player.ship.forwardWeapon;
    break;
  case "VIEW_AFT":
    viewWeapon = player.ship.aftWeapon;
    break;
  case "VIEW_PORT":
    viewWeapon = player.ship.portWeapon;
    break;
  case "VIEW_STARBOARD":
    viewWeapon = player.ship.starboardWeapon;
    break;
  }

  // display message depending on current viewport
  var message = "";
  if (viewWeapon === false) {
    message = "Weapons rotated.";
  }
  else if (viewWeapon === null) {
    message = "No weapon present!";
  }
  else {
    message = viewWeapon.name+" activated.";
  }
  
  player.consoleMessage(message);
  // quit rotating
  this.rotating = false;
};
