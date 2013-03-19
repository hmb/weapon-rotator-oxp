Weapon Rotator OXP Version 0.2.0
--------------------------------

Purpose
-------
Who of us pilots, who don't mean harm to anybody, peacefully go after our business, are rudely interrupted by pirates menacefully attacking our ship? When mining asteroids nothing disturbs you more than a fleet of pirates trying to kill you and get the fruit of your efforts for free.

Well, mining works best, when you slice an asteroid and then slowly approach the remaining boulders until you could possibly touch them with your bare hand. Not liturally of course, since you cannot just open a window in deep space, but you know what I mean. Anyway, just before you collide, you give the boulder a final blast with your mining laser, it splits into splinters and beeing that close they are immediately scooped up. If you even have an "Ore Processor" (http://wiki.alioth.net/index.php/Ore_Processor) then you just let the money roll in.

This of course works best when you fit the mining laser at front. Many tried it sideways and it works no way. First it's incovenient circling boulders sideways and getting close the same time. Then once you blast them into splinters they all drift away into opposite directions. By the time you turn the ship, you already have them nicely spread all over the place. You then have to round them up like a herd of sheep beeing attacked by a woolf.

Ok, I see, you understand. So you fit your mining laser up front and happliy go mining. This is what pirates only wait for. Once you processed all your ore and did the dirty work, they lauch an attack and you won't stand a chance against them with your tiny mining laser.

This basically leaves you only the option to go to a dull and boring democracy, dock at the station, park your military laser sideways, fit the mining laser at front, go mining and hope no pirates attack you. Then you return with your filled up cargo space and reverse the process. Other than the costs and hassle to constantly re-fit your ship, you could go mining only at certain techlevels, where they sell military lasers. Then the system has to be otherwise quite harmless, in order to survive without a front military laser, restricting your choice of worlds even further. This is exactly what everybody else does, so you have to share those crumpy remains of asteroids with lots of other miners.

You're probably already sold on what we have to offer, even if you still don't know anything about it. Well here comes the solution (tada): The Weapon Rotator!

You fit the weapon rotator at your ship and then you could rotate all four weapons in flight with the push of a button. Switch to front mining laser, scoop up splinters like hell. Pirates attack, you switch back to front military laser and teach them a little lesson. Go to feudal or anarchy worlds, clean up the area of pirates, then take all the time you need to get the valuable stuff out of the asteroids.

Equipment details
-----------------
There are several versions spotted in the marketplace. The high quality "Bore & Ratter Weapon Rotator" is quite expensive, but comes with almost all features you need. It is very precise, so you won't notice any inaccuracy when fireing. It runs quickly and smoothly and needs almost no maintenance other than within the ususal intervals. It has a certificate of authenticy attached to it and it's production facility can always be traced.

Some lesser funded pilots may be tempted to buy a much cheaper "Original Bore & Ratter Weapon Rotator" product. Well, while surely the guys at B&R don't give away their stuff, think for yourself, if you're offered a device for less than half the announced factory price. While some of you may be lucky and get a real refurbished device at low costs, others will be ending up with a cheap imitation from some dubious world in the third galaxy. Nothing worse than constantly maintainig such a device, or even having it break down at crucial moments.

Additional equipment may be available at appropriate techlevel worlds. The B&R Auto-Rotator is an interface device that connects to both, your combat engine and the Weapon Rotator. It automatically sets a given weapon configuration when your status indicator goes red, thus saving yourself valuable seconds in combat.

A special shielding is available, protecting your Weapon Rotator against laser blasts. As the device is - naturally - mounted on the outside of the ship, it is one of the first devices taking possible damage in combat. The additional shielding gives a better protection from enemy laser fire.

Handling
--------
Like many other special equipment you select it using the 'N' key (shift-n) and activate it's clockwise rotation using the 'n' key (lowercase n). The anticlockwise rotation is triggered using the 'b' key. The Auto-Rotator stores the current configuration when selected 'N' and activated 'n'.

OXP Status
----------
While the OXP is still in an early stage of development, the core is already working quite well. There are still some areas to work in:

- the laser temperature should stick with each weapon
- what happens when you rotate weapons in unusual condition
  (during docking, while scooping, whilst close to the sun...)?
- different versions of the Weapon Rotator (low-cost, high quality)
- shielding and Auto-Rotator still have to be implemented.

Download
--------
https://www.box.com/s/882u5f8sah1uz4rcqm8z

Sourcecode
----------
https://github.com/hmb/weapon-rotator-oxp

License
-------
This work is licensed under the Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License. To view a copy of this license, visit http://creativecommons.org/licenses/by-nc-sa/3.0/ or send a letter to Creative Commons, 444 Castro Street, Suite 900, Mountain View, California, 94041, USA.

Development & Contact
---------------------
This OXP was developed by Holger Böhnke.
oxpdev@hb.familymail.de

Credits
-------
Thanks to all the people having put this incredible effort into developing oolite, documenting the API and creating all those OXPs. Too many to mention them all, but that's what makes the game so interesting, when you can configure your setup to your likes.

Changelog
---------

2013-03-19 0.2.0 Add several new features and some bugfixes.

Features:
- Add a different damage probability to the LB and HQ version, leading to the
  LB version getting damaged three times as othen as normal equipment. The HQ
  version is more stable than normal equipment.
- Add different sounds for both versions. The sounds are now split into start,
  loop and ending sound, thus allowing for a variable length of rotation.
- The description of the lowcost device has been altered to sound like a cheap
  translation of a non-native speaker, like the descriptions often to be found
  in cheap imitations of products.
- Add a different rotation time for both versions of the WR. The HQ device now
  rotates quite fast, while the LB device drags endlessly.
- Add an operation counter, remembering the number of invocations. This is
  currently used in the refund calculation. It will in future also determine
  the malfunction probability of the LB device.
- Increase the prices and add a bigger gap between both devices. Inexperienced
  pilots won't be able to get the original equipment to early.
- Use special crosshairs indicationg the rotation direction. The new crosshairs
  consist of 4 arrows in a row, in either left or right direction.

Bugfixes:
- Fix the check of the equipment presence.
  Due to a misunderstanding the function EquipmentInfo.infoForKey("EQ_XXX")
  had been used to determine, whether an equipment is present. This is wrong,
  it justs reveals, if the equipment is known at all to Oolite. To find out
  whether it is attached to the ship, we have to use player.ship.equipmentStatus.
  This created an issue in the playerBoughtEquipment event, leading to an
  unwanted refund when repairing a damaged WR. It also messed up the
  initialization process, leading to the wrong equipment being used at startup.
- Rename custom functions to _XXX. While this is not really a bug it is still
  best practice and avoids future collisions with new event handlers.

Misc:
- The code has been added to github: https://github.com/hmb/weapon-rotator-oxp

2013-03-06 0.1.1 Set max required version to 1.78.

2013-03-05 0.1.0 Create the first proof of concept.
