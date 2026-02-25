import { k, init_kaplay } from "../lib/kaplay.js";

const TILE_SIZE = 64;
const GAP = 8;

const ROBOT_CONFIGS = {
	move: {
		duration: 0.5,
	},
};

const farm_grid = [
	[0, 0, 0],
	[0, 0, 0],
	[0, 0, 0],
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
		const planted_crops = [
			{
				crop_name: "wheat",
				duration: 30,
				reward: 5,
				x: 0,
				y: 0,
			},
		];

		let robot_x = 0;
		let robot_y = 0;

		const CELL_SIZE = TILE_SIZE + GAP;
		const OFFSET_X = k.width() / 2 - (farm_grid[0].length * TILE_SIZE) / 2;
		const OFFSET_Y = k.height() / 2 - (farm_grid.length * TILE_SIZE) / 2;

		const robot = k.add([k.sprite("robot"), k.pos(robot_x * CELL_SIZE + TILE_SIZE / 2 + OFFSET_X, robot_y * CELL_SIZE + TILE_SIZE / 2 + OFFSET_Y), k.z(1), k.animate(), k.scale(), k.anchor("bot")]);

		for (let y = 0; y < farm_grid.length; y++) {
			for (let x = 0; x < farm_grid[y].length; x++) {
				k.add([k.sprite("soil", { frame: farm_grid[y][x] }), k.pos(x * CELL_SIZE + OFFSET_X, y * CELL_SIZE + OFFSET_Y), k.z(0)]);
			}
		}

		k.onMousePress(() => {
			robot_x = k.randi(0, farm_grid[0].length);
			robot_y = k.randi(0, farm_grid.length);

			moveRobot(robot, robot_x, robot_y);
		});
	});

	k.go("farm");
}

function moveRobot(robot, x, y) {
	if (x < 0 || x >= farm_grid[0].length || y < 0 || y >= farm_grid.length) throw Error("Out of bounds");

	const CELL_SIZE = TILE_SIZE + GAP;

	const OFFSET_X = k.width() / 2 - (farm_grid[0].length * TILE_SIZE) / 2;
	const OFFSET_Y = k.height() / 2 - (farm_grid.length * TILE_SIZE) / 2;

	const target_pos = k.vec2(x * CELL_SIZE + TILE_SIZE / 2 + OFFSET_X, y * CELL_SIZE + TILE_SIZE / 2 + OFFSET_Y);

	robot.animation.seek(0);

	robot.animate("scale", [k.vec2(1, 1), k.vec2(1.1, 0.9), k.vec2(1.2, 0.8), k.vec2(1, 1), k.vec2(0.6, 1.4), k.vec2(0.8, 1.2), k.vec2(1.4, 1.4), k.vec2(0.8, 1.2), k.vec2(0.6, 1.4), k.vec2(1.1, 0.9), k.vec2(1.2, 0.8), k.vec2(1, 1)], {
		duration: ROBOT_CONFIGS.move.duration,
		loops: 1,
		easing: k.easings.easeOutQuad,
	});

	k.debug.log({ x, y });
}
