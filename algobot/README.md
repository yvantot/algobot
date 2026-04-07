Todolists:
- [ X ] Control robots with code & blocks
- [ X ] Basic prototype: Planting, watering, harvesting
- [   ] Data structure compatible for loading and saving
- [ X ] Fix background & soil color clashing
- [   ] Events should help or challenge the player
- [ X ] Robot should be able to move left, right, up, down, no more 'Adventure Mode' since it will become another concept
- [   ] Finish Game Design Document

Important:
- Learn Typescript and rewrite the game
- [   ] Learn Statistics Fundamentals: https://www.youtube.com/playlist?list=PLblh5JKOoLUK0FLuzwntyYI10UQFUhsY9
- [   ] Learn Neural Networks
- [   ] Learn RNN

=====
Tbh, I think this syntax is better but it will make the game very easy because they can have checks anytime so nah:
- bot.crop_info()
- bot.soil_info()
Then they have to use a variable or access it directly
- var is_dead = bot.crop_info().is_dead;
So, instead, we should be smarter and provide every data player might need.

So bali, ang ipapakita natin sa mock/proposal defense ay:
TODO:
- Categorize documentation further, and add Shop functions and add more checks
- [ X ] Plant death
- [ X ] Tomato
- [   ] Event
- [ X ] Freshness state
- [ X ] Bot actions popup
- [   ] Multi-robot
- [   ] Add duration for checks
- [   ] Multiple files/multithreading
- [   ] Shop system
- [   ] Add freshness state:
	- Fresh: Light particles
	- Expiring: Flies particles
	- Dead: Stinky clouds

- Farm System
	Bot System
	[ X ] - (1) Bot
	[ X ] - Bot Commands
	[   ] - Multiple Robots

	Inventory System
	[  ] - Keep tracks of seeds, and money

	Crop System
	[ X ] - (3) Crops | Wheat, Corn, Tomato |

	Event System
	[   ] - (3) Events

	Programming System
	[ X ] - Text-based programming
		[ X ] - Step by step visual indicator
		[ X ] - Code Mirror integration
	[   ] - Block-based programming
		[   ] - Step by step visual indicator

- Quest System
	[   ] - (3) Quests | bot movement, bot actions, if, loop |

- Documentation System
	[ / ] - Bot commands
	[ / ] - Syntax

What's not included
- Machine Learning / Algorithm
- Tracking (data and proficiency) system
- Equipment system
- Cosmetics system

=====

Naming Convetion:

- Constant Global: MY_CONSTANT
- Function Components: mycomponent
- Variable: my_variable
- Function: myFunction
- Enums: MyEnums.VALUE
- Boolean: is_true

Skill Progression / Introducing student to the game
- Quest System : There will be quests that will introduce the player to the game concepts/loop.
- Documentation : There will be a documentation that the player can use.
- Achievement/Progression : To motivate player. e.g programming syntax usage.

Gameplay Loop
- Plant : Player must plant crops in order to upgrade stuff like new robots, faster CPU, equipments, keywords etc.
- Nurture : Player must take care of crops, such as protect them from bugs, events, etc.
- Harvest : Player must harvest those crops on time, or else, they will spoil and die.
- Optimize : Player must be punish for writing bad algorithms.

Since the game revolves around planting, caring, harvesting of plants, what are the plant challenges?
- Don't put too much water: When crop is harvestable, too much watering will kill the plant
- Harvest quickly: When crop is harvestable, it spoils and gets hurt intervally until it dies
- Resource management: Seeds are valuable, when destroyed or harvest, 0.25% to drop a seed

The player will plant crops, crop seeds are finite, so he must use it wisely. He can get seeds from quest, event drops, or from shop.

What this game tries to teach
In order to be good 'algorithmicly', first, the student must learn these concepts.
We'll teach them with Quest System and Documentation System:
- Variables: What is a variable?
- Data types: int, float, boolean, string
- Expressions: +, -, *, / and &&, ||, !
- Conditions: if, else, switch
- Repetitions: for, while, do-while
- Functions: func(input) -> output
- Arrays: []

----------------------------------------------
Game Concepts
::Game Loop
	Plant.Nurture.Harvest
	Automate.Adapt.Optimize

::Game Objectives
	To expand and grow farm with optimized algorithms.

::Bots
== Purpose ==
	Bots can be controlled with command system via text-based or block-based programming. Bots are used to manage the farm grid.

== Actions ==
	Movement
	- UP | DOWN | RIGHT | LEFT - Bot moves from its current position to specified direction
	- JUMP (x, y) - Bot jumps from its current position to tile x and y

	Farm
	- till | water | plant(crop) | harvest | destroy | kill_bug | hold_plant | drop_plant - Bot performs an action on the tile grid
	- Example: bot.till() | Note that commands takes time, always plan your command!

	Checks 
	- tilled | watered | planted | harvestable - Bot checks tile state
	- Example: bot.tilled() -> returns boolean

== Progression ==
	CPU cycle - Player can upgrade bots cycle to make execute commands faster
	1. Action duration: Duration of actions, upgrade CPU actions cycle
	2. Check duration: Duration of checks, upgrade CPU checks cycle
	
	Equipments - Player can buy its bots with equipments to give them abilities
	1. I still have no idea what kind of equipments :D

::Crops
	Behaviour
	1. States - Every crops have 3 states | Young | Growing | Harvestable |
	2. Unique Characteristics - Almost all crops have unique characteristics (e.g corn growth time boost when planted adjacently)
	3. Weakness - Almost all crops have weaknesses (e.g tomato fast spoilage time)
	4. Strength - Almost all crops have strengths (e.g potato protection against drought)
	5. Death - All crops dies from | Spoilage | Over-watering | Various events (e.g bugs, fire, flood)
		- Spoilage : When a plant is ready to harvest, when spoilage_time == 0, plant dies
	6. Rewards - All crops gives money as reward and drop seeds based on chances.

::Soil
	
::RNN + DQN
	- Adjusts game parameters based on player's proficiency
	- Spawn events

::Events
	Challenges
	- | disease | bugs | fire | rock | slow tiles |
	Helping Hand
	- | no spoilage | etc |

----------------------------------------------
### Issues
::Tile checks
	Problem: Currently robot can check tile states without cooldown, that means player can just put bunch of checks and have a one-script that manages all. This leads to a boring gameplay.
	Solution: Give it a duration.