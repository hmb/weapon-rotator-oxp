"use strict";

this.name           = "WeaponRotatorMain"
this.author         = "Holger B�hnke"
this.copyright      = "(C) 20013 Holger B�hnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements the main functionality of weapon rotator";
this.version        = "0.3"

// --------------------------------------------
// private global properties

// prefix to mission variables
this.storablePrefix = "weaponRotator_";

// internal variables that should be stored in missionVariables
this.storables = [
    { name: "operationTotal", defaultValue: 4711 },
    { name: "operationCount", defaultValue: 8115 }
  ];

// --------------------------------------------
// world script event member functions

this.startUp = function()
{
  this.rotating = false;    // init double invocation flag
  this._loadMissionVariables();
  this._init();
}

this.playerWillSaveGame = function(message)
{
  // store saveable vars in mission variables
  this._saveMissionVariables();
}

this.playerBoughtEquipment = function(equipmentKey)
{
  // init with nothing to remove
  var equipment2RemoveKey = null;

  if (equipmentKey == "EQ_RENOVATION") {
    // reset operation counter, the total counter is
    // only reset when buying a new EQ
    this.operationCount = 0;
  }
  else if (equipmentKey == "EQ_LB_WEAPON_ROTATOR") {
    // check if we have to remove the high quality WR
    equipment2RemoveKey = "EQ_HQ_WEAPON_ROTATOR";
  }
  else if (equipmentKey == "EQ_HQ_WEAPON_ROTATOR") {
    // check if we have to remove the low budget WR
    equipment2RemoveKey = "EQ_LB_WEAPON_ROTATOR";
  }

  // the remove key is != null, only in case of a new WR being bought
  if (equipment2RemoveKey != null) {
    // check whether the alternative WR is present
    if (this._isEquipmentPresent(equipment2RemoveKey)) {
      // get the equipment info of the WR to be removed
      var equipment2Remove = EquipmentInfo.infoForKey(equipment2RemoveKey);
      var damageFactor = this._isEquipmentDamaged(equipment2RemoveKey)? 2 : 1;
      // remove it and refund the remaining value
      player.ship.removeEquipment(equipment2Remove);
      // refund credits according to the operation counter
      // TODO: praxis test, check if this formula is reasonable
      // TODO: account for damaged equipment
      var countFactor = this._calcValueDiminishFactor(this.operationCount);
      var totalFactor = this._calcValueDiminishFactor(this.operationTotal);
      totalFactor = (totalFactor-1) * this.budgetFactor + 1;

      player.credits +=
        equipment2Remove.price / 10.0 / countFactor / totalFactor / damageFactor;
    }

    // new device: reset usage and operation counter
    this.operationTotal = 0;
    this.operationCount = 0;
    this._init();
  }
}

// --------------------------------------------
// weapon rotator private member functions

this._init = function()
{
  if (this._isEquipmentPresent("EQ_LB_WEAPON_ROTATOR")) {
    // load sounds
    this.sndStart         = new SoundSource;
    this.sndStart.sound   = "weapon-rotator-lb-start.ogg";
    this.sndStart.loop    = false;
    this.sndLoop          = new SoundSource;
    this.sndLoop.sound    = "weapon-rotator-lb-loop.ogg";
    this.sndLoop.loop     = true;
    this.sndFinish        = new SoundSource;
    this.sndFinish.sound  = "weapon-rotator-lb-finish.ogg";
    this.sndFinish.loop   = false;
    // init parameters
    this.startLen     = 1.75;
    this.loopLen      = 5;
    this.budgetFactor = 0.3;
    this.wpHq         = false;
  }
  else if (this._isEquipmentPresent("EQ_HQ_WEAPON_ROTATOR")) {
    // load sounds
    this.sndStart         = new SoundSource;
    this.sndStart.sound   = "weapon-rotator-hq-start.ogg";
    this.sndStart.loop    = false;
    this.sndLoop          = new SoundSource;
    this.sndLoop.sound    = "weapon-rotator-hq-loop.ogg";
    this.sndLoop.loop     = true;
    this.sndFinish        = new SoundSource;
    this.sndFinish.sound  = "weapon-rotator-hq-finish.ogg";
    this.sndFinish.loop   = false;
    // init parameters
    this.startLen     = 0.15;
    this.loopLen      = 1;
    this.budgetFactor = 0.1;
    this.wpHq         = true;
  }
  else {
    this.sndStart     = null;
    this.sndLoop      = null;
    this.sndFinish    = null;
    this.startLen     = 0;
    this.loopLen      = 0;
    this.budgetFactor = 0;
    this.wpHq         = false;
  }
}

this._rotateWeapons = function(clockwise)
{
  // avoid double invocation
  if (this.rotating)
    return;

  this.rotating = true;

  var maxHeat = player.ship.laserHeatLevelForward;
  maxHeat = maxHeat > player.ship.laserHeatLevelAft       ? maxHeat : player.ship.laserHeatLevelAft;
  maxHeat = maxHeat > player.ship.laserHeatLevelPort      ? maxHeat : player.ship.laserHeatLevelPort;
  maxHeat = maxHeat > player.ship.laserHeatLevelStarboard ? maxHeat : player.ship.laserHeatLevelStarboard;

  // check temperature of hottest laser ( < 0.25 is green state)
  // the low budget version needs lower temperature to rotate
  if (maxHeat > (this.wpHq? 0.25 : 0.1)) {
    var msg = "Security override: Laser temperature exceeding rotation specification.";
    player.consoleMessage(msg);
    this.rotating = false;
    return;
  }

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



// --------------------------------------------
// general helper functions

this._getMissionVariable = function(varName, defaultValue)
{
  var missVar = missionVariables[this.storablePrefix + varName];
  this[varName] = missVar==null? defaultValue : missVar;
}

this._setMissionVariable = function(varName)
{
  missionVariables[this.storablePrefix + varName] = this[varName];
}

this._loadMissionVariables = function()
{
  for (var i=0; i<this.storables.length; ++i) {
    var storeItem = this.storables[i];
    this._getMissionVariable(storeItem.name, storeItem.defaultValue);
  }
}

this._saveMissionVariables = function()
{
  for (var i=0; i<this.storables.length; ++i) {
    this._setMissionVariable(this.storables[i].name);
  }
}

this._isEquipmentPresent = function(eqmnt)
{
  var stat = player.ship.equipmentStatus(eqmnt);

  return stat=="EQUIPMENT_OK" || stat=="EQUIPMENT_DAMAGED";
    // "EQUIPMENT_UNAVAILABLE" "EQUIPMENT_UNKNOWN"
}

this._isEquipmentDamaged = function(eqmnt)
{
  var stat = player.ship.equipmentStatus(eqmnt);

  return stat=="EQUIPMENT_DAMAGED";
}

this._calcValueDiminishFactor = function(count)
{
  // ln(count+10) / ln(10) == log10(count+10)
  var factor = Math.log(count+10) / 2.3025;
  return factor;
}
