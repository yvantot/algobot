import { k } from "../../lib/kaplay.js";
import {
	FreshnessStates,
	CropStates,
	SoilStates,
	IconTypes,
	OrbTypes,
	CropTypes
} from "../global/enum.js";
import {
	CROP_DATA,
	CONFIG,
	SAY_DATA,
	PLAYER_DATA,
	INVENTORY,
} from "../global/global.js";

import { lerp, lerpvec2 } from "../utils/math.js";
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
			const {
				size = this.display_size,
				width = this.display_width,
				color = this.display_color,
			} = opt;
			this.display_size = size ? size : 16;
			this.display_width = width ?? 64;
			this.display_color = color ?? k.WHITE;

			const pos = k.vec2(0 + this.display_offset_x, 0 + this.display_offset_y);
			this.display_obj = this.add([
				k.z(),
				k.text(text, {
					size: this.display_size,
					width: this.display_width,
					align: "center",
					font: "Chintzy",
				}),
				k.pos(pos),
				k.color(this.display_color),
			]);
		},

		setDisplayColor(color) {
			this.display_obj.color = color;
		},
	};
}

export function saytext(
	offset_x,
	offset_y,
	opt = { size: 14, height: 80, duration: 3, color: "#1d293d" },
) {
	return {
		id: "saytext",
		require: ["pos"],
		say_offset_x: offset_x,
		say_offset_y: offset_y,
		say_size: opt.size,
		say_height: opt.height,
		say_duration: opt.duration,
		say_color: opt.color,
		say_z: k.height(),
		say_stack: 0,

		sayText(say_text, color = "#fafafa", textcolor = this.say_color) {
			if (this.say_stack > 6) this.say_stack = 0;
			this.say_stack += 1;
			this.say_z += 1;
			const pos = k.vec2(
				this.pos.x + this.say_offset_x,
				this.pos.y + this.say_offset_y,
			);
			const text_width = Math.max(
				80,
				String(say_text).length * (this.say_size / 1.5),
			);
			const rand_pos = k.vec2(pos.x, pos.y - this.say_stack * 20);
			const text = k.add([
				k.text(say_text, {
					size: this.say_size,
					width: text_width,
					align: "center",
					font: "Quicksand",
				}),
				k.pos(pos),
				k.color(textcolor),
				k.opacity(0),
				k.timer(),
				k.z(this.say_z),
				k.animate(),
				k.scale(1, 1),
				k.anchor("bot"),
			]);
			text.add([
				k.color(color),
				k.pos(0, 0 + this.say_size / 2),
				k.anchor("bot"),
				k.outline(2, k.Color.fromHex("#cf676e")),
				k.animate(),
				k.opacity(1),
				k.z(this.say_z - 1),
				k.rect(text_width, this.say_size + 10, { radius: 5 }),
			]);
			text.animate("opacity", [0, 1, 0], {
				duration: this.say_duration,
				timing: [0, 0.8, 1],
				loops: 1,
			});
			text.animate("scale", [k.vec2(0.8, 0.8), k.vec2(1, 1), k.vec2(0, 0)], {
				duration: this.say_duration,
				timing: [0, 0.8, 1],
				loops: 1,
				easing: k.easings.easeInOutExpo,
			});
			text.animate("pos", [k.vec2(pos), rand_pos], {
				duration: 1,
				loops: 1,
				easing: k.easings.easeInOutSine,
			});
			text.wait(this.say_duration, () => {
				this.say_stack = Math.max(this.say_stack - 1, 0);
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
		crop_exp: CROP_DATA[type].exp,
		crop_spoilage_time: CROP_DATA[type].spoilage_time,
		absorbing_water: false,

		crop_soil_water: null,
		crop_soil_parent: null,
		crop_mask: null,

		harvest() {
			this.animation.seek(0);
			this.unanimateAll();
			this.angle = 0;
			this.animate(
				"scale",
				[k.vec2(1), k.vec2(1.2, 0.8), k.vec2(1), k.vec2(0.8, 1.2), k.vec2(1)],
				{
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				},
			);
			this.animate("opacity", [1, 0], {
				duration: 0.5,
				loops: 1,
				easing: k.easings.easeInOutSine,
			});
		},

		add() {
			if (this.crop_type === CropTypes.CORN) {
				k.loop(1, () => {
					if (this.crop_state === CropStates.HARVESTABLE) return;
					const count = this.countAdjacentCrop(
						this.grid_x,
						this.grid_y,
						this.crop_type,
					);
					if (count === 0) return;
					this.crop_grow_duration = this.crop_duration - count * 6;
				});
			}

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
						// When it's harvestable, start timer
						this.initFreshness();

						// A very shitty implementation right now, but hey, this works
						// Why this is shitty is because there's no way to stop this... it should be rather processed in update
						// But basically, let's just say right now that, if it became an adult, start counting
						this.wait(this.crop_spoilage_time, () => {
							this.crop_state = CropStates.DEAD;
							this.sprite = `${type}${this.crop_state}`;
						});
					}
					this.sprite = `${type}${this.crop_state}`;

					this.crop_mask.destroy();
					this.crop_soil_water.destroy();
				}
			}

			if (
				soil.soil_state === SoilStates.WATERED &&
				this.absorbing_water === false
			) {
				this.absorbing_water = true;
				this.crop_soil_parent = soil.parent;

				const offset_mask = 5;
				this.crop_soil_water = addSoilToGrid(
					soil.grid_x,
					soil.grid_y,
					SoilStates.WATERED,
				);
				this.crop_mask = k.add([
					k.circle(45),
					k.pos(
						this.crop_soil_water.pos.x + 64 / 2,
						this.crop_soil_water.pos.y + 64 / 2 - offset_mask,
					),
					k.anchor("center"),
					k.mask("subtract"),
					k.timer(),
				]);
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

export function freshness() {
	return {
		id: "freshness",
		require: ["crop"],
		freshness_state: FreshnessStates.FRESH,

		initFreshness() {
			const a = this.add([
				k.pos(-7, -12),
				k.sprite(this.stateToPath(this.freshness_state)),
				k.opacity(1),
				k.animate(),
				k.z(k.height()),
				k.scale(),
				k.anchor("bot"),
			]);
			const b = this.add([
				k.pos(+20, -35),
				k.sprite(this.stateToPath(this.freshness_state)),
				k.opacity(1),
				k.animate(),
				k.z(k.height()),
				k.scale(),
				k.anchor("bot"),
			]);
			const c = this.add([
				k.pos(-16, -41),
				k.sprite(this.stateToPath(this.freshness_state)),
				k.opacity(1),
				k.animate(),
				k.z(k.height()),
				k.scale(),
				k.anchor("bot"),
			]);
			for (const particles of [a, b, c]) {
				particles.animation.seek(0);
				particles.animate("angle", [6, -6], {
					duration: 1,
					direction: "ping-pong",
					easing: k.easings.easeInOutSine,
				});
				particles.animate("scale", [k.vec2(1, 1), k.vec2(1.2, 1.2)], {
					duration: 1,
					direction: "ping-pong",
					easing: k.easings.easeInOutSine,
				});
				particles.animate("opacity", [0.5, 1], {
					duration: 1,
					direction: "ping-pong",
					easing: k.easings.easeInOutSine,
				});
			}

			// A really shitty way to write this lol, but fuck it, let's make it work first
			this.wait(this.crop_spoilage_time / 2, () => {
				this.freshness_state = FreshnessStates.EXPIRING;
				a.sprite = this.stateToPath(this.freshness_state);
				b.sprite = this.stateToPath(this.freshness_state);
				c.sprite = this.stateToPath(this.freshness_state);

				for (const particles of [a, b, c]) {
					const rand_pos = [];
					const rand_angle = [];
					for (let i = 0; i < 10; i++) {
						rand_angle.push(k.rand(-10, 10));
						const x = k.rand(-15, 15);
						const y = k.rand(0, -50);
						rand_pos.push(k.vec2(x, y));
					}

					particles.unanimateAll();
					particles.animation.seek(0);
					particles.animate("angle", rand_angle, {
						duration: 1,
						direction: "ping-pong",
						easing: k.easings.easeInOutSine,
					});
					particles.animate("scale", [k.vec2(1, 1), k.vec2(1.3, 1.3)], {
						duration: 1,
						direction: "ping-pong",
						easing: k.easings.easeInOutSine,
					});
					particles.animate("pos", rand_pos, {
						duration: this.crop_spoilage_time / 2,
						direction: "ping-pong",
						easing: k.easings.easeInOutExpo,
					});
				}
				this.wait(this.crop_spoilage_time / 2, () => {
					this.freshness_state = FreshnessStates.DEAD;
					a.sprite = `${this.stateToPath(this.freshness_state)}1`;
					b.sprite = `${this.stateToPath(this.freshness_state)}2`;
					c.sprite = `${this.stateToPath(this.freshness_state)}1`;

					for (const particles of [a, b, c]) {
						particles.unanimateAll();
						particles.animation.seek(0);
						particles.animate("scale", [k.vec2(0, 0), k.vec2(1.5, 1.5)], {
							duration: 1,
							easing: k.easings.easeInOutSine,
						});
						const rand_x = k.rand(-10, 10);
						particles.animate(
							"pos",
							[
								k.vec2(rand_x, 0),
								k.vec2(rand_x + k.rand(-10, 10), k.rand(0, -50)),
							],
							{
								duration: 1,
								easing: k.easings.easeInOutSine,
							},
						);
						particles.animate("opacity", [0, 1, 0], {
							duration: 1,
							easing: k.easings.easeInOutSine,
						});
					}
				});
			});
		},

		stateToPath(state) {
			switch (state) {
				case FreshnessStates.FRESH: {
					return "icon_sparkle";
				}
				case FreshnessStates.EXPIRING: {
					return "icon_fly";
				}
				case FreshnessStates.DEAD: {
					return "icon_poison";
				}
			}
		},
	};
}

export function dropOrbs() {
	return {
		id: "dropOrbs",
		require: ["gridpos"],

		dropOrbs(object, count, sprite) {
			const pos = this.gridAxisToWorld(object.grid_x, object.grid_y);

			const orb_div = {
				0: 0,
				1: 0,
				2: 0,
			};

			// Random-based drop (less performance but addictive)
			let remaining = Math.floor(count);
			while (remaining > 0) {
				if (remaining >= 10 && k.rand() < 0.05) {
					orb_div[2] += 1;
					remaining -= 10;
				} else if (remaining >= 5 && k.rand() < 0.15) {
					orb_div[1] += 1;
					remaining -= 5;
				} else {
					orb_div[0] += 1;
					remaining -= 1;
				}
			}

			// Math-based drop
			// const orb_div = {
			// 	0: (count % 10) % 5,
			// 	1: Math.floor((count % 10) / 5),
			// 	2: Math.floor(count / 10),
			// };

			const orbs = [];
			for (const key in orb_div) {
				for (let i = 0; i < orb_div[key]; i++) {
					orbs.push(
						k.add([
							k.pos(),
							k.sprite(`${sprite}_${key}`),
							k.z(k.height()),
							k.animate(),
							k.opacity(),
							k.timer(),
							k.anchor("bot"),
							k.scale(0.3, 0.3),
						]),
					);
				}
			}

			for (const orb of orbs) {
				const rand_x = k.rand(pos.x - 30, pos.x + 30);
				const rand_y = k.rand(pos.y, pos.y + 20);
				orb.animation.seek(0);
				orb.animate(
					"scale",
					[k.vec2(0.3, 0.3), k.vec2(1.2, 1.2), k.vec2(1, 1)],
					{
						duration: 1,
						loops: 1,
						easing: k.easings.easeInOutExpo,
					},
				);
				orb.animate(
					"pos",
					[pos, k.vec2(rand_x, rand_y - 40), k.vec2(rand_x, rand_y)],
					{
						duration: 1,
						timing: [0, 0.8, 1],
						loops: 1,
						easing: k.easings.easeInOutExpo,
					},
				);
				orb.wait(1, () => {
					orb.unanimateAll();
					orb.animation.seek(0);
					orb.animate("opacity", [1, 0], {
						duration: 0.7,
						loops: 1,
						easing: k.easeInOutSine,
					});
					orb.animate("pos", [k.vec2(rand_x, rand_y), k.vec2(0, 0)], {
						duration: 1,
						loops: 1,
						easing: k.easings.easeInOutExpo,
					});
					orb.wait(1, () => orb.destroy());
				});
			}
		},
	};
}

// Let's make it simple right now, extend later
export function popupicon() {
	return {
		id: "popupicon",
		require: ["gridpos"],
		icon: null,

		showIcon(type, duration) {
			const pos = this.gridAxisToWorld(this.grid_x, this.grid_y);

			if (this.icon == null)
				this.icon = k.add([
					k.pos(pos.x, pos.y),
					k.sprite("icon_" + type),
					k.opacity(0),
					k.animate(),
					k.z(k.height()),
					k.scale(0.7, 0.7),
					k.anchor("bot"),
				]);
			else this.icon.sprite = "icon_" + type;

			this.icon.animation.seek(0);
			this.icon.animate(
				"pos",
				[k.vec2(pos.x, pos.y), k.vec2(pos.x, pos.y - 25)],
				{
					duration: duration + 0.5,
					loops: 1,
					easing: k.easings.easeInOutExpo,
				},
			);
			this.icon.animate("opacity", [0, 1, 0], {
				duration: duration + 0.5,
				loops: 1,
				easing: k.easings.easeInOutSine,
			});
		},
	};
}

export function botact(id, farm_grid_index) {
	return {
		id: "bot",
		require: ["gridpos", "gridmove", "sprite", "timer"],

		botact_duration: CONFIG.BOT.action_duration, // This is so ASSSSS, I'll fix this soon
		botcheck_duration: CONFIG.BOT.check_duration, // This is so ASSSSS, I'll fix this soon
		is_available: true,

		showError(str) {
			this.sayText(str, "#ffb8bd", "#763c40");
			this.setDisplayColor(k.RED);
			this.wait(this.botact_duration, () => {
				this.is_available = true;
				this.setDisplayColor(k.GREEN);
			});
		},

		performAct(
			animate = true,
			duration = CONFIG.BOT.action_duration,
			callback = null,
		) {
			this.is_available = false;
			this.setDisplayColor(k.YELLOW);

			this.wait(duration, () => {
				this.is_available = true;
				this.setDisplayColor(k.GREEN);
				if (callback) callback();
			});

			if (animate) {
				const t = duration / 2;
				this.tween(
					k.vec2(1, 1),
					k.vec2(1.1, 0.9),
					t,
					(v) => (this.scale = v),
					k.easings.easeInSine,
				).onEnd(() => {
					this.tween(
						k.vec2(0.9, 1.1),
						k.vec2(1, 1),
						t,
						(v) => (this.scale = v),
						k.easings.easeOutSine,
					);
				});
			}
		},

		checkTilled(callback = null, x = this.grid_x, y = this.grid_y) {
			const { soil } = farm_grid_index.get(`${y}-${x}`);
			let val = null;
			if (
				soil.soil_state === SoilStates.READY ||
				soil.soil_state === SoilStates.WATERED
			)
				val = true;
			else val = false;
			this.showIcon(IconTypes.MGLASS, this.botcheck_duration);
			this.performAct(true, this.botcheck_duration, () => callback(val));
		},
		checkWatered(callback = null, x = this.grid_x, y = this.grid_y) {
			const { soil } = farm_grid_index.get(`${y}-${x}`);
			let val = null;
			if (soil.soil_state === SoilStates.WATERED) val = true;
			else val = false;
			this.showIcon(IconTypes.MGLASS, this.botcheck_duration);
			this.performAct(true, this.botcheck_duration, () => callback(val));
		},

		checkPlanted(callback = null, x = this.grid_x, y = this.grid_y) {
			let val = null;
			const { crop = null } = farm_grid_index.get(`${y}-${x}`);
			if (crop) val = true;
			else val = false;
			this.showIcon(IconTypes.MGLASS, this.botcheck_duration);
			this.performAct(true, this.botcheck_duration, () => callback(val));
		},
		isHarvestable(callback = null, x = this.grid_x, y = this.grid_y) {
			let val = null;
			const { crop = null } = farm_grid_index.get(`${y}-${x}`);
			if (crop && crop.crop_state === CropStates.HARVESTABLE) val = true;
			else val = false;
			this.showIcon(IconTypes.MGLASS, this.botcheck_duration);
			this.performAct(true, this.botcheck_duration, () => callback(val));
		},

		isWithinBounds(x, y) {
			if (x < 0 || y < 0 || x >= CONFIG.FARM.columns || y >= CONFIG.FARM.rows)
				return false;
			return true;
		},

		botJump(x = this.grid_x, y = this.grid_y, callback = null) {
			this.performAct(false, this.botact_duration, callback);

			if (this.isWithinBounds(x, y)) {
				this.gridJump(x, y, this.botact_duration);
			} else {
				this.showError(SAY_DATA.farm.error.out_of_bounds);
			}
		},

		botTill(callback = null, x = this.grid_x, y = this.grid_y) {
			this.performAct(true, this.botact_duration, callback);

			const { soil } = farm_grid_index.get(`${y}-${x}`);
			if (soil.soil_state === SoilStates.INITIAL) {
				soil.setSoilState(SoilStates.READY);
				this.showIcon(IconTypes.HOE, this.botact_duration);
			} else {
				this.showError(SAY_DATA.farm.error.till_tilled);
			}
		},

		botWater(callback = null, x = this.grid_x, y = this.grid_y) {
			this.performAct(true, this.botact_duration, callback);

			const { soil, crop = null } = farm_grid_index.get(`${y}-${x}`);

			if (crop && crop.crop_state === CropStates.HARVESTABLE) {
				// THIS SHOULD START A NEW TIMER AND HURT THE PLANT
				this.showError(SAY_DATA.farm.error.water_harvestable);
			} else if (crop && crop.crop_state === CropStates.DEAD) {
				this.showError(SAY_DATA.farm.error.crop_dead);
			} else if (soil.soil_state === SoilStates.READY) {
				soil.setSoilState(SoilStates.WATERED);
				this.showIcon(IconTypes.DROPLET, this.botact_duration);
			} else if (soil.soil_state === SoilStates.INITIAL) {
				this.showError(SAY_DATA.farm.error.water_initial);
			} else if (soil.soil_state === SoilStates.WATERED) {
				this.showError(SAY_DATA.farm.error.water_watered);
			}
		},

		botPlant(type, callback = null, x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();
			this.wait(this.botact_duration, () => {
				if (callback) callback();
			});

			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { soil, crop = null } = farm_grid_index.get(key);

			if (
				crop == null &&
				(soil.soil_state === SoilStates.READY ||
					soil.soil_state === SoilStates.WATERED)
			) {
				if (INVENTORY.crops[type] > 0) {
					this.showIcon(IconTypes.SEEDPACK, this.botact_duration);
					const crop = addCrop(farm_grid_index, type, this.grid_x, this.grid_y);
					farm_grid_index.set(key, { ...tile, crop });
					INVENTORY.changeCrops(type, -1);
				} else {
					this.showError(SAY_DATA.farm.error.insufficient_resources);
				}
			} else if (soil.soil_state === SoilStates.INITIAL) {
				this.showError(SAY_DATA.farm.error.plant_initial);
			} else if (crop != null) {
				this.showError(SAY_DATA.farm.error.plant_planted);
			}
		},

		botHarvest(callback = null, x = this.grid_x, y = this.grid_y) {
			this.performAct();
			this.wait(this.botact_duration, () => {
				if (callback) callback();
			});

			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { soil, crop = null } = farm_grid_index.get(key);

			if (crop && crop.crop_state === CropStates.HARVESTABLE) {
				crop.harvest();
				crop.wait(0.5, () => {
					const total_exp =
						crop.crop_exp /
						(crop.freshness_state === FreshnessStates.FRESH ? 1 : 2);
					PLAYER_DATA.changeExp(total_exp);
					this.dropOrbs(crop, total_exp, OrbTypes.EXP);
					crop.wait(0.5, () => {
						const total_coin =
							crop.crop_reward /
							(crop.freshness_state === FreshnessStates.FRESH ? 1 : 2);
						INVENTORY.changeCoins(total_coin);
						this.dropOrbs(crop, total_coin, OrbTypes.COIN);
						crop.destroy();
						delete tile.crop;
					});
				});
			} else if (crop.crop_state === CropStates.GROWING) {
				this.showError(SAY_DATA.farm.error.harvest_not_ready);
			} else if (crop.crop_state === CropStates.DEAD) {
				this.showError(SAY_DATA.farm.error.crop_dead);
			}
		},

		botDestroy(callback = null, x = this.grid_x, y = this.grid_y) {
			if (this.is_available === false) return;
			this.performAct();
			this.wait(this.botact_duration, () => {
				if (callback) callback();
			});

			const key = `${y}-${x}`;
			const tile = farm_grid_index.get(key);
			const { crop = null } = farm_grid_index.get(key);

			if (crop && !crop.absorbing_water) {
				crop.animation.seek(0);
				crop.unanimateAll();
				crop.angle = 0;
				crop.animate(
					"scale",
					[k.vec2(1), k.vec2(1.2, 0.8), k.vec2(1), k.vec2(0.8, 1.2), k.vec2(1)],
					{
						duration: 0.5,
						loops: 1,
						easing: k.easings.easeInOutSine,
					},
				);
				crop.animate("opacity", [1, 0], {
					duration: 0.5,
					loops: 1,
					easing: k.easings.easeInOutSine,
				});
				crop.wait(0.5, () => {
					this.showIcon(IconTypes.ANGEL, this.botact_duration);
					crop.destroy();
					delete tile.crop;
				});
			} else if (crop.absorbing_water) {
				this.showError(SAY_DATA.farm.error.destroy_absoring);
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
			const control_point = k.vec2(
				start_pos.x + (target_pos.x - start_pos.x) / 2,
				start_pos.y - (start_pos.y / target_pos.y) * 150,
			);

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

			this.scaleAnim = this.animate(
				"scale",
				[
					k.vec2(1, 1),
					k.vec2(1.2, 0.9),
					k.vec2(1.3, 0.8),
					k.vec2(1.4, 0.8),
					k.vec2(1, 1),
					k.vec2(1.4, 1.5),
					k.vec2(0.9, 1.5),
					k.vec2(0.9, 1.1),
					k.vec2(1, 1),
					k.vec2(1.1, 1),
					k.vec2(1, 1),
					k.vec2(0.95, 1.05),
					k.vec2(1, 1),
				],
				{
					duration,
					timing: [
						0, 0.1, 0.15, 0.2, 0.3, 0.5, 0.6, 0.7, 0.9, 0.92, 0.96, 0.98, 1,
					],
					loops: 1,
					easing: k.easings.easeInSine,
				},
			);

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

export function addFarmbot(id, farm_grid_index, x, y) {
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
		dropOrbs(),
		botact(id, farm_grid_index),
		ysort(),
		saytext(0, -70),
		popupicon(),
		displaytext(id, -64 / 2, -58, { size: 20, color: k.GREEN }),
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

		freshness(),
		gridpos(x, y, CONFIG.FARM.tile_size / 2, CONFIG.FARM.tile_size / 2),
		ysort(),
		crop(farm_grid_index, type, state),
	]);
}
