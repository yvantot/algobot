import * as Blockly from "blockly";

export default function createBlockly(parentId) {
	const toolbox = {
		kind: "flyoutToolbox",
		contents: [
			{ kind: "block", type: "controls_repeat_ext" },
			{ kind: "block", type: "logic_compare" },
			{ kind: "block", type: "math_number", fields: { NUM: 10 } },
		],
	};

	return Blockly.inject(parentId, {
		toolbox,
		grid: { spacing: 20, length: 3, colour: "#334155", snap: true },
	});
}
