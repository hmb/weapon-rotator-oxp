"use strict;"

this.name           = "WeaponRotator-AutoRotatorEquipment"
this.author         = "Holger B�hnke"
this.copyright      = "(C) 2013 Holger B�hnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This script implements the high quality weapon rotator.";
this.version        = "0.1"

this.activated = function()
{
  worldScripts.WeaponRotatorAutoRotator._storeCurrentPosition();
  player.consoleMessage("Auto Rotator: position stored");
}

this.mode = function()
{
  if (worldScripts.WeaponRotatorAutoRotator._rotateToStoredPosition()) {
    player.consoleMessage("Auto Rotator: test run");
  }
  else {
    player.consoleMessage("Auto Rotator: no stored position available");
  }
}
