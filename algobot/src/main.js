import "./index.css";
import createGame from "./game/game";
import createEditor from "./editor/codemirror";
import createBlockly from "./blockly/blockly";

window.addEventListener("DOMContentLoaded", () => {
	try {
		createGame("game");
		createEditor("editor");
		createBlockly("blockly");

		console.log("✅ Algobot initialized successfully!");
	} catch (error) {
		console.error("❌ Initialization failed:", error);
	}
});
