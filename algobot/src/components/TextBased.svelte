<script>
  // The problem with this structure is that async are shared, that means if you want to control
  // multiple robot, you have to wait for other robot finish.
  // The solution is own interpreter per robot

  import { CONFIG, TYPE_COLORS } from "../game/global/global";
  import { robots } from "../game/game.js";
  import { DOCUMENT_DATA } from "../game/global/global.js";

  import { onMount } from "svelte";
  import { autocompletion } from "@codemirror/autocomplete";
  import { EditorView, basicSetup } from "codemirror";
  import { javascript } from "@codemirror/lang-javascript";
  import { oneDark } from "@codemirror/theme-one-dark";
  import { hoverTooltip } from "@codemirror/view";

  const customSelectionTheme = EditorView.theme(
    {
      ".cm-selectionBackground, .cm-content ::selection": {
        backgroundColor: "#fff81a !important",
        opacity: "1",
      },
    },
    { dark: true },
  );

  let view;

  const global_ac = [];
  const bot_ac = [];
  const global_keys = [];

  const keyword = {};

  // TODO: give Documentatiosen type
  // Figure out how to do custom syntax highlighting in CodeMirror
  for (const main of Object.keys(DOCUMENT_DATA)) {
    for (const key of Object.keys(DOCUMENT_DATA[main])) {
      const data = DOCUMENT_DATA[main][key];
      keyword[key] = { ...data, name: key };
      switch (main) {
        case "syntax":
        case "globals":
        case "functions": {
          global_keys.push(key);
          global_ac.push({ label: key, type: data.type, detail: data.definition });
          break;
        }
        case "bot_movement":
        case "bot_farm_actions":
        case "bot_checks": {
          bot_ac.push({ label: key, type: "keyword", detail: data.definition });
          break;
        }
      }
    }
  }

  const keywordHoverTooltip = hoverTooltip((view, pos, side) => {
    let { from, to, text } = view.state.doc.lineAt(pos);

    let start = pos,
      end = pos;
    while (start > from && /[\w]/.test(text[start - from - 1])) start--;
    while (end < to && /[\w]/.test(text[end - from])) end++;
    if ((start == pos && side < 0) || (end == pos && side > 0)) return null;
    const word = text.slice(start - from, end - from);

    if (!keyword[word]) return null;

    return {
      pos: start,
      end: end,
      above: true,
      create(view) {
        let dom = document.createElement("div");

        dom.style.cssText = `
          max-width: 25ch;
        `;

        dom.innerHTML = `
          <div class="overflow-hidden flex flex-col bg-[#39404f] border-2 border-slate-400 rounded-lg p-2 gap-2 text-xs">
            <div class="flex gap-2 items-center justify-between">
              <p class="font-bold" style="font-family: 'Courier Prime'">${keyword[word].name}</p>
              <p class="font-bold p-1 px-2 text-xs bg-[#262b36] rounded scale-90" style=${"color:" + TYPE_COLORS[keyword[word].type]}>${keyword[word].type}</p>
            </div>
            <div class="overflow-y-auto flex flex-col gap-2">
              <p>${keyword[word].definition}</p>
              ${
                keyword[word]?.note != null
                  ? `
                <div class="bg-green-200 p-2 rounded-lg border-2 border-green-400">
                  <p class="text-green-800 font-bold">Remember!</p>
                  <p class="text-green-800">${keyword[word].note}</p>
                </div>
              `
                  : ""
              }
            </div>
          </div>
        `;

        return { dom };
      },
    };
  });

  function myCompletions(context) {
    const word = context.matchBefore(/\w*/);

    const isAfterDot = context.matchBefore(/\.\w*/);
    if (isAfterDot) return null;

    if (!word || (word.from === word.to && !context.explicit)) return null;

    return {
      from: word.from,
      options: global_ac,
      filter: true,
    };
  }

  function botCompletions(context) {
    const nodeBefore = context.matchBefore(/\bbot\./);
    if (!nodeBefore) return null;

    return {
      from: context.pos,
      options: bot_ac,
      validFor: /^\w*$/,
    };
  }

  let code = $state(`bot.till()
bot.water()
bot.plant("wheat")
bot.harvest()`);

  onMount(() => {
    view = new EditorView({
      doc: code,
      extensions: [
        basicSetup,
        customSelectionTheme,
        javascript({ typescript: false, globalVars: global_keys }),
        oneDark,
        keywordHoverTooltip,
        EditorView.lineWrapping,
        autocompletion({
          override: [myCompletions, botCompletions],
        }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            code = update.state.doc.toString();
          }
        }),
      ],
      parent: document.getElementById("editor-container"),
    });

    return () => {
      view.destroy(); // Cleanup on component destroy
    };
  });

  let js_interpreter = $state(null);
  let is_running = $state(false);
  let interval = null;

  const init = (interpreter, global_obj) => {
    const { columns, rows } = CONFIG.FARM;

    interpreter.setProperty(global_obj, "columns", columns);
    interpreter.setProperty(global_obj, "rows", rows);

    const bots = interpreter.nativeToPseudo([]);

    robots.forEach((robot, index) => {
      const bot = interpreter.nativeToPseudo({});

      interpreter.setProperty(
        bot,
        "say",
        interpreter.createNativeFunction((t) => robot.sayText(t)),
      );
      // Move
      interpreter.setProperty(
        bot,
        "jump",
        interpreter.createAsyncFunction((x, y, cb) => robot.botJump(x, y, cb)),
      );
      interpreter.setProperty(
        bot,
        "left",
        interpreter.createAsyncFunction((cb) => robot.botJump(robot.grid_x - 1, robot.grid_y, cb)),
      );
      interpreter.setProperty(
        bot,
        "right",
        interpreter.createAsyncFunction((cb) => robot.botJump(robot.grid_x + 1, robot.grid_y, cb)),
      );
      interpreter.setProperty(
        bot,
        "down",
        interpreter.createAsyncFunction((cb) => robot.botJump(robot.grid_x, robot.grid_y + 1, cb)),
      );
      interpreter.setProperty(
        bot,
        "up",
        interpreter.createAsyncFunction((cb) => robot.botJump(robot.grid_x, robot.grid_y - 1, cb)),
      );
      interpreter.setProperty(
        bot,
        "till",
        interpreter.createAsyncFunction((cb) => robot.botTill(cb)),
      );
      interpreter.setProperty(
        bot,
        "water",
        interpreter.createAsyncFunction((cb) => robot.botWater(cb)),
      );
      interpreter.setProperty(
        bot,
        "harvest",
        interpreter.createAsyncFunction((cb) => robot.botHarvest(cb)),
      );
      interpreter.setProperty(
        bot,
        "plant",
        interpreter.createAsyncFunction((type, cb) => robot.botPlant(type, cb)),
      );
      interpreter.setProperty(
        bot,
        "destroy",
        interpreter.createAsyncFunction((cb) => robot.botDestroy(cb)),
      );
      // CHECKS
      interpreter.setProperty(
        bot,
        "is_tilled",
        interpreter.createAsyncFunction((cb) => robot.checkTilled(cb)),
      );
      interpreter.setProperty(
        bot,
        "is_watered",
        interpreter.createAsyncFunction((cb) => robot.checkWatered(cb)),
      );
      interpreter.setProperty(
        bot,
        "is_planted",
        interpreter.createAsyncFunction((cb) => robot.checkPlanted(cb)),
      );
      interpreter.setProperty(
        bot,
        "is_harvestable",
        interpreter.createAsyncFunction((cb) => robot.isHarvestable(cb)),
      );

      // Fix this shit
      if (index === 0) interpreter.setProperty(global_obj, "bot", bot);
      interpreter.setProperty(bots, index, bot);
    });

    interpreter.setProperty(global_obj, "bots", bots);
  };

  function selectCode(start, end) {
    if (!view) return;

    view.dispatch({
      selection: { anchor: start, head: end },
      scrollIntoView: true,
    });
    view.focus();
  }

  // Modified code from https://neil.fraser.name/software/JS-Interpreter/demos/line.html
  function createSelection(start, end) {
    selectCode(start, end);
  }

  // Modified code from https://neil.fraser.name/software/JS-Interpreter/demos/line.html
  function isLine(stack) {
    var state = stack[stack.length - 1];
    var node = state.node;
    var type = node.type;

    if (type !== "VariableDeclaration" && type.substr(-9) !== "Statement") {
      // Current node is not a statement.
      return false;
    }

    if (type === "BlockStatement") {
      // Not a 'line' by most definitions.
      return false;
    }

    if (type === "VariableDeclaration" && stack[stack.length - 2].node.type === "ForStatement") {
      // This 'var' is not a line: for (var i = 0; ...)
      return false;
    }

    if (isLine.oldStack_[isLine.oldStack_.length - 1] === state) {
      // Never repeat the same statement multiple times.
      // Typically a statement is stepped into and out of.
      return false;
    }

    if (isLine.oldStack_.indexOf(state) !== -1 && type !== "ForStatement" && type !== "WhileStatement" && type !== "DoWhileStatement") {
      // Don't revisit a statement on the stack (e.g. 'if') when exiting.
      // The exception is loops.
      return false;
    }

    isLine.oldStack_ = stack.slice();
    return true;
  }
  isLine.oldStack_ = [];

  // Modified code from https://neil.fraser.name/software/JS-Interpreter/demos/line.html
  function handleStep() {
    if (!js_interpreter) js_interpreter = new Interpreter(code, init);

    var stack = js_interpreter.getStateStack();
    var step_again = !isLine(stack);

    try {
      var ok = js_interpreter.step();
    } finally {
      if (!ok) {
        handleReset();
        step_again = false;
      }
    }

    if (step_again) {
      try {
        handleStep();
      } catch (error) {
        null;
      }
    } else {
      // Only call createSelection when we've landed on a line
      var stack = js_interpreter.getStateStack();
      if (stack.length) {
        var node = stack[stack.length - 1].node;
        createSelection(node.start, node.end);
      }
    }
  }

  function handleStart() {
    js_interpreter = new Interpreter(code, init);
    is_running = !is_running;

    clearInterval(interval);

    interval = setInterval(() => {
      if (is_running) {
        handleStep();
      }
    }, 0);
  }
  function handleReset() {
    js_interpreter = null;
    is_running = false;
    var field = document.getElementById("code");
    if (field) field.setSelectionRange(0, 0);
  }
</script>

<div class="text-slate-700 h-[95vh] bottom-4 flex flex-col w-[30vw] bg-gray-100 border-4 border-slate-500 rounded-xl shadow-xl overflow-hidden text-sm">
  <div class="py-2 border-b-2 border-slate-400">
    <h1 class="text-center font-bold text-base">Bot Command</h1>
  </div>

  <div>
    <div class="flex bg-slate-200 border-b-2 border-slate-400 shrink-0">
      <div class="border-r-2 border-slate-600 px-3 py-1 bg-[#262737] text-[#82F54C] font-bold flex-grow text-center cursor-pointer select-none">Bot 0</div>
    </div>
  </div>

  <div class="flex bg-slate-200 border-b-2 border-slate-400 shrink-0">
    <button class="px-3 py-1 bg-white text-slate-700 border-r-2 border-slate-400 font-bold cursor-pointer">+</button>
    <div class="px-3 py-1 bg-white text-slate-700 border-r-2 border-slate-400 font-bold">run.bot</div>
    <div class="px-3 py-1 bg-white text-slate-700 border-r-2 border-slate-400 font-bold">try.bot</div>
  </div>

  <div class="flex-1 bg-white min-h-0 overflow-y-auto">
    <div id="editor-container" class="w-full h-full bg-[#262b36]"></div>
  </div>

  <div class="p-2 bg-slate-200 border-t-2 border-slate-400 flex flex-col gap-2 shrink-0">
    <div class="grid grid-cols-3 gap-2">
      <button onclick={handleStart} class="btn-primary">{is_running ? "Stop" : "Start"}</button>
      <button onclick={handleStep} class="btn-primary" disabled={is_running}>Step</button>
      <button onclick={handleReset} class="btn-primary">Reset</button>
    </div>
  </div>
  {#if robots.length > 1}
    <div class="p-2 bg-slate-300 border-t-2 border-slate-400 flex flex-col gap-2 shrink-0">
      <div class="grid grid-cols-3 gap-2">
        <button onclick={handleStart} class="btn-primary">{is_running ? "Stop All" : "Start All"}</button>
        <button onclick={handleStep} class="btn-primary" disabled={is_running}>Step All</button>
        <button onclick={handleReset} class="btn-primary">Reset All</button>
      </div>
    </div>
  {/if}
</div>
