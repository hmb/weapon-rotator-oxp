"use strict";

this.name           = "WeaponRotatorMain"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 20013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements the main functionality of weapon rotator";
this.version        = "0.3"

// --------------------------------------------
// private global properties

// prefix to mission variables
this._storablePrefix = "weaponRotator";

// internal variables that should be stored in missionVariables
this._storables = [
    { name: "_operationTotal",  defaultValue: 0 },    // total number of operations
    { name: "_operationCount",  defaultValue: 0 },    // operations since last maintenance
    { name: "_rotationPos",     defaultValue: 0 }     // 0: front, 1: storeboard, 2: aft, 3: port
  ];

// --------------------------------------------
// world script event member functions

this.startUp = function()
{
  this._rotating = false;    // init double invocation flag
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
    // reset operation counter, the total is
    // only reset when buying a new EQ
    this._operationCount = 0;
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
      var countFactor = this._calcValueDiminishFactor(this._operationCount);
      var totalFactor = this._calcValueDiminishFactor(this._operationTotal);
      totalFactor = (totalFactor-1) * this._budgetFactor + 1;

      // refund remaining credits for existing device
      player.credits +=
        equipment2Remove.price / 10.0 / countFactor / totalFactor / damageFactor;
    }

    // new device: reset usage and operation counter
    this._operationTotal = 0;
    this._operationCount = 0;
    this._rotationPos = 0;
    this._init();
  }
}

// --------------------------------------------
// weapon rotator private member functions

this._init = function()
{
  if (this._isEquipmentPresent("EQ_LB_WEAPON_ROTATOR")) {
    // load sounds
    this._sndStart          = new SoundSource;
    this._sndStart.sound    = "weapon-rotator-lb-start.ogg";
    this._sndStart.loop     = false;
    this._sndLoop           = new SoundSource;
    this._sndLoop.sound     = "weapon-rotator-lb-loop.ogg";
    this._sndLoop.loop      = true;
    this._sndFinish         = new SoundSource;
    this._sndFinish.sound   = "weapon-rotator-lb-finish.ogg";
    this._sndFinish.loop    = false;
    // init parameters
    this._startLen      = 1.75;
    this._loopLen       = 5;
    this._budgetFactor  = 0.3;
    this._rotHeatLevel  = 0.1;
  }
  else if (this._isEquipmentPresent("EQ_HQ_WEAPON_ROTATOR")) {
    // load sounds
    this._sndStart          = new SoundSource;
    this._sndStart.sound    = "weapon-rotator-hq-start.ogg";
    this._sndStart.loop     = false;
    this._sndLoop           = new SoundSource;
    this._sndLoop.sound     = "weapon-rotator-hq-loop.ogg";
    this._sndLoop.loop      = true;
    this._sndFinish         = new SoundSource;
    this._sndFinish.sound   = "weapon-rotator-hq-finish.ogg";
    this._sndFinish.loop    = false;
    // init parameters
    this._startLen      = 0.15;
    this._loopLen       = 1;
    this._budgetFactor  = 0.1;
    this._rotHeatLevel  = 0.25;
  }
  else {
    this._sndStart      = null;
    this._sndLoop       = null;
    this._sndFinish     = null;
    this._startLen      = 0;
    this._loopLen       = 0;
    this._budgetFactor  = 0;
    this._rotHeatLevel  = 0;
  }
}

this._rotateWeapons = function(steps)
{
  // check for integer
  if (steps != Math.floor(steps)) {
    return;
  }

  // check parameter steps must be -3, -2, -1, 1, 2, 3
  if (steps < -3 || steps > 3 || steps==0) {
    return;
  }

  // avoid double invocation
  if (this._rotating)
    return;

  this._rotating = true;

  var maxHeat = player.ship.laserHeatLevelForward;
  maxHeat = maxHeat > player.ship.laserHeatLevelAft       ? maxHeat : player.ship.laserHeatLevelAft;
  maxHeat = maxHeat > player.ship.laserHeatLevelPort      ? maxHeat : player.ship.laserHeatLevelPort;
  maxHeat = maxHeat > player.ship.laserHeatLevelStarboard ? maxHeat : player.ship.laserHeatLevelStarboard;

  // check temperature of hottest laser to be below the threshold
  if (maxHeat > this._rotHeatLevel) {
    var msg = "Security override: Laser temperature exceeding rotation specification.";
    player.consoleMessage(msg);
    this._rotating = false;
    return;
  }

  // start sound and timer
  this._sndStart.play();
  this._rotationTimer = new Timer(this, this._startLoop, this._startLen);

  // remember data and weapons
  this._steps = steps;
  this._forwardWeapon = player.ship.forwardWeapon;
  this._portWeapon = player.ship.portWeapon;
  this._aftWeapon = player.ship.aftWeapon;
  this._starboardWeapon = player.ship.starboardWeapon;

  // remove weapons, so no fire is possible
  player.ship.forwardWeapon = null;
  player.ship.portWeapon = null;
  player.ship.aftWeapon = null;
  player.ship.starboardWeapon = null;

  // replace crosshairs with custom version, depending on rotation direction
  this._crosshairs = player.ship.crosshairs;
  if (steps>0) {
    player.ship.crosshairs = "weapon-rotator-xhairs-r.plist";
  }
  else {
    player.ship.crosshairs = "weapon-rotator-xhairs-l.plist";
  }

  ++this._operationTotal;
  ++this._operationCount;
}

this._startLoop = function()
{
  // stop old timer
  this._rotationTimer.stop();
  delete this._rotationTimer;
  // setup loop timer
  this._rotationTimer = new Timer(this, this._finishRotation, this._loopLen * Math.abs(this._steps));
  // start looping sound
  this._sndStart.stop();
  this._sndLoop.play();
}

this._finishRotation = function()
{
  // stop timer
  this._rotationTimer.stop();
  delete this._rotationTimer;

  this._sndLoop.stop();
  this._sndFinish.play();

  // reduce rotations to the possible 3 rotations
  var stepSelect = (this._steps + 4) % 4; // normalize to positive integer

  // re-fit rotated weapons
  switch (stepSelect) {
  case 1: // one step clockwise
    player.ship.forwardWeapon = this._portWeapon;
    player.ship.portWeapon = this._aftWeapon;
    player.ship.aftWeapon = this._starboardWeapon;
    player.ship.starboardWeapon = this._forwardWeapon;
    break;

  case 2: // two steps either direction
    player.ship.forwardWeapon = this._aftWeapon;
    player.ship.aftWeapon = this._forwardWeapon;
    player.ship.portWeapon = this._starboardWeapon;
    player.ship.starboardWeapon = this._portWeapon;
    break;

  case 3: // one step anticlockwise
    player.ship.forwardWeapon = this._starboardWeapon;
    player.ship.portWeapon = this._forwardWeapon;
    player.ship.aftWeapon = this._portWeapon;
    player.ship.starboardWeapon = this._aftWeapon;
    break;
  }

  this._rotationPos += stepSelect;
  this._rotationPos %= 4;

  // forget remembered weapons
  this._forwardWeapon = null;
  this._portWeapon = null;
  this._aftWeapon = null;
  this._starboardWeapon = null;
  // re-install crosshairs
  player.ship.crosshairs = this._crosshairs;
  this._crosshairs = null;

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
  this._rotating = false;
};



// --------------------------------------------
// general helper functions

this._getMissionVariable = function(varName, defaultValue)
{
  var missVar = missionVariables[this._storablePrefix + varName];
  this[varName] = missVar==null? defaultValue : missVar;
}

this._setMissionVariable = function(varName)
{
  missionVariables[this._storablePrefix + varName] = this[varName];
}

this._loadMissionVariables = function()
{
  for (var i=0; i<this._storables.length; ++i) {
    var storeItem = this._storables[i];
    this._getMissionVariable(storeItem.name, storeItem.defaultValue);
  }
}

this._saveMissionVariables = function()
{
  for (var i=0; i<this._storables.length; ++i) {
    this._setMissionVariable(this._storables[i].name);
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
