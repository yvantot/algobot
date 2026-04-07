import { lerp } from "../utils/math.js";
import { RewardTypes, CropTypes } from "./enum.js";

export const TYPE_COLORS = {
	keyword: "#c678dd",
	variable: "#abb2bf",
	function: "#61afef",
};

export const LEVEL_REWARDS_DATA = {
	DEFAULT: { type: RewardTypes.COIN, amount: 10 },
	1: { type: RewardTypes.CROPS, item: CropTypes.WHEAT, amount: 10 },
	5: { type: RewardTypes.CROPS, item: CropTypes.CORN, amount: 10 },
	10: { type: RewardTypes.CROPS, item: CropTypes.TOMATO, amount: 10 },
	20: { type: RewardTypes.CROPS, item: CropTypes.WHEAT, amount: 10 },
	15: { type: RewardTypes.CROPS, item: CropTypes.WHEAT, amount: 10 },
	25: { type: RewardTypes.CROPS, item: CropTypes.WHEAT, amount: 10 },
	30: { type: RewardTypes.CROPS, item: CropTypes.WHEAT, amount: 10 },
};

export const PLAYER_DATA = {
	level: 0,
	exp: 654,
	custom: {
		farm_name: "My Amazing Farm",
	},
	getLevel() {
		return Math.floor(this.exp / 100);
	},
	changeExp(amount) {
		this.exp += amount;
		this.updateUI();
	},
	updateUI() {
		// This should scale
		const level = this.getLevel();
		if (level > this.level) {
			// This should do animation
			const player_ui = document.getElementById("player-info");
			player_ui.classList.remove("jello-horizontal-normal");
			void player_ui.offsetWidth;
			player_ui.classList.add("jello-horizontal-normal");
		}
		this.level = level;
		const progress = this.exp % 100;
		document.getElementById("player-level").innerText =
			`Level ${Math.floor(level)}`;
		document.getElementById("progress-level").style.width = progress + "%";
	},
};

export const INVENTORY = {
	coins: 10,
	crops: {
		[CropTypes.WHEAT]: 99,
		[CropTypes.CORN]: 99,
		[CropTypes.RICE]: 0,
		[CropTypes.POTATO]: 0,
		[CropTypes.SUGARCANE]: 0,
		[CropTypes.TOMATO]: 99,
	},
	elements: {
		coin: null,
		[CropTypes.WHEAT]: null,
		[CropTypes.CORN]: null,
		[CropTypes.RICE]: null,
		[CropTypes.POTATO]: null,
		[CropTypes.SUGARCANE]: null,
		[CropTypes.TOMATO]: null,
	},
	changeCoins(amount) {
		if (this.elements.coin === null) this.setElements();
		if (!this.elements.coin) return;

		const start_value = this.coins;
		const end_value = this.coins + amount;
		const duration = 500;
		const start_time = performance.now();

		const animate = (current_time) => {
			const elapsed = current_time - start_time;
			const progress = Math.min(elapsed / duration, 1);

			const current_value = Math.floor(
				start_value + (end_value - start_value) * progress,
			);
			this.elements.coin.innerText = current_value;

			if (progress < 1) {
				requestAnimationFrame(animate);
			} else {
				this.elements.coin.innerText = end_value;
			}
		};

		const icon = document.getElementById("coin-icon");
		if (icon) {
			icon.classList.remove("jello-horizontal-normal");
			void icon.offsetWidth;
			icon.classList.add("jello-horizontal-normal");
		}
		this.coins = end_value;

		requestAnimationFrame(animate);
	},
	changeCrops(type, amount) {
		this.crops[type] += amount;

		this.updateUI();
	},
	setElements() {
		this.elements.coin = document.getElementById("coin");
		this.elements[CropTypes.WHEAT] = document.getElementById(CropTypes.WHEAT);
		this.elements[CropTypes.CORN] = document.getElementById(CropTypes.CORN);
		this.elements[CropTypes.RICE] = document.getElementById(CropTypes.RICE);
		this.elements[CropTypes.POTATO] = document.getElementById(CropTypes.POTATO);
		this.elements[CropTypes.SUGARCANE] = document.getElementById(
			CropTypes.SUGARCANE,
		);
		this.elements[CropTypes.TOMATO] = document.getElementById(CropTypes.TOMATO);
	},
	updateUI() {
		if (this.elements.coin === null) this.setElements();

		if (this.elements[CropTypes.WHEAT])
			this.elements[CropTypes.WHEAT].innerText = this.crops[CropTypes.WHEAT];
		if (this.elements[CropTypes.CORN])
			this.elements[CropTypes.CORN].innerText = this.crops[CropTypes.CORN];
		if (this.elements[CropTypes.RICE])
			this.elements[CropTypes.RICE].innerText = this.crops[CropTypes.RICE];
		if (this.elements[CropTypes.POTATO])
			this.elements[CropTypes.POTATO].innerText = this.crops[CropTypes.POTATO];
		if (this.elements[CropTypes.SUGARCANE])
			this.elements[CropTypes.SUGARCANE].innerText =
				this.crops[CropTypes.SUGARCANE];
		if (this.elements[CropTypes.TOMATO])
			this.elements[CropTypes.TOMATO].innerText = this.crops[CropTypes.TOMATO];
	},
};

export const DOCUMENT_DATA = {
	globals: {
		bot: {
			definition: "",
			example: ``,
			type: "variable",
		},
		rows: {
			definition: "",
			example: ``,
			type: "variable",
		},
		columns: {
			definition: "",
			example: ``,
			type: "variable",
		},
	},
	syntax: {
		var: {
			definition:
				"A variable stores a value under a name so you can use or change it later.",
			example: `var speed = 5;\nvar cropName = "wheat";\nvar isReady = true;`,
			type: "keyword",
		},
		const: {
			definition:
				"Declares a variable whose value cannot be reassigned. Use it when the value should never change.",
			example: `const MAX_SPEED = 10;\nconst FARM_NAME = "Green Acres";`,
			note: "You must assign a value when you declare a 'const'. You can't leave it empty and fill it in later. Also, objects and arrays declared with 'const' can still have their contents changed.",
			type: "keyword",
		},
		if: {
			definition: "Runs a block of code only if a condition is true.",
			example: `if (cropCount > 10) {\n  console.log("Plenty of crops!");\n}`,
			note: "Don't confuse '==' (comparison) with '=' (assignment) inside conditions. Also, a missing curly brace can cause only the first line to be conditional.",
			type: "keyword",
		},
		else: {
			type: "keyword",
			definition: "Runs a block of code when the 'if' condition is false.",
			example: `if (isRaining) {\n  console.log("Stay inside.");\n} else {\n  console.log("Go outside.");\n}`,
		},
		else_if: {
			type: "keyword",
			definition:
				"Checks another condition if the previous 'if' was false. You can chain multiple 'else if' blocks together.",
			example: `if (score >= 90) {\n  console.log("A");\n} else if (score >= 75) {\n  console.log("B");\n} else {\n  console.log("C");\n}`,
			note: "Conditions are checked top to bottom and stop at the first true one. Order matters, putting a broader condition before a narrower one can make the narrower one unreachable.",
		},
		"!": {
			type: "keyword",
			definition:
				"Negates a boolean. For example, true will be false, false will be true.",
			example: `if (!true) bot.right();`,
			note: "You must use it syntatically correct in-order to work.",
		},
		true: {
			type: "keyword",
			definition:
				"Represents a truth value. It means 'yes', 'correct', or 'condition is satisfied'. In programming, true is used to control decisions and logic.",
			example: `if (true) bot.right();`,
			note: 'true is not a string. Writing "true" is text, not a boolean value.',
		},
		false: {
			type: "keyword",
			definition:
				"Represents a false value. It means 'no', 'incorrect', or 'condition is not satisfied'. It is used to stop actions or choose alternative paths.",
			example: `if (false) bot.left();`,
			note: "false is not the same as 0 or null, though some languages may treat them similarly in conditions.",
		},
		for: {
			type: "keyword",
			definition:
				"Repeats a block of code a set number of times using a counter variable.",
			example: `for (let i = 0; i < 5; i++) {\n  console.log("Step " + i);\n}`,
			note: "Off-by-one errors are common, double-check whether your condition uses '<' or '<='. Also, forgetting to increment 'i' creates an infinite loop.",
		},
		break: {
			type: "keyword",
			definition: "Immediately exits a loop or switch statement.",
			example: `for (let i = 0; i < 10; i++) {\n  if (i === 5) break;\n  console.log(i);\n}`,
			note: "'break' only exits the innermost loop or switch. If you have nested loops, it won't break out of the outer one.",
		},
		continue: {
			type: "keyword",
			definition:
				"Skips the rest of the current loop iteration and jumps to the next one.",
			example: `for (let i = 0; i < 5; i++) {\n  if (i === 2) continue;\n  console.log(i); // prints 0, 1, 3, 4\n}`,
			note: "Like 'break', 'continue' only affects the innermost loop. Overusing it can make loops harder to read and reason about.",
		},
		while: {
			type: "keyword",
			definition: "Repeats a block of code as long as a condition stays true.",
			example: `let water = 10;\nwhile (water > 0) {\n  water--;\n}`,
			note: "If the condition never becomes false, the loop runs forever and crashes your program. Always make sure something inside the loop moves it toward ending.",
		},
		function: {
			type: "keyword",
			definition:
				"A reusable named block of code. Define it once, call it as many times as you need.",
			example: `function greet(name) {\n  console.log("Hello, " + name);\n}\n\ngreet("Alex");`,
			note: "A function must be called to run, defining it does nothing on its own. Also, variables declared inside a function are not accessible outside of it.",
		},
		return: {
			type: "keyword",
			definition:
				"Exits a function and optionally sends a value back to whoever called it.",
			example: `function add(a, b) {\n  return a + b;\n}\n\nlet sum = add(3, 4); // sum is 7`,
			note: "Any code written after 'return' in the same block will never run. Also, a function without a 'return' statement gives back 'undefined' by default.",
		},
		switch: {
			type: "keyword",
			definition:
				"Compares a value against multiple specific cases and runs the matching block.",
			example: `switch (var_num) {\n  case 1:\n    console.log("var_num is 1");\n    break;\n  case 2:\n    console.log("var_num is 2");\n    break;\n  default:\n    console.log("Unknown number!");\n}`,
			note: "Forgetting 'break' causes 'fall-through', the code keeps running into the next case even if it doesn't match. Always add 'break' unless fall-through is intentional.",
		},
	},
	functions: {
		wait: {
			parameters: "",
			definition: "",
			note: "",
			type: "function",
		},
		randi: {
			parameters: "",
			definition: "",
			note: "",
			type: "function",
		},
		randf: {
			parameters: "",
			definition: "",
			note: "",
			type: "function",
		},
	},
	bot_movement: {
		up: {
			definition: "Moves the bot one tile upward from its current position.",
			example: `bot.up();`,
			type: "function",
		},
		down: {
			definition: "Moves the bot one tile downward from its current position.",
			example: `bot.down();`,
			type: "function",
		},
		right: {
			definition:
				"Moves the bot one tile to the right from its current position.",
			example: `bot.right();`,
			type: "function",
		},
		left: {
			definition:
				"Moves the bot one tile to the left from its current position.",
			example: `bot.left();`,
			type: "function",
		},
		jump: {
			type: "function",
			definition:
				"Jump the bot directly to a specific tile by its x and y coordinates on the grid.",
			example: `bot.jump(3, 5); // bot jumps to tile at column 3, row 5`,
			note: "Make sure the target coordinates are valid tiles on the grid, jumping out of bounds will cause an error.",
		},
	},
	bot_farm_actions: {
		say: {
			type: "function",
			definition:
				"Makes the bot display a message as a popup above its head. The popup fades in and then fades out automatically.",
			example: `bot.say("Hello, farmer!");\nbot.say("Crop is ready!");`,
			note: "The message must be a string. say() is great for debugging your bot's logic, use it to confirm what your bot is doing and when.",
		},
		till: {
			type: "function",
			definition:
				"Prepares the soil on the bot's current tile for planting. The tile must be tilled before a crop can be planted on it.",
			example: `bot.till();`,
			note: "You cannot plant on a tile that hasn't been tilled first.",
		},
		water: {
			type: "function",
			definition:
				"Waters the soil on the bot's current tile. Crops need water to grow.",
			example: `bot.water();`,
			note: "Watering a tile that hasn't been planted yet has no effect.",
		},
		plant: {
			type: "function",
			definition:
				"Plants a specified crop on the bot's current tile. The tile must already be tilled.",
			example: `bot.plant("wheat");\nbot.plant("carrot");`,
			note: "You must pass the crop name as a string argument. Planting on an untilled tile will fail.",
		},
		harvest: {
			type: "function",
			definition: "Harvests the fully grown crop on the bot's current tile.",
			example: `bot.harvest();`,
			note: "You can only harvest a crop that is fully grown. Use bot.is_harvestable() to check before harvesting to avoid wasting a command.",
		},
		destroy: {
			type: "function",
			definition: "Destroys crop that is on the bot's current tile.",
			example: `bot.destroy();`,
			note: "This is permanent. Destroying a crop means losing it entirely.",
		},
		kill_bug: {
			type: "function",
			definition:
				"Eliminates a bug on the bot's current tile. Bugs can damage or destroy your crops if left alone.",
			example: `bot.kill_bug();`,
			note: "The bot must be on the same tile as the bug for this to work.",
		},
		hold_plant: {
			type: "function",
			definition:
				"Picks up the plant on the bot's current tile so it can be carried and placed elsewhere.",
			example: `bot.hold_plant();`,
			note: "The bot can only hold one plant at a time. Make sure to drop it with drop_plant() before trying to pick up another.",
		},
		drop_plant: {
			type: "function",
			definition:
				"Places the plant the bot is currently holding onto the current tile.",
			example: `bot.drop_plant();`,
			note: "The bot must be holding a plant for this to do anything. Dropping on an occupied tile may cause unexpected behavior.",
		},
	},
	bot_checks: {
		is_tilled: {
			type: "function",
			definition:
				"Checks whether the bot's current tile has been tilled. Returns true if tilled, false otherwise.",
			example: `if (bot.is_tilled()) {\n  bot.plant("wheat");\n}`,
		},
		is_watered: {
			type: "function",
			definition:
				"Checks whether the bot's current tile has been watered. Returns true if watered, false otherwise.",
			example: `if (!bot.is_watered()) {\n  bot.water();\n}`,
		},
		is_planted: {
			type: "function",
			definition:
				"Checks whether the bot's current tile has a crop planted on it. Returns true if planted, false otherwise.",
			example: `if (bot.is_planted()) {\n  console.log("Something is growing here.");\n}`,
		},
		is_harvestable: {
			type: "function",
			definition:
				"Checks whether the crop on the bot's current tile is fully grown and ready to harvest. Returns true or false.",
			example: `if (bot.is_harvestable()) {\n  bot.harvest();\n}`,
		},
	},
	shop: {
		buy_plant: {
			type: "function",
			definition: "",
			example: "",
		},
	},
};

export const CROP_DATA = {
	[CropTypes.WHEAT]: {
		health: 10,
		duration: 1,
		reward: 5,
		exp: 5,
		spoilage_time: 15,
		resistance: {
			thunder: 0,
			flood: 0,
			fire: 0,
			bug: 0,
		},
	},
	[CropTypes.CORN]: {
		health: 10,
		duration: 40,
		reward: 6,
		exp: 6,
		spoilage_time: 30,
	},
	[CropTypes.RICE]: {
		health: 10,
		duration: 25,
		reward: 8,
		exp: 3,
	},
	[CropTypes.POTATO]: {
		health: 10,
		duration: 35,
		reward: 15,
		exp: 4,
	},
	[CropTypes.SUGARCANE]: {
		health: 10,
		duration: 15,
		reward: 5,
		exp: 5,
	},
	[CropTypes.TOMATO]: {
		health: 10,
		duration: 30,
		reward: 30,
		exp: 20,
		spoilage_time: 10,
	},
};

export const SAY_DATA = {
	farm: {
		error: {
			till_tilled: "Already tilled",
			water_initial: "Till the soil first",
			water_watered: "Already watered",
			water_harvestable: "The crop is harvestable",
			plant_planted: "Tile is already planted",
			plant_initial: "The soil is not tilled",
			harvest_not_ready: "The crop is not fully grown",
			destroy_absoring: "The crop is absoring water",
			crop_dead: "The crop is dead, destroy instead",
			out_of_bounds: "Out of bounds",
			insufficient_resources: "Insufficient resources",
			no_plant: "Plant the soil first",
		},
	},
};

export const CAMERA = {
	x: 500,
	y: 700,
};

export const MOUSE = {
	is_pressing: false,
};

export const CONFIG = {
	FARM: {
		robots: 1,
		rows: 3,
		columns: 3,
		gap: 12,
		tile_size: 64,
		tile_radius: 12,
		bg_soil: "#EFB675",
		bg_grass: "#719816",
	},
	BOT: {
		action_duration: 0.1, // MUST BE 0.5
		check_duration: 0.1, // MUST BE 0.2
	},
};

export function setGridOrigin(k, farm) {
	farm.cell_size = farm.tile_size + farm.gap;
	farm.grid_size = {
		w: farm.rows * farm.tile_size + (farm.rows - 1) * farm.gap,
		h: farm.columns * farm.tile_size + (farm.columns - 1) * farm.gap,
	};
	farm.grid_origin = {
		x: k.width() / 2 - farm.grid_size.w / 2,
		y: k.height() / 2 - farm.grid_size.h / 2,
	};
}

export function setCameraCenter(k, camera) {
	camera.x = k.width() / 2;
	camera.y = k.height() / 2;
}
4;
