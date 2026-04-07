<script>
  import { onMount, onDestroy } from "svelte";
  import * as Blockly from "blockly";
  import "blockly/blocks";
  import { javascriptGenerator } from "blockly/javascript";
  import { CONFIG } from "../game/global/global";
  import { robots } from "../game/game.js";

  // ─── Props ────────────────────────────────────────────────
  // Pass in the same `init` function you use for your JS-Interpreter
  // so generated code runs in the same sandboxed environment.
  export let onRun = (code) => console.log(code); // override with your runner

  // ─── State ────────────────────────────────────────────────
  let blocklyDiv;
  let workspace;
  let is_running = false;

  // ─── Theme: slate palette matching the text editor ────────
  const slateTheme = Blockly.Theme.defineTheme("slate", {
    base: Blockly.Themes.Classic,
    blockStyles: {
      // Bot blocks – indigo accent
      logic_blocks: { colourPrimary: "#475569", colourSecondary: "#334155", colourTertiary: "#1e293b" },
      loop_blocks: { colourPrimary: "#475569", colourSecondary: "#334155", colourTertiary: "#1e293b" },
      math_blocks: { colourPrimary: "#475569", colourSecondary: "#334155", colourTertiary: "#1e293b" },
      text_blocks: { colourPrimary: "#475569", colourSecondary: "#334155", colourTertiary: "#1e293b" },
      list_blocks: { colourPrimary: "#475569", colourSecondary: "#334155", colourTertiary: "#1e293b" },
      variable_blocks: { colourPrimary: "#64748b", colourSecondary: "#475569", colourTertiary: "#334155" },
      procedure_blocks: { colourPrimary: "#64748b", colourSecondary: "#475569", colourTertiary: "#334155" },
    },
    componentStyles: {
      workspaceBackgroundColour: "#f8fafc", // slate-50
      toolboxBackgroundColour: "#e2e8f0", // slate-200
      toolboxForegroundColour: "#334155", // slate-700
      flyoutBackgroundColour: "#f1f5f9", // slate-100
      flyoutForegroundColour: "#1e293b", // slate-800
      flyoutOpacity: 1,
      scrollbarColour: "#94a3b8", // slate-400
      insertionMarkerColour: "#334155",
      insertionMarkerOpacity: 0.4,
      scrollbarOpacity: 0.6,
      cursorColour: "#6366f1", // indigo-500
    },
  });

  // ─── Register block shapes ────────────────────────────────
  function registerBlocks() {
    // ── bot.say(text) ──────────────────────────────────────
    Blockly.Blocks["bot_say"] = {
      init() {
        this.appendValueInput("TEXT").setCheck(null).appendField("bot.say");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#6366f1");
        this.setTooltip("Make the bot say something");
      },
    };

    // ── bot.jump(x, y) ────────────────────────────────────
    Blockly.Blocks["bot_jump"] = {
      init() {
        this.appendDummyInput().appendField("bot.jump  x").appendField(new Blockly.FieldNumber(0, 0), "X").appendField("y").appendField(new Blockly.FieldNumber(0, 0), "Y");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#6366f1");
        this.setTooltip("Jump the bot to coordinates (x, y)");
      },
    };

    // ── bot.till() ────────────────────────────────────────
    Blockly.Blocks["bot_till"] = {
      init() {
        this.appendDummyInput().appendField("bot.till");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#854d0e"); // amber-800
        this.setTooltip("Till the soil at the current position");
      },
    };

    // ── bot.water() ───────────────────────────────────────
    Blockly.Blocks["bot_water"] = {
      init() {
        this.appendDummyInput().appendField("bot.water");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#0369a1"); // sky-700
        this.setTooltip("Water the tile at the current position");
      },
    };

    // ── bot.harvest() ─────────────────────────────────────
    Blockly.Blocks["bot_harvest"] = {
      init() {
        this.appendDummyInput().appendField("bot.harvest");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#15803d"); // green-700
        this.setTooltip("Harvest the crop at the current position");
      },
    };

    // ── bot.plant(type) ───────────────────────────────────
    Blockly.Blocks["bot_plant"] = {
      init() {
        this.appendValueInput("TYPE").setCheck(null).appendField("bot.plant");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#15803d"); // green-700
        this.setTooltip("Plant a crop of the given type");
      },
    };

    // ── bot.destroy() ─────────────────────────────────────
    Blockly.Blocks["bot_destroy"] = {
      init() {
        this.appendDummyInput().appendField("bot.destroy");
        this.setPreviousStatement(true, null);
        this.setNextStatement(true, null);
        this.setColour("#b91c1c"); // red-700
        this.setTooltip("Destroy the object at the current position");
      },
    };

    // ── bot.check_tilled() → boolean ──────────────────────
    Blockly.Blocks["bot_check_tilled"] = {
      init() {
        this.appendDummyInput().appendField("bot.check_tilled");
        this.setOutput(true, "Boolean");
        this.setColour("#854d0e");
        this.setTooltip("Returns true if the current tile is tilled");
      },
    };

    // ── bot.check_watered() → boolean ─────────────────────
    Blockly.Blocks["bot_check_watered"] = {
      init() {
        this.appendDummyInput().appendField("bot.check_watered");
        this.setOutput(true, "Boolean");
        this.setColour("#0369a1");
        this.setTooltip("Returns true if the current tile is watered");
      },
    };

    // ── bot.check_planted() → boolean ─────────────────────
    Blockly.Blocks["bot_check_planted"] = {
      init() {
        this.appendDummyInput().appendField("bot.check_planted");
        this.setOutput(true, "Boolean");
        this.setColour("#15803d");
        this.setTooltip("Returns true if the current tile has a planted crop");
      },
    };

    // ── bot.is_harvestable() → boolean ────────────────────
    Blockly.Blocks["bot_is_harvestable"] = {
      init() {
        this.appendDummyInput().appendField("bot.is_harvestable");
        this.setOutput(true, "Boolean");
        this.setColour("#15803d");
        this.setTooltip("Returns true if the crop is ready to harvest");
      },
    };
  }

  // ─── Register code generators (forBlock API) ──────────────
  function registerGenerators() {
    const O = javascriptGenerator.ORDER_ATOMIC;
    const ON = javascriptGenerator.ORDER_NONE;

    javascriptGenerator.forBlock["bot_say"] = (b) => {
      const text = javascriptGenerator.valueToCode(b, "TEXT", O) || "''";
      return `bot.say(${text});\n`;
    };

    javascriptGenerator.forBlock["bot_jump"] = (b) => {
      const x = b.getFieldValue("X");
      const y = b.getFieldValue("Y");
      return `await bot.jump(${x}, ${y});\n`;
    };

    javascriptGenerator.forBlock["bot_till"] = () => `await bot.till();\n`;
    javascriptGenerator.forBlock["bot_water"] = () => `await bot.water();\n`;
    javascriptGenerator.forBlock["bot_harvest"] = () => `await bot.harvest();\n`;

    javascriptGenerator.forBlock["bot_plant"] = (b) => {
      const type = javascriptGenerator.valueToCode(b, "TYPE", O) || "''";
      return `await bot.plant(${type});\n`;
    };

    javascriptGenerator.forBlock["bot_destroy"] = () => `await bot.destroy();\n`;

    javascriptGenerator.forBlock["bot_check_tilled"] = () => [`bot.check_tilled()`, ON];
    javascriptGenerator.forBlock["bot_check_watered"] = () => [`bot.check_watered()`, ON];
    javascriptGenerator.forBlock["bot_check_planted"] = () => [`bot.check_planted()`, ON];
    javascriptGenerator.forBlock["bot_is_harvestable"] = () => [`bot.is_harvestable()`, ON];
  }

  // ─── Toolbox ──────────────────────────────────────────────
  const toolbox = {
    kind: "categoryToolbox",
    contents: [
      {
        kind: "category",
        name: "🤖  Bot",
        colour: "#6366f1",
        contents: [
          { kind: "block", type: "bot_say", inputs: { TEXT: { shadow: { type: "text", fields: { TEXT: "Hello!" } } } } },
          { kind: "block", type: "bot_jump" },
        ],
      },
      {
        kind: "category",
        name: "🌾  Farm",
        colour: "#15803d",
        contents: [
          { kind: "block", type: "bot_till" },
          { kind: "block", type: "bot_water" },
          { kind: "block", type: "bot_harvest" },
          { kind: "block", type: "bot_plant", inputs: { TYPE: { shadow: { type: "text", fields: { TEXT: "wheat" } } } } },
          { kind: "block", type: "bot_destroy" },
        ],
      },
      {
        kind: "category",
        name: "🔍  Check",
        colour: "#0369a1",
        contents: [
          { kind: "block", type: "bot_check_tilled" },
          { kind: "block", type: "bot_check_watered" },
          { kind: "block", type: "bot_check_planted" },
          { kind: "block", type: "bot_is_harvestable" },
        ],
      },
      {
        kind: "category",
        name: "🔢  Logic",
        colour: "#5C81A6",
        contents: [
          { kind: "block", type: "controls_if" },
          { kind: "block", type: "logic_compare" },
          { kind: "block", type: "logic_operation" },
          { kind: "block", type: "logic_negate" },
          { kind: "block", type: "logic_boolean" },
          { kind: "block", type: "logic_null" },
          { kind: "block", type: "logic_ternary" },
        ],
      },
      {
        kind: "category",
        name: "🔁  Loops",
        colour: "#5CA65C",
        contents: [
          { kind: "block", type: "controls_repeat_ext", inputs: { TIMES: { shadow: { type: "math_number", fields: { NUM: 10 } } } } },
          { kind: "block", type: "controls_whileUntil" },
          {
            kind: "block",
            type: "controls_for",
            inputs: {
              FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } },
              TO: { shadow: { type: "math_number", fields: { NUM: 10 } } },
              BY: { shadow: { type: "math_number", fields: { NUM: 1 } } },
            },
          },
          { kind: "block", type: "controls_forEach" },
          { kind: "block", type: "controls_flow_statements" },
        ],
      },
      {
        kind: "category",
        name: "🔣  Math",
        colour: "#5C68A6",
        contents: [
          { kind: "block", type: "math_number", fields: { NUM: 0 } },
          { kind: "block", type: "math_arithmetic" },
          { kind: "block", type: "math_single" },
          { kind: "block", type: "math_trig" },
          { kind: "block", type: "math_constant" },
          { kind: "block", type: "math_number_property" },
          { kind: "block", type: "math_round" },
          { kind: "block", type: "math_modulo" },
          {
            kind: "block",
            type: "math_random_int",
            inputs: {
              FROM: { shadow: { type: "math_number", fields: { NUM: 1 } } },
              TO: { shadow: { type: "math_number", fields: { NUM: 100 } } },
            },
          },
          { kind: "block", type: "math_random_float" },
        ],
      },
      {
        kind: "category",
        name: "📝  Text",
        colour: "#5CA68D",
        contents: [
          { kind: "block", type: "text", fields: { TEXT: "" } },
          { kind: "block", type: "text_join" },
          { kind: "block", type: "text_append", inputs: { TEXT: { shadow: { type: "text", fields: { TEXT: "" } } } } },
          { kind: "block", type: "text_length" },
          { kind: "block", type: "text_isEmpty" },
          { kind: "block", type: "text_indexOf", inputs: { VALUE: { shadow: { type: "text", fields: { TEXT: "abc" } } } } },
          { kind: "block", type: "text_charAt" },
          { kind: "block", type: "text_getSubstring" },
          { kind: "block", type: "text_changeCase" },
          { kind: "block", type: "text_trim" },
          { kind: "block", type: "text_print" },
        ],
      },
      {
        kind: "category",
        name: "📋  Lists",
        colour: "#745CA6",
        contents: [
          { kind: "block", type: "lists_create_with" },
          { kind: "block", type: "lists_repeat", inputs: { NUM: { shadow: { type: "math_number", fields: { NUM: 5 } } } } },
          { kind: "block", type: "lists_length" },
          { kind: "block", type: "lists_isEmpty" },
          { kind: "block", type: "lists_indexOf" },
          { kind: "block", type: "lists_getIndex" },
          { kind: "block", type: "lists_setIndex" },
          { kind: "block", type: "lists_getSublist" },
          { kind: "block", type: "lists_split" },
          { kind: "block", type: "lists_sort" },
        ],
      },
      { kind: "category", name: "📦  Variables", colour: "#A65C81", custom: "VARIABLE" },
      { kind: "category", name: "⚙️  Functions", colour: "#9A5CA6", custom: "PROCEDURE" },
    ],
  };

  // ─── Starter blocks ───────────────────────────────────────
  const START_XML = `<xml>
    <block type="bot_jump" x="40" y="40">
      <field name="X">1</field>
      <field name="Y">1</field>
    </block>
  </xml>`;

  // ─── Run ──────────────────────────────────────────────────
  function handleRun() {
    const code = javascriptGenerator.workspaceToCode(workspace);
    onRun(code);
  }

  // ─── Lifecycle ────────────────────────────────────────────
  onMount(() => {
    registerBlocks();
    registerGenerators();

    workspace = Blockly.inject(blocklyDiv, {
      toolbox,
      theme: slateTheme,
      grid: { spacing: 20, length: 3, colour: "#cbd5e1", snap: true }, // slate-300
      zoom: { controls: true, wheel: true, startScale: 1, maxScale: 3, minScale: 0.3, scaleSpeed: 1.2 },
      trashcan: true,
      sounds: false,
      renderer: "zelos",
    });

    Blockly.Xml.domToWorkspace(Blockly.utils.xml.textToDom(START_XML), workspace);
  });

  onDestroy(() => {
    workspace?.dispose();
  });
</script>

<!-- ═══════════════════════════════════════════════════════ -->
<div class="h-[90vh] w-96 flex flex-col bg-slate-100 border-4 border-slate-500 rounded-xl shadow-xl overflow-hidden text-sm font-sans z-50">
  <!-- Title bar -->
  <div class="relative flex justify-center items-center py-2 bg-slate-200 border-b-2 border-slate-400 shrink-0">
    <h2 class="font-bold text-slate-700 tracking-wide">Bot Command</h2>
  </div>

  <!-- Tab bar -->
  <div class="flex bg-slate-200 border-b-2 border-slate-400 shrink-0">
    <div class="px-3 py-1 bg-white text-slate-700 border-r-2 border-slate-400 font-bold">block.bot</div>
  </div>

  <!-- Blockly canvas -->
  <div class="flex-1 min-h-0 bg-white" bind:this={blocklyDiv}></div>

  <!-- Footer / controls -->
  <div class="p-3 bg-slate-200 border-t-2 border-slate-400 flex flex-col gap-2 shrink-0">
    <div class="grid grid-cols-1 gap-2">
      <button onclick={handleRun} class="px-3 py-1 bg-slate-600 hover:bg-slate-700 active:bg-slate-800 text-white font-semibold rounded text-sm transition-colors cursor-pointer border-2 border-slate-700 select-none w-full">
        {is_running ? "Stop" : "Run"}
      </button>
    </div>
  </div>
</div>

<!-- ═══════════════════════════════════════════════════════ -->
<style>
  /* Blockly overrides — must be global since Blockly injects its own DOM */
  :global(.blocklyMainBackground) {
    fill: #ffffff !important;
  }
  :global(.blocklyToolboxDiv) {
    background: #e2e8f0 !important;
    border-right: 2px solid #94a3b8 !important;
  }
  :global(.blocklyTreeRow) {
    border-radius: 4px !important;
    margin: 1px 4px !important;
  }
  :global(.blocklyTreeRow:hover) {
    background: #cbd5e1 !important;
  }
  :global(.blocklyTreeSelected) {
    background: #94a3b8 !important;
  }
  :global(.blocklyTreeLabel) {
    font-family: ui-sans-serif, system-ui, sans-serif !important;
    font-size: 12.5px !important;
    font-weight: 600 !important;
    color: #334155 !important;
  }
  :global(.blocklyFlyoutBackground) {
    fill: #f1f5f9 !important;
    fill-opacity: 1 !important;
  }
  :global(.blocklyScrollbarKnob) {
    fill: #94a3b8 !important;
    fill-opacity: 0.8 !important;
  }
  :global(.blocklyScrollbarBackground) {
    fill: transparent !important;
  }
</style>
