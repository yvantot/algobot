import { EditorView, basicSetup } from "codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

export default function createEditor(parentId) {
	return new EditorView({
		doc: "function moveBot() {\n  // CodeMirror is working!\n  bot.moveForward();\n}",
		extensions: [basicSetup, javascript(), oneDark],
		parent: document.getElementById(parentId),
	});
}
