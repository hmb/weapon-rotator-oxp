"use strict;"

this.name           = "WeaponRotator-AutoRotatorEquipment"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 2013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This script implements the high quality weapon rotator.";
this.version        = "0.1"

this.activated = function()
{
  worldScripts.WeaponRotatorAutoRotator._storeCurrentPosition();
  player.consoleMessage("Auto Rotator: current position stored as emergency position.");
}
