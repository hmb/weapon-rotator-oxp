"use strict";

this.name           = "WeaponRotatorAutoRotator"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 20013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This file implements the functionality of the auto rotator";
this.version        = "0.1"

// --------------------------------------------
// private properties

// internal variables that should be stored in missionVariables
this._storables = [
    { name: "_autoPosition",    defaultValue: null }  // stored position
  ];



// --------------------------------------------
// world script event handler functions

this.startUp = function()
{
  // load existing vars from missionVariables
  worldScripts.WeaponRotatorCommon._loadMissionVariables(this);
}

this.playerWillSaveGame = function(message)
{
  // store saveable vars in mission variables
  worldScripts.WeaponRotatorCommon._saveMissionVariables(this);
}

this.alertConditionChanged = function(newCondition, oldCondition)
{
  // condition is red and hostile activity detected
  if (newCondition == 3 && player.alertHostiles) {
    _rotateToStoredPosition();
  }
}



// --------------------------------------------
// auto rotator public member functions

this._storeCurrentPosition = function()
{
  this._autoPosition = worldScripts.WeaponRotatorMain._getRotationPosition();
}

this._rotateToStoredPosition = function()
{
  if (this._autoPosition != null) {
    worldScripts.WeaponRotatorMain._rotateToPosition(this._autoPosition, true);
  }
}
