import kaplay from "kaplay";

export let k;

export function initKaplay() {
	k = kaplay({
		canvas: document.getElementById("game"),
		tagsAsComponents: true,
		background: "#000000",
		touchToMouse: true,
		global: false,

		height:  Math.round(innerHeight / 8) * 8,
		width: Math.round(innerWidth / 8) * 8,
		pixelDensity: 2, // change this to 2
		crisp: false, // change this to false
	});

	return k;
}
