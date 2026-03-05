export const CROP_TYPES = {
	WHEAT: "wheat",
	CORN: "corn",
	RICE: "rice",
	POTATO: "potato",
	SUGARCANE: "sugarcane",
	TOMATO: "tomato",
};

export const CROP_DATA = {
	[CROP_TYPES.WHEAT]: {
		health: 10,
		duration: 1,
		reward: 2,
	},
	[CROP_TYPES.CORN]: {
		health: 10,
		duration: 20,
		reward: 6,
	},
	[CROP_TYPES.RICE]: {
		health: 10,
		duration: 25,
		reward: 8,
	},
	[CROP_TYPES.POTATO]: {
		health: 10,
		duration: 35,
		reward: 15,
	},
	[CROP_TYPES.SUGARCANE]: {
		health: 10,
		duration: 15,
		reward: 5,
	},
	[CROP_TYPES.TOMATO]: {
		health: 10,
		duration: 30,
		reward: 25,
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
		rows: 5,
		columns: 5,
		gap: 12,
		tile_size: 64,
		tile_radius: 12,
		bg_soil: "#EFB675",
		bg_grass: "#719816",
	},
	BOT: {
		action_duration: 0.5,
	},
};

export function setGridOrigin(k, farm) {
	farm.cell_size = farm.tile_size + farm.gap;
	farm.grid_size = { w: farm.rows * farm.tile_size + (farm.rows - 1) * farm.gap, h: farm.columns * farm.tile_size + (farm.columns - 1) * farm.gap };
	farm.grid_origin = { x: k.width() / 2 - farm.grid_size.w / 2, y: k.height() / 2 - farm.grid_size.h / 2 };
}

export function setCameraCenter(k, camera) {
	camera.x = k.width() / 2;
	camera.y = k.height() / 2;
}
