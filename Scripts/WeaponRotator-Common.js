"use strict";

this.name           = "WeaponRotatorCommon"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 20013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements common functions used throughout the weapon rotator";
this.version        = "0.1"

// --------------------------------------------
// private properties

// prefix to mission variables
this._storablePrefix = "weaponRotator";



// --------------------------------------------
// general helper functions

this._getMissionVariable = function(obj, storeItem)
{
  var missionVar = missionVariables[this._storablePrefix + storeItem.name];
  obj[storeItem.name] = missionVar==null? storeItem.defaultValue : missionVar;
}

this._setMissionVariable = function(obj, name)
{
  missionVariables[this._storablePrefix + name] = obj[name];
}

this._loadMissionVariables = function(obj)
{
  var storables = obj._storables;

  for (var i=0; i<storables.length; ++i) {
    this._getMissionVariable(obj, storables[i]);
  }
}

this._saveMissionVariables = function(obj)
{
  var storables = obj._storables;

  for (var i=0; i<storables.length; ++i) {
    this._setMissionVariable(storables[i].name);
  }
}

this._resetMissionVariableDefaults = function(obj)
{
  var storables = obj._storables;

  for (var i=0; i<storables.length; ++i) {
    obj[storables[i].name] = storables[i].defaultValue;
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
