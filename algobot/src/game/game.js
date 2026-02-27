import { k, init_kaplay } from "../lib/kaplay.js";

const FARM_CONFIG = {
	tile_size: 64,
	gap: 8,
};

const ROBOT_CONFIG = {
	action_duration: {
		move: 0.5,
	},
};

const SoilStates = {
	INITIAL: 0,
	READY: 1,
	WATERED: 2,
};

const farm_cell = {
	soil: SoilStates.INITIAL, // SoilComp
	plant: null, // PlantComp
};

// TODO: Make plantcomp and use Array, use obj.get("plant")
// Plant compose of gridpos, health, plant
// plantcomp compose of growth state,

const farm_grid = [
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
	[0, 0, 0, 0, 0],
];

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
			gridpos(farm_grid, 0, 0, FARM_CONFIG.tile_size / 2, FARM_CONFIG.tile_size / 2),
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
		robot.add([k.text(0, { size, width, align: "center" }), k.outline(3), k.z(3), k.pos(pos), k.color(k.GREEN)]);

		for (let y = 0; y < farm_grid.length; y++) {
			for (let x = 0; x < farm_grid[y].length; x++) {
				// Remove k.area() later in tiles, this is for just testing
				const tile = k.add([
					k.sprite("soil", { frame: farm_grid[y][x] }), // []
					k.pos(),
					gridpos(farm_grid, x, y),
					k.z(0),
					k.area(),
				]);

				tile.onClick(() => {
					robot.jumpTo(x, y, ROBOT_CONFIG.action_duration.move);
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
function gridpos(grid, startX = 0, startY = 0, offsetX = 0, offsetY = 0) {
	if (startX < 0 || startX >= grid[0].length || startY < 0 || startY >= grid.length) {
		k.debug.log("gridpos: Out of bounds");
		return null;
	}

	const CELL_SIZE = FARM_CONFIG.tile_size + FARM_CONFIG.gap;
	let OFFSET_X = k.width() / 2 - (grid[0].length * CELL_SIZE) / 2;
	let OFFSET_Y = k.height() / 2 - (grid.length * CELL_SIZE) / 2;

	let gridX = startX;
	let gridY = startY;

	return {
		id: "gridpos",
		require: ["pos"],
		add() {
			this.placeTo(startX, startY);
		},
		update() {},
		destroy() {},
		inspect() {},

		isWithinBounds(x, y) {
			if (x < 0 || x >= grid[0].length || y < 0 || y >= grid.length) {
				this.trigger("outofbounds");
				return false;
			}
			return true;
		},

		placeTo(x, y) {
			if (!this.isWithinBounds(x, y)) return;
			gridX = x;
			gridY = y;

			this.pos = k.vec2(x * CELL_SIZE + offsetX + OFFSET_X, y * CELL_SIZE + offsetY + OFFSET_Y);
		},

		jumpTo(x, y, duration) {
			if (!this.isWithinBounds(x, y)) return;
			gridX = x;
			gridY = y;

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

// Handles the farmbot actions
function farmbot() {
	return {
		id: "farmbot",
		require: ["gridpos", "sprite"],
		add() {
			this.on("outofbounds", () => {
				console.log("Out of bounds from farmbot object!");
			});
		},
		update() {},
		destroy() {},
		inspect() {},

		say(str) {},
		plant(name) {},
		water() {},
		harvest() {},
		destroy() {},
		killbug() {},
	};
}

// Handles the plant component
function crop(name) {
	return {};
}
