import kaplay from "kaplay";

export let k;

export function init_kaplay() {
	k = kaplay({
		height: 500,
		width: 500,
		font: "sans",
		canvas: document.getElementById("game"),
		tagsAsComponents: true,
		background: "#000000",
		touchToMouse: true,
		crisp: true,
		global: false,
	});

	return k;
}
