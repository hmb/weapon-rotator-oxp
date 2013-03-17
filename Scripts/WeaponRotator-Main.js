"use strict";

this.name           = "WeaponRotatorMain"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 20013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements the main functionality of weapon rotator";
this.version        = "0.2"

// --------------------------------------------
// world script event member functions

this.startUp = function()
{
  // init double invocation flag
  this.rotating   = false;
  this.installed  = 0;

  // remember which eq is installed
  if (EquipmentInfo.infoForKey("EQ_LB_WEAPON_ROTATOR")!=null) {
    this.installed = 1;
  }
  else if (EquipmentInfo.infoForKey("EQ_PROF_WEAPON_ROTATOR")!=null) {
    this.installed = 2;
  }

  // init vars from saved player file
  // operationTotal is the count of total activations
  this.operationTotal = missionVariables.weaponRotator_operationTotal;
  if (this.operationTotal==null) {
    this.operationTotal = 0;
  }

  // operationCount is the count of activations since the last maintenance
  this.operationCount = missionVariables.weaponRotator_operationCount;
  if (this.operationCount==null) {
    this.operationCount = 0;
  }

  this._init();
}

this.playerWillSaveGame = function(message)
{
  // store saveable vars in mission variables
  missionVariables.weaponRotator_operationTotal = this.operationTotal;
  missionVariables.weaponRotator_operationCount = this.operationCount;
}

this.playerBoughtEquipment = function(equipmentKey)
{
  // init with nothing to remove
  var equipment2RemoveKey = null;
  var budgetFactor = 1.0;

  if (equipmentKey == "EQ_RENOVATION") {
    // reset operation counter, the total counter is
    // only reset when buying a new EQ
    this.operationCount = 0;
  }
  else if (equipmentKey == "EQ_LB_WEAPON_ROTATOR") {
    // check if we have to remove the prof WR
    equipment2RemoveKey = "EQ_PROF_WEAPON_ROTATOR";
    this.installed = 1;
  }
  else if (equipmentKey == "EQ_PROF_WEAPON_ROTATOR") {
    // check if we have to remove the low budget WR
    equipment2RemoveKey = "EQ_LB_WEAPON_ROTATOR";
    this.installed = 2;
  }

  // remove key is not null, only in case of a WR being bought
  if (equipment2RemoveKey != null) {
    // check for the alternate WR to be present
    var equipment2Remove = EquipmentInfo.infoForKey(equipment2RemoveKey);
    // remove it, if present
    if (equipment2Remove!=null) {
      player.ship.removeEquipment(equipment2RemoveKey);
      // refund credits according to the operation counter
      // TODO: praxis test, check if this formula is reasonable
      var countFactor = this._calcValueDiminishFactor(this.operationCount);
      var totalFactor = this._calcValueDiminishFactor(this.operationTotal);
      totalFactor = (totalFactor-1) * this.budgetFactor + 1;
      player.credits += equipment2Remove.price / 10.0 / countFactor / totalFactor;
    }

    // new device: reset usage and operation counter
    this.operationTotal = 0;
    this.operationCount = 0;
    this._init();
  }
}

// --------------------------------------------
// world script private member functions

this._init = function()
{
  if (this.installed == 0) {
    this.sndStart     = null;
    this.sndLoop      = null;
    this.sndFinish    = null;
    this.startLen     = 0;
    this.loopLen      = 0;
    this.budgetFactor = 0;
  }
  else {
    var rotstr = this.installed == 1? "lb" : "hq";

    // load sounds
    this.sndStart         = new SoundSource;
    this.sndStart.sound   = "weapon-rotator-"+rotstr+"-start.ogg";
    this.sndStart.loop    = false;
    this.sndLoop          = new SoundSource;
    this.sndLoop.sound    = "weapon-rotator-"+rotstr+"-loop.ogg";
    this.sndLoop.loop     = true;
    this.sndFinish        = new SoundSource;
    this.sndFinish.sound  = "weapon-rotator-"+rotstr+"-finish.ogg";
    this.sndFinish.loop   = false;
    // init parameters
    this.startLen     = this.installed == 1? 1.75 : 0.15;
    this.loopLen      = this.installed == 1? 5 : 1;
    this.budgetFactor = this.installed == 1? 0.3 : 0.1;
  }
}

this._rotateWeapons = function(clockwise)
{
  // avoid double invocation
  if (this.rotating)
    return;

  this.rotating = true;

  // start sound and timer
  this.sndStart.play();
  this.rotationTimer = new Timer(this, this._startLoop, this.startLen)

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

  ++this.operationTotal;
  ++this.operationCount;
}

this._startLoop = function()
{
  // stop old timer
  this.rotationTimer.stop();
  delete this.rotationTimer;
  // setup loop timer
  this.rotationTimer = new Timer(this, this._finishRotation, this.loopLen)
  // start looping sound
  this.sndStart.stop();
  this.sndLoop.play();
}

this._finishRotation = function()
{
  // stop timer
  this.rotationTimer.stop();
  delete this.rotationTimer;

  this.sndLoop.stop();
  this.sndFinish.play();

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

this._calcValueDiminishFactor = function(count)
{
  // ln(count+10) / ln(10) == log10(count+10)
  var factor = Math.log(count+10) / 2.3025;
  return factor;
}
