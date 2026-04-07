import { AvatarTypes, ModalTypes } from "../game/global/enum.js";

// I only need level as index, this is the simplest shit implementation
export const CLAIMED_REWARDS = $state([]);

export const Personalize = $state({
	FARM_NAME: "My Amazing Farm",
	AVATAR: AvatarTypes.FARMER,
});

export const Modals = $state({
	[ModalTypes.LEVEL_REWARDS]: false,
	[ModalTypes.FARM_PERSONALIZE]: false,
});
