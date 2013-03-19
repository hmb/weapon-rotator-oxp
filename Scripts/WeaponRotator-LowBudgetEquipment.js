"use strict;"

this.name           = "WeaponRotatorLowBudgetEquipment"
this.author         = "Holger Böhnke"
this.copyright      = "(C) 2013 Holger Böhnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This script implements the low budget weapon rotator.";
this.version        = "0.2"

this.activated = function()
{
  worldScripts.WeaponRotatorMain._rotateWeapons(1);
}

this.mode = function()
{
  worldScripts.WeaponRotatorMain._rotateWeapons(-1);
}
