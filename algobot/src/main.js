import "./index.css";
// Import the functions we exported in the other files
import createGame from "./game/game";
import createEditor from "./editor/codemirror";
import createBlockly from "./blockly/blockly";

// Wait for the DOM to be ready, then inject the libraries into their IDs
window.addEventListener("DOMContentLoaded", () => {
	try {
		// 1. Start Phaser in the #game div
		createGame("game");

		// 2. Start CodeMirror in the #editor div
		createEditor("editor");

		// 3. Start Blockly in the #blockly div
		createBlockly("blockly");

		console.log("✅ Algobot initialized successfully!");
	} catch (error) {
		console.error("❌ Initialization failed:", error);
	}
});
