"use strict;"

this.name           = "WeaponRotatorLowBudgetEquipment"
this.author         = "Holger B�hnke"
this.copyright      = "(C) 2013 Holger B�hnke"
this.licence        = "Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported"
this.description    = "This script implements the low budget weapon rotator.";
this.version        = "0.2"

this.activated = function()
{
  worldScripts.WeaponRotatorMain._rotateSteps(1, false);
}

this.mode = function()
{
  worldScripts.WeaponRotatorMain._rotateSteps(-1, false);
}
