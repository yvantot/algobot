import Phaser from "phaser";

// 1. Define the Scene
class MainScene extends Phaser.Scene {
	constructor() {
		super("MainScene");
	}

	create() {
		this.add.text(20, 20, "🚀 Phaser: ONLINE", { color: "#6366f1", fontSize: "24px" });
		this.bot = this.add.rectangle(300, 300, 50, 50, 0x6366f1);
	}

	update() {
		if (this.bot) this.bot.rotation += 0.02;
	}
}

// 2. Export the function that main.js is looking for
export default function createGame(parentId) {
	return new Phaser.Game({
		type: Phaser.AUTO,
		parent: parentId, // This hooks into the <div id="game">
		width: 600,
		height: 600,
		backgroundColor: "#0f172a",
		scene: MainScene,
	});
}
