import { k, initKaplay } from "../lib/kaplay.js";
import { addFarmbot, addSoilToGrid } from "./components-kaplay/components.js";
import {
	CAMERA,
	CONFIG,
	MOUSE,
	setGridOrigin,
	setCameraCenter,
} from "./global/global.js";
export const robots = [];

export function game() {
	initKaplay();
	setGridOrigin(k, CONFIG.FARM);
	setCameraCenter(k, CAMERA);

	// Fonts
	k.loadFont("Quicksand", "/fonts/Quicksand.ttf");
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
	// Tomato
	k.loadSprite("tomato_young", "/sprites/tomato_young.png");
	k.loadSprite("tomato_growing", "/sprites/tomato_growing.png");
	k.loadSprite("tomato_harvestable", "/sprites/tomato_harvestable.png");
	k.loadSprite("tomato_dead", "/sprites/tomato_dead.png");

	k.loadSprite("robot", "/sprites/farmbot.png");
	k.loadSprite("soil", "/sprites/soil_tileset.png", { sliceX: 3, sliceY: 1 });

	// Icons
	k.loadSprite("icon_coin", "/sprites/icon_coin.png");
	k.loadSprite("icon_corn", "/sprites/icon_corn.png");
	k.loadSprite("icon_wheat", "/sprites/icon_wheat.png");
	k.loadSprite("icon_tomato", "/sprites/icon_tomato.png");

	k.loadSprite("icon_angel", "/sprites/icon_angel.png");
	k.loadSprite("icon_droplet", "/sprites/icon_droplet.png");
	k.loadSprite("icon_hoe", "/sprites/icon_hoe.png");
	k.loadSprite("icon_mglass", "/sprites/icon_mglass.png");
	k.loadSprite("icon_seedpack", "/sprites/icon_seedpack.png");
	k.loadSprite("icon_spark", "/sprites/icon_spark.png");
	k.loadSprite("icon_tears", "/sprites/icon_tears.png");

	k.loadSprite("icon_sparkle", "/sprites/icon_sparkle.png");
	k.loadSprite("icon_fly", "/sprites/icon_fly.png");
	k.loadSprite("icon_poison1", "/sprites/icon_poison1.png");
	k.loadSprite("icon_poison2", "/sprites/icon_poison2.png");

	// Orbs
	k.loadSprite("coin_0", "/sprites/coin_0.png");
	k.loadSprite("coin_1", "/sprites/coin_1.png");
	k.loadSprite("coin_2", "/sprites/coin_2.png");

	k.loadSprite("exp_0", "/sprites/exp_0.png");
	k.loadSprite("exp_1", "/sprites/exp_1.png");
	k.loadSprite("exp_2", "/sprites/exp_2.png");

	// Only used for lookups
	const farm_grid_index = new Map();

	k.scene("farm", () => {
		const farm = CONFIG.FARM;
		k.setBackground(farm.bg_grass);
		k.add([
			k.pos(k.center()),
			k.rect(farm.grid_size.w + 50, farm.grid_size.h + 50, { radius: 30 }),
			k.color(farm.bg_soil),
			k.anchor("center"),
		]);

		robots.push(addFarmbot(robots.length, farm_grid_index, 0, 0));

		for (let i = 0; i < farm.rows; i++) {
			for (let j = 0; j < farm.columns; j++) {
				const soil = addSoilToGrid(j, i);
				farm_grid_index.set(`${i}-${j}`, { soil });
			}
		}

		k.onMousePress(["middle"], (m) => {
			if (m === "middle") MOUSE.is_pressing = true;
		});

		k.onMouseMove((_p, d) => {
			if (!MOUSE.is_pressing) return;
			CAMERA.x -= d.x;
			CAMERA.y -= d.y;

			k.setCamPos(k.vec2(CAMERA.x, CAMERA.y));
		});

		k.onMouseRelease("middle", () => {
			MOUSE.is_pressing = false;
		});
	});

	k.go("farm");
}
