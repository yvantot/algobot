import { k } from "../../lib/kaplay.js";
import { MoveEnums, CropStates, SoilStates } from "../global/enum.js";
import { CROP_TYPES, CROP_DATA, CONFIG, SAY_DATA } from "../global/global.js";
import { lerp, lerpvec2 } from "../utils/math.js";
// Components
// ysort - Manages y-sorting

export function ysort(is_enabled = true) {
	return {
		id: "ysort",
		require: ["z", "pos"],
		ysort_enabled: is_enabled,

		update() {
			if (this.ysort_enabled) this.z = this.pos.y;
		},
	};
}

// Adding an opt seems to break this shit. The sizes change, the anchor also, wtf is going on
export function displaytext(text = "", offset_x = 0, offset_y = 0, opt = {}) {
	return {
		id: "displaytext",
		require: ["pos"],

		display_offset_x: offset_x,
		display_offset_y: offset_y,
		display_text: text,
		display_obj: null,
		display_size: null,
		display_width: null,
		display_color: null,

		update() {
			this.display_obj.z = this.pos.y + 1;
		},

		add() {
			const { size = this.display_size, width = this.display_width, color = this.display_color } = opt;
			this.display_size = size ? size : 16;
			this.display_width = width ?? 64;
			this.display_color = color ?? k.WHITE;

			const pos = k.vec2(0 + this.display_offset_x, 0 + this.display_offset_y);
			this.display_obj = this.add([k.z(), k.text(text, { size: this.display_size, width: this.display_width, align: "center", font: "Chintzy" }), k.pos(pos), k.color(this.display_color)]);
		},

		setDisplayColor(color) {
			this.display_obj.color = color;
		},
	};
}

export function saytext(offset_x, offset_y, opt = { size: 12, height: 25, duration: 2, width: 200, color: k.WHITE }) {
	return {
		id: "saytext",
		require: ["pos"],
		say_offset_x: offset_x,
		say_offset_y: offset_y,
		say_size: opt.size,
		say_height: opt.height,
		say_duration: opt.duration,
		say_width: opt.width,
		say_color: opt.color,

		sayText(say_text) {
			const pos = k.vec2(this.pos.x + this.say_offset_x, this.pos.y + this.say_offset_y);
			const text = k.add([k.text(say_text, { size: this.say_size, width: this.say_width, align: "center" }), k.pos(pos), k.color(this.say_color), k.opacity(0), k.timer(), k.z(5), k.animate(), k.scale(1, 1), k.anchor("bot")]);
			text.animate("opacity", [0, 1, 0], { duration: this.say_duration, loops: 1 });
			text.animate("scale", [k.vec2(0.5, 0.5), k.vec2(1, 1)], { duration: this.say_duration, loops: 1, easing: k.easings.easeInOutExpo });
			text.animate("pos", [k.vec2(pos), k.vec2(pos.x, pos.y - this.say_height)], { duration: this.say_duration, loops: 1, easing: k.easings.easeInOutSine });
			text.wait(this.say_duration, () => {
				text.destroy();
			});
		},
	};
}

export function soil(state = SoilStates.INITIAL) {
	return {
		id: "soil",
		require: ["gridpos", "sprite"],

		soil_state: state,

		add() {
			this.frame = this.soil_state;
		},

		setSoilState(state) {
			this.soil_state = state;
			this.frame = this.soil_state;
		},
	};
}

export function crop(farm_grid_index, type, state = CropStatesEnum.YOUNG) {
	return {
		id: "crop",
		require: ["gridpos", "timer", "animate", "rotate"],

		crop_type: type,
		crop_grow_time: 0,
		crop_grow_duration: CROP_DATA[type].duration,
		crop_state: state,
		crop_health: CROP_DATA[type].health,
		crop_duration: CROP_DATA[type].duration,
		crop_reward: CROP_DATA[type].reward,
		absorbing_water: false,

		crop_soil_water: null,
		crop_soil_parent: null,
		crop_mask: null,

		add() {
			this.tag(this.crop_type);
			this.sprite = this.crop_type + this.crop_state;
			this.animate("angle", [-6, 6], {
				duration: 1,
				direction: "ping-pong",
				easing: k.easings.easeInOutSine,
			});
		},

		update() {
			const { soil } = farm_grid_index.get(`${this.grid_y}-${this.grid_x}`);
			if (soil == null) return;

			if (this.absorbing_water) {
				this.crop_grow_time += k.dt();
				const progress = this.crop_grow_time / this.crop_grow_duration;

				this.crop_mask.radius = lerp(45, 0, progress);

				if (progress >= 1) {
					this.crop_grow_time = 0;
					this.absorbing_water = false;
					soil.parent = this.crop_soil_parent;
					soil.pos = this.crop_soil_water.pos;
					soil.setSoilState(SoilStates.READY);

					if (this.crop_state === CropStates.YOUNG) {
						this.crop_state = CropStates.GROWING;
					} else if (this.crop_state === CropStates.GROWING) {
						this.crop_state = CropStates.HARVESTABLE;
					}
					this.sprite = `${type}${this.crop_state}`;

					this.crop_mask.destroy();
					this.crop_soil_water.destroy();
				}
			}

			if (soil.soil_state === SoilStates.WATERED && this.absorbing_water === false) {
				this.absorbing_water = true;
				this.crop_soil_parent = soil.parent;

				const offset_mask = 5;
				this.crop_soil_water = addSoilToGrid(soil.grid_x, soil.grid_y, SoilStates.WATERED);
				this.crop_mask = k.add([k.circle(45), k.pos(this.crop_soil_water.pos.x + 64 / 2, this.crop_soil_water.pos.y + 64 / 2 - offset_mask), k.anchor("center"), k.mask("subtract"), k.timer()]);
				soil.pos = k.vec2(0 - 64 / 2, 0 - 64 / 2 + offset_mask);
				soil.frame = SoilStates.READY;
				soil.parent = this.crop_mask;
			}
		},
		countAdjacentCrop(x, y, type) {
			let count = 0;

			const dirs = [
				[0, -1],
				[1, 0],
				[0, 1],
				[-1, 0],
			];

			for (let i = 0; i < dirs.length; i++) {
				const tile = farm_grid_index.get(`${y + dirs[i][0]}-${x + dirs[i][1]}`);
				if (!tile) continue;
				if (!tile.crop) continue;
				const { crop } = tile;
				if (crop.crop_type === type) {
					count += 1;
				}
			}
			return count;
		},
	};
}

export function botact(farm_grid_index, duration = CONFIG.BOT.action_duration) {
	return {
		id: "bot",
		require: ["gridpos", "gridmove", "sprite", "timer"],

		botact_duration: duration,
		is_available: true,

		showError() {
			this.setDisplayColor(k.RED);
			this.wait(this.botact_duration, () => {
				this.is_available = true;
				this.setDisplayColor(k.GREEN);
			});
		},

		performAct(animate = true) {
			this.is_available = false;
			this.setDisplayColor(k.YELLOW);

			if (animate) {
				const t = this.botact_duration / 2;
				this.tween(k.vec2(1, 1), k.vec2(1.1, 0.9), t, (v) => (this.scale = v), k.easings.easeInSine).onEnd(() => {
					this.tween(k.vec2(0.9, 1.1), k.vec2(1, 1), t, (v) => (this.scale = v), k.easings.easeOutSine);
				});
			}

			this.wait(this.botact_duration, () => {
				this.is_available = true;
				this.setDisplayColor(k.GREEN);
			});
		},

		botJump(x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct(false);

			this.gridJump(x, y, this.botact_duration);
		},

		botTill(x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();

			const { soil } = farm_grid_index.get(`${y}-${x}`);
			if (soil.soil_state === SoilStates.INITIAL) {
				soil.setSoilState(SoilStates.READY);
			} else {
				this.sayText(SAY_DATA.farm.error.till_tilled);
				this.showError();
			}
		},

		botWater(x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();

			const { soil, crop = null } = farm_grid_index.get(`${y}-${x}`);
			if (crop && crop.crop_state === CropStates.HARVESTABLE) {
				this.sayText(SAY_DATA.farm.error.water_harvestable);
				this.showError();
			} else if (soil.soil_state === SoilStates.READY) {
				soil.setSoilState(SoilStates.WATERED);
			} else if (soil.soil_state === SoilStates.INITIAL) {
				this.sayText(SAY_DATA.farm.error.water_initial);
				this.showError();
			} else if (soil.soil_state === SoilStates.WATERED) {
				this.sayText(SAY_DATA.farm.error.water_watered);
				this.showError();
			}
		},

		botPlant(type, x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();

			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { soil, crop = null } = farm_grid_index.get(key);

			if (crop == null && (soil.soil_state === SoilStates.READY || soil.soil_state === SoilStates.WATERED)) {
				const crop = addCrop(farm_grid_index, type, this.grid_x, this.grid_y);
				farm_grid_index.set(key, { ...tile, crop });
			} else if (soil.soil_state === SoilStates.INITIAL) {
				this.sayText(SAY_DATA.farm.error.plant_initial);
				this.showError();
			} else if (crop != null) {
				this.sayText(SAY_DATA.farm.error.plant_planted);
				this.showError();
			}
		},

		botHarvest(x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();

			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { soil, crop = null } = farm_grid_index.get(key);

			if (crop.crop_state === CropStates.HARVESTABLE) {
				crop.animation.seek(0);
				crop.unanimateAll();
				crop.angle = 0;
				crop.animate("scale", [k.vec2(1), k.vec2(1.2, 0.8), k.vec2(1), k.vec2(0.8, 1.2), k.vec2(1)], {
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				});
				crop.animate("opacity", [1, 0], {
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				});
				crop.wait(0.5, () => {
					crop.destroy();
					delete tile.crop;
				});
			} else if (crop.crop_state === CropStates.GROWING) {
				this.sayText(SAY_DATA.farm.error.harvest_not_ready);
				this.showError();
			}
		},

		botDestroy(x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();
			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { crop = null } = farm_grid_index.get(key);

			if (crop && !crop.absorbing_water) {
				crop.animation.seek(0);
				crop.unanimateAll();
				crop.angle = 0;
				crop.animate("scale", [k.vec2(1), k.vec2(1.2, 0.8), k.vec2(1), k.vec2(0.8, 1.2), k.vec2(1)], {
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				});
				crop.animate("opacity", [1, 0], {
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				});
				crop.wait(0.5, () => {
					crop.destroy();
					delete tile.crop;
				});
			} else if (crop.absorbing_water) {
				this.sayText(SAY_DATA.farm.error.destroy_absoring);
				this.showError();
			}
		},

		// === WIP ===

		botKillBug(x = this.grid_x, y = this.grid_y) {},
		botHoldPlant(x = this.grid_x, y = this.grid_y) {},
		botReleasePlant(x = this.grid_x, y = this.grid_y) {},
	};
}

// gridmove provides grid movement abilities, it mostly operates based on gridpos data
export function gridmove() {
	return {
		id: "gridmove",
		require: ["gridpos"],

		jumpAnim: null,
		scaleAnim: null,

		updateAxis(x, y) {
			this.grid_x = x;
			this.grid_y = y;
		},

		gridPlace(x, y) {
			this.pos = this.gridAxisToWorld(x, y);
			this.updateAxis(x, y);
		},

		gridJump(x, y, duration) {
			const start_pos = this.pos;
			const target_pos = this.gridAxisToWorld(x, y);
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

			this.animation.seek(0);

			this.jumpAnim = this.animate("pos", points, {
				duration,
				loops: 1,
				timing: [0, 0.3, 0.5, 0.6, 0.85, 1],
				easing: k.easings.linear,
				interpolation: "spline",
			});

			this.scaleAnim = this.animate("scale", [k.vec2(1, 1), k.vec2(1.2, 0.9), k.vec2(1.3, 0.8), k.vec2(1.4, 0.8), k.vec2(1, 1), k.vec2(1.4, 1.5), k.vec2(0.9, 1.5), k.vec2(0.9, 1.1), k.vec2(1, 1), k.vec2(1.1, 1), k.vec2(1, 1), k.vec2(0.95, 1.05), k.vec2(1, 1)], {
				duration,
				timing: [0, 0.1, 0.15, 0.2, 0.3, 0.5, 0.6, 0.7, 0.9, 0.92, 0.96, 0.98, 1],
				loops: 1,
				easing: k.easings.easeInSine,
			});

			this.updateAxis(x, y); // This should update later after the animation ended
		},

		gridSlide(x, y, duration) {
			const start_pos = this.pos;
			const target_pos = this.gridAxisToWorld(x, y);

			this.animate("pos", [start_pos, target_pos], {
				duration,
				loops: 1,
				easing: k.easings.linear,
				interpolation: "linear",
			});

			this.updateAxis(x, y);
		},
	};
}

export function gridpos(grid_x, grid_y, offset_x = 0, offset_y = 0) {
	return {
		id: "gridpos",
		require: ["pos"],
		grid_x,
		grid_y,
		offset_x,
		offset_y,

		add() {
			this.pos = this.gridAxisToWorld();
		},

		gridAxisToWorld(x = this.grid_x, y = this.grid_y) {
			const { cell_size, grid_origin } = CONFIG.FARM;
			const world_x = x * cell_size + this.offset_x + grid_origin.x;
			const world_y = y * cell_size + this.offset_y + grid_origin.y;
			return k.vec2(world_x, world_y);
		},
	};
}

export function addSoilToGrid(x, y, state = SoilStates.INITIAL) {
	// prettier-ignore
	return k.add([
        k.pos(),
        k.sprite("soil"),
        k.z(0),
        k.area(),
        gridpos(x, y),
        soil(state),
    ]);
}

export function addFarmbot(farm_grid_index, x, y) {
	// prettier-ignore
	return k.add([
        "botact",
        k.pos(),
        k.sprite("robot"),
        k.anchor("bot"),
        k.z(),
        k.scale(),
        k.animate(),
        k.timer(),
        
        gridpos(x, y, CONFIG.FARM.tile_size / 2, CONFIG.FARM.tile_size / 2 - 15),
        gridmove(),
        botact(farm_grid_index),
        ysort(),
        saytext(0, -70),
		displaytext("0", -64 / 2, -58,  {size: 20, color: k.GREEN})
    ]);
}

export function addCrop(farm_grid_index, type, x, y, state = CropStates.YOUNG) {
	// prettier-ignore
	return k.add([
		k.pos(),
		k.sprite(`${type}${state}`),
		k.anchor("bot"),
		k.z(),
		k.rotate(),
		k.animate(),
		k.timer(),
		k.scale(k.vec2(1)),
		k.opacity(1),

		gridpos(x, y, CONFIG.FARM.tile_size / 2, CONFIG.FARM.tile_size / 2 ),
		ysort(),
		crop(farm_grid_index, type, state)
	]);
}
