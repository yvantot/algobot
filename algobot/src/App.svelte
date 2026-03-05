<script>
	import DevTools from "./components/DevTools.svelte";
	import { onMount } from "svelte";

	onMount(() => {
		// createEditor("editor");
		// createBlockly("blockly");
	});
</script>

<div class="flex justify-center align-middle gap-4 h-screen">
	<div class="hidden flex flex-col justify-start align-middle gap-2 bg-gray-700 rounded-lg p-4 overflow-y-auto" style="scrollbar-width: thin">
		<div id="editor" class="h-1/2 min-h-60 rounded-lg border-2 border-emerald-500 bg-slate-900"></div>
		<div id="blockly" class="h-1/2 min-h-60 rounded-lg border-2 border-orange-500 bg-slate-800"></div>

		<DevTools />
	</div>
</div>

<style>
	*,
	*::before,
	*::after {
		box-sizing: border-box;
	}
	* {
		color: #fafafa;
		font-size: 11px;
	}
</style>
