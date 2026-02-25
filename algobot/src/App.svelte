<script>
	import DevTools from "./components/DevTools.svelte";
	import { onMount } from "svelte";
	import { init_kaplay } from "./lib/kaplay";

	// Robot inputs
	let moveX = $state(0);
	let moveY = $state(0);

	// Grid inputs
	let gridX = $state(0);
	let gridY = $state(0);
	let soilState = $state("initial");

	// Selected animation
	let selectedObject = $state("false");
	let selectedProperty = $state("position");
	let animationValue = $state("");
	let animationDuration = $state("");

	// Handlers
	function moveRobot() {
		console.log("Move robot to:", moveX, moveY);
	}
	function plantBot() {
		console.log("Plant bot");
	}
	function waterBot() {
		console.log("Water bot");
	}
	function harvestBot() {
		console.log("Harvest bot");
	}
	function modifySoil() {
		console.log("Modify soil state:", soilState);
	}
	function changeGrid() {
		console.log("Change grid size:", gridX, gridY);
	}
</script>

<div class="flex justify-center align-middle gap-4 h-screen">
	<!-- Developer tools -->
	<div class="flex flex-col justify-start align-middle gap-2 bg-gray-700 rounded-lg p-4 overflow-y-auto" style="scrollbar-width: thin">
		<p class="font-bold text-lg">DEVELOPER TOOLS</p>

		<DevTools />

		<div class="flex flex-col justify-center align-middle bg-gray-800 p-2 rounded-lg gap-2 hidden">
			<p class="font-bold">Robot movement</p>
			<div class="flex gap-2">
				<input type="number" min="0" placeholder="x" bind:value={moveX} class="bg-gray-700 rounded-lg p-1 outline-0" />
				<input type="number" min="0" placeholder="y" bind:value={moveY} class="bg-gray-700 rounded-lg p-1 outline-0" />
				<button class="grow p-1 rounded-lg border-gray-600 border-2 cursor-pointer" onclick={moveRobot}>Move</button>
			</div>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600" onclick={plantBot}>Plant</button>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600" onclick={waterBot}>Water</button>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600" onclick={harvestBot}>Harvest</button>
		</div>

		<!-- Tiles action -->
		<div class="flex flex-col justify-center align-middle bg-gray-800 p-2 rounded-lg gap-2 hidden">
			<p class="font-bold">Tiles action</p>
			<p>Click the tile you want to modify</p>
			<div class="flex gap-3">
				<select bind:value={soilState}>
					<option value="initial">Initial</option>
					<option value="prepared">Prepared</option>
					<option value="watered">Watered</option>
				</select>
				<button class="grow p-1 rounded-lg border-gray-600 border-2 cursor-pointer" onclick={modifySoil}>Modify soil state</button>
			</div>
			<div class="flex gap-2">
				<input type="number" min="0" placeholder="x" bind:value={gridX} class="bg-gray-700 rounded-lg p-1 outline-0" />
				<input type="number" min="0" placeholder="y" bind:value={gridY} class="bg-gray-700 rounded-lg p-1 outline-0" />
				<button class="grow p-1 rounded-lg border-gray-600 border-2 cursor-pointer" onclick={changeGrid}>Change grid size</button>
			</div>
		</div>

		<!-- Events -->
		<div class="flex flex-col justify-center align-middle bg-gray-800 p-2 rounded-lg gap-2 hidden">
			<p class="font-bold">Events</p>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600">Spawn pest</button>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600">Spawn fire</button>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600">Spawn flood</button>
			<button class="p-1 rounded-lg cursor-pointer border-2 border-gray-600">Spawn drought</button>
		</div>
	</div>

	<!-- Editors -->
	<div class="w-1/2 h-full flex flex-col gap-4 hidden">
		<div id="editor" class="h-1/2 rounded-lg border-2 border-emerald-500 bg-slate-900"></div>
		<div id="blockly" class="h-1/2 rounded-lg border-2 border-orange-500 bg-slate-800"></div>
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
