import { k, initKaplay } from "../lib/kaplay.js";
import { addFarmbot, addSoilToGrid, gridmove, gridpos } from "./components-kaplay/components.js";
import { MoveEnums, BotActEnums } from "./global/enum.js";
import { CAMERA, CONFIG, MOUSE, setGridOrigin, setCameraCenter, CROP_TYPES } from "./global/global.js";

export function game() {
	initKaplay();
	setGridOrigin(k, CONFIG.FARM);
	setCameraCenter(k, CAMERA);

	k.loadFont("Chintzy", "/fonts/chintzy.ttf");
	k.loadFont("Chintzys", "/fonts/chintzys.ttf");
	// Wheat
	k.loadSprite("wheat_young", "/sprites/wheat_young.png");
	k.loadSprite("wheat_growing", "/sprites/wheat_growing.png");
	k.loadSprite("wheat_harvestable", "/sprites/wheat_harvestable.png");
	k.loadSprite("wheat_dead", "/sprites/wheat_dead.png");
	// Corn
	k.loadSprite("corn_young", "/sprites/corn_young.png");
	k.loadSprite("corn_growing", "/sprites/corn_growing.png");
	k.loadSprite("corn_harvestable", "/sprites/corn_harvestable.png");
	k.loadSprite("corn_dead", "/sprites/corn_dead.png");

	k.loadSprite("robot", "/sprites/farmbot.png");
	k.loadSprite("soil", "/sprites/soil_tileset.png", { sliceX: 3, sliceY: 1 });

	// Only used for lookups
	const farm_grid_index = new Map();

	k.scene("farm", () => {
		const farm = CONFIG.FARM;
		k.setBackground(farm.bg_grass);
		const bg_soil = k.add([k.pos(k.center()), k.rect(farm.grid_size.w + 50, farm.grid_size.h + 50, { radius: 30 }), k.color(farm.bg_soil), k.anchor("center")]);

		const robot = addFarmbot(farm_grid_index, 0, 0);

		for (let i = 0; i < farm.rows; i++) {
			for (let j = 0; j < farm.columns; j++) {
				const soil = addSoilToGrid(j, i);
				farm_grid_index.set(`${i}-${j}`, { soil });
			}
		}

		k.on("update", "corn", (o) => {
			const count = o.countAdjacentCrop(o.grid_x, o.grid_y, o.crop_type);
			if (count === 0) return;
			o.crop_grow_duration = o.crop_duration - count * 2;
		});

		k.onClick("soil", (o) => {
			robot.botJump(o.grid_x, o.grid_y);
		});
		k.onKeyPress("1", () => {
			robot.botTill(robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("2", () => {
			robot.botWater(robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("3", () => {
			robot.botHarvest(robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("4", () => {
			robot.botDestroy(robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("5", () => {
			robot.botKillBug(robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("q", () => {
			robot.botPlant(CROP_TYPES.WHEAT, robot.grid_x, robot.grid_y);
		});
		k.onKeyPress("w", () => {
			robot.botPlant(CROP_TYPES.CORN, robot.grid_x, robot.grid_y);
		});

		k.onMousePress(["middle"], (m) => {
			if (m === "middle") MOUSE.is_pressing = true;
		});

		k.onMouseMove((p, d) => {
			if (!MOUSE.is_pressing) return;
			CAMERA.x -= d.x;
			CAMERA.y -= d.y;

			k.setCamPos(k.vec2(CAMERA.x, CAMERA.y));
		});

		k.onMouseRelease("middle", (m) => {
			MOUSE.is_pressing = false;
		});
	});

	k.go("farm");
}
