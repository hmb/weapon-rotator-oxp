"use strict;"

this.name           = "WeaponRotatorHighQualityEquipment"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 2013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This script implements the high quality weapon rotator.";
this.version        = "0.3"

this.activated = function()
{
  worldScripts.WeaponRotatorMain._rotateSteps(1, false);
}

this.mode = function()
{
  worldScripts.WeaponRotatorMain._rotateSteps(-1, false);
}
