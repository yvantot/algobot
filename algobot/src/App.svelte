<script>
  import DevTools from "./components/DevTools.svelte";
  import Game from "./components/Game.svelte";
  import { onMount } from "svelte";
</script>

<div class="flex justify-center align-middle gap-4 h-screen">
  <Game />
  <!-- <div class="hidden flex flex-col justify-start align-middle gap-2 bg-gray-700 rounded-lg p-4 overflow-y-auto" style="scrollbar-width: thin">
    <DevTools />
  </div> -->
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
