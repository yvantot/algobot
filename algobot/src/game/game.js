import { k, init_kaplay } from "../lib/kaplay.js";

const CROP_DATA = {
	wheat: {
		duration: 30,
		reward: 3,
		weakness: null,
		strength: null,
	},

	corn: {
		duration: 20,
		reward: 6,
		weakness: "pest",
		strength: "adjacency",
	},

	rice: {
		duration: 25,
		reward: 8,
		weakness: "flood",
		strength: "storm_resistant",
	},

	potato: {
		duration: 35,
		reward: 15,
		weakness: "drought",
		strength: "underground",
	},

	sugarcane: {
		duration: 15,
		reward: 5,
		weakness: "fire",
		strength: "regrow",
	},

	tomato: {
		duration: 30,
		reward: 25,
		weakness: "spoil",
		strength: "high_demand",
	},
};

const FARM_CONFIG = {
	size_x: 3,
	size_y: 3,
	tile_size: 64,
	gap: 8,
};

const ROBOT_CONFIG = {
	// All action have an equal duration
	action_duration: 0.5,
};

const CropStates = {
	YOUNG: 0,
	ADULT: 1,
	HARVESTABLE: 2,
	DEAD: 3,
};

const SoilStates = {
	INITIAL: 0,
	READY: 1,
	WATERED: 2,
};

const farm_cell = {
	soil: null, // SoilComp
	plant: null, // PlantComp
};

// TODO: Make plantcomp and use Array, use obj.get("plant")
// Plant compose of gridpos, health, plant
// plantcomp compose of growth state,

// This is only for saving
const farm_grid = Array.from({ length: FARM_CONFIG.size_y }, () => Array.from({ length: FARM_CONFIG.size_x }, () => ({ soil_state: SoilStates.INITIAL, crop: null })));

export function game() {
	init_kaplay();

	k.loadSprite("wheat_young", "/sprites/wheat_young.png");
	k.loadSprite("wheat_growing", "/sprites/wheat_growing.png");
	k.loadSprite("wheat_harvestable", "/sprites/wheat_harvestable.png");
	k.loadSprite("wheat_dead", "/sprites/wheat_dead.png");
	k.loadSprite("robot", "/sprites/robot_initial.png");
	k.loadSprite("soil", "/sprites/soil_tileset.png", { sliceX: 3, sliceY: 1 });

	k.scene("farm", () => {
		const robot = k.add([
			farmbot(), // []
			gridpos({ x: FARM_CONFIG.size_x, y: FARM_CONFIG.size_y }, 0, 0, FARM_CONFIG.tile_size / 2, FARM_CONFIG.tile_size / 2),
			actiontimer(),
			say(),
			k.sprite("robot"),
			k.pos(),
			k.z(1),
			k.animate(),
			k.scale(),
			k.anchor("bot"),
		]);
		const size = 20;
		const width = 64;
		const pos = k.vec2(0 - 64 / 2, 0 - 122 / 2);
		robot.add([k.text(0, { size, width, align: "center" }), k.z(3), k.pos(pos), k.color(k.GREEN)]);

		k.onKeyPress("1", () => {
			robot.till();
		});
		k.onKeyPress("2", () => {
			robot.water();
		});

		for (let y = 0; y < FARM_CONFIG.size_y; y++) {
			for (let x = 0; x < FARM_CONFIG.size_x; x++) {
				// Remove k.area() later in tiles, this is for just testing
				const soil_tile = k.add([
					gridpos({ x: FARM_CONFIG.size_x, y: FARM_CONFIG.size_y }, x, y),
					soil(0),
					k.sprite("soil"), // []
					k.pos(),
					k.z(0),
					k.area(),
				]);

				soil_tile.onClick(() => {
					robot.botJump(x, y, ROBOT_CONFIG.action_duration);
				});
			}
		}
	});

	k.go("farm");
}

function lerp(v0, v1, t) {
	return v0 + (v1 - v0) * t;
}

function lerpvec2(vec0, vec1, t) {
	const x0 = lerp(vec0.x, vec1.x, t);
	const y0 = lerp(vec0.y, vec1.y, t);
	return k.vec2(x0, y0);
}

// Handles the grid movement operations
function gridpos(grid_size, startX = 0, startY = 0, offsetX = 0, offsetY = 0) {
	if (startX < 0 || startX >= grid_size.x || startY < 0 || startY >= grid_size.y) {
		throw new Error("Out of bounds", { grid_size, startX, startY });
	}

	const CELL_SIZE = FARM_CONFIG.tile_size + FARM_CONFIG.gap;
	let OFFSET_X = k.width() / 2 - (grid_size.x * CELL_SIZE) / 2;
	let OFFSET_Y = k.height() / 2 - (grid_size.y * CELL_SIZE) / 2;

	return {
		gridX: startX,
		gridY: startY,

		id: "gridpos",
		require: ["pos"],

		add() {
			this.placeTo(startX, startY);
		},
		update() {},
		destroy() {},

		isWithinBounds(x, y) {
			if (x < 0 || x >= grid_size.x || y < 0 || y >= grid_size.y) {
				this.trigger("outofbounds");
				return false;
			}
			return true;
		},

		gridAxisToWorld() {
			return k.vec2(this.gridX * CELL_SIZE + offsetX + OFFSET_X, this.gridY * CELL_SIZE + offsetY + OFFSET_Y);
		},

		placeTo(x, y) {
			if (!this.isWithinBounds(x, y)) return;
			this.gridX = x;
			this.gridY = y;

			this.pos = k.vec2(x * CELL_SIZE + offsetX + OFFSET_X, y * CELL_SIZE + offsetY + OFFSET_Y);
		},

		jumpTo(x, y, duration) {
			if (!this.isWithinBounds(x, y)) return;
			this.gridX = x;
			this.gridY = y;

			const start_pos = this.pos;
			const target_pos = k.vec2(x * CELL_SIZE + offsetX + OFFSET_X, y * CELL_SIZE + offsetY + OFFSET_Y);
			const control_point = k.vec2(start_pos.x + (target_pos.x - start_pos.x) / 2, start_pos.y - (start_pos.y / target_pos.y) * 150);

			const points = [];
			const segments = 3;
			for (let i = 0; i <= segments; i++) {
				const t = i / segments;
				const p0 = lerpvec2(start_pos, control_point, t);
				const p1 = lerpvec2(control_point, target_pos, t);
				points.push(lerpvec2(p0, p1, t));
			}

			points.unshift(start_pos);
			points.push(target_pos);

			const keys = {
				START: 0,
				JUMPED: 0.3,
				HIGHEST: 0.5,
				FALLING: 0.6,
				GROUND: 0.9,
				END: 1,
			};

			this.animation.seek(0);

			this.animate("pos", points, {
				duration: duration,
				loops: 1,
				timing: [0, keys.JUMPED, 0.5, 0.6, 0.85, 1],
				easing: k.easings.linear,
				interpolation: "spline",
			});

			// prettier-ignore
			this.animate(
				"scale",
				[
					k.vec2(1, 1), 		// 1: start
					k.vec2(1.2, 0.9), 	// 2: readying to jump
					k.vec2(1.3, 0.8), 	// 3: --
					k.vec2(1.4, 0.8), 	// 4: --
					k.vec2(1, 1), 		// 5: jumped
					k.vec2(1.4, 1.5), 	// 6: in air
					k.vec2(0.9, 1.5), 	// 7: falling
					k.vec2(0.9, 1.1), 	// 8: --
					k.vec2(1, 1), 		// 9: on the ground
					k.vec2(1.1, 1), 	// 10: jiggling
					k.vec2(1, 1), 		// 11: --
					k.vec2(0.95, 1.05), // 12: --
					k.vec2(1, 1), 		// 13: --
				],
				{
					duration: duration,
					timing: [
						keys.START, 	// 1: start
						0.1, 			// 2: --
						0.15, 			// 3: --
						0.2, 			// 4: --
						keys.JUMPED, 	// 5: --
						keys.HIGHEST, 	// 6: --
						keys.FALLING, 	// 7: -- 
						0.7, 			// 8: -- 
						keys.GROUND, 	// 9: --
						0.92, 			// 10: --
						0.96, 			// 11: --
						0.98, 			// 12: --
						keys.END, 		// 13: --
					],
					loops: 1,
					easing: k.easings.easeInSine,
				},
			);
		},
	};
}

// This component says something and delete itself after sometime
function say() {
	return {
		id: "say",
		require: ["pos"],

		show(str, opt = {}) {
			// Make this better later
			const { duration = 2, size = 16, width = 64 * 2, textcolor = k.WHITE, bgcolor = k.RED, pos } = opt;
			const text = k.add([k.text(str, { size, width, align: "center" }), k.pos(pos), k.color(textcolor), k.opacity(0), k.timer(), k.z(3), k.animate(), k.scale(1, 1), k.anchor("center")]);
			text.animate("opacity", [0, 1, 0], { duration, loops: 1 });
			text.animate("scale", [k.vec2(0.5, 0.5), k.vec2(1, 1)], { duration, loops: 1, easing: k.easings.easeInOutSine });
			text.animate("pos", [k.vec2(pos), k.vec2(pos.x, pos.y - 40)], { duration, loops: 1, easing: k.easings.easeInOutSine });
			text.wait(duration, () => {
				text.destroy();
			});
		},
	};
}

function actiontimer() {
	return {
		id: "actiontimer",
		is_avail: true,

		startAction(duration) {
			this.is_avail = false;
			k.wait(duration, () => {
				this.is_avail = true;
				this.trigger("finished");
			});
		},
	};
}

// Handles the farmbot actions
function farmbot() {
	return {
		id: "farmbot",
		require: ["gridpos", "sprite"],
		add() {
			this.on("finished", () => {
				k.debug.log("Action finished");
			});
			this.on("outofbounds", () => {
				console.log("Out of bounds from farmbot object!");
			});
		},
		update() {},
		destroy() {},
		inspect() {},

		botJump(x, y, duration) {
			if (this.is_avail) {
				this.startAction(ROBOT_CONFIG.action_duration);
				this.jumpTo(x, y, duration);
			} else {
				this.showText("I'm still busy");
				return;
			}
		},
		showText(str) {
			const pos = this.gridAxisToWorld();
			this.show(str, { pos: k.vec2(pos.x, pos.y - 100) });
		},
		till() {
			const soil = k.get("soil").find((soil) => soil.gridX === this.gridX && soil.gridY === this.gridY);
			if (soil.state === SoilStates.INITIAL) {
				if (this.is_avail) {
					this.startAction(ROBOT_CONFIG.action_duration);
					soil.changeState(SoilStates.READY);
				} else {
					this.showText("I'm still busy");
					return;
				}
			} else {
				this.showText("It's already tilled");
			}
		},
		water() {
			const soil = k.get("soil").find((soil) => soil.gridX === this.gridX && soil.gridY === this.gridY);

			if (soil.state === SoilStates.READY) {
				if (this.is_avail) {
					this.startAction(ROBOT_CONFIG.action_duration);
					soil.changeState(SoilStates.WATERED);
				} else {
					this.showText("I'm still busy");
					return;
				}
			} else {
				this.showText("It's already watered or not tilled yet");
			}
		},
		plant(name) {},
		harvest() {},
		destroy() {},
		killbug() {},
	};
}

// Handles the soil component
function soil(state) {
	return {
		id: "soil",
		require: ["gridpos", "sprite"],

		state,
		add() {
			this.frame = state;
		},
		changeState(state) {
			this.state = state;
			this.frame = state;
		},
	};
}

// Handles the plant component
function crop(type) {
	const data = CROP_DATA[type];

	return {
		id: "crop",
		require: ["gridpos", "sprite"],

		type,
		age: 0,
		state: CropStates.YOUNG,
		duration: data.duration,
		reward: data.reward,
		weakness: data.weakness,
		strength: data.strength,

		harvested: false,

		update() {
			this.age += dt();

			if (this.age >= this.duration && !this.harvested) {
				this.trigger("ready");
			}
		},

		harvest() {
			if (this.age < this.duration) return;

			this.harvested = true;
			this.trigger("harvested", this.reward);

			if (this.strength === "regrow") {
				this.age = 0;
				this.harvested = false;
			} else {
				this.destroy();
			}
		},
	};
}
