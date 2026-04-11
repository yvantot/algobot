<script>
  import { DOCUMENT_DATA as data, TYPE_COLORS } from "../game/global/global.js";

  let current_menu = $state("syntax");
  let unlocked_count = $derived(
    Object.values(data[current_menu]).filter(item => item.is_unlocked).length
  );

  function toggleMenu(name) {
    current_menu = name;
  }
</script>

<div class="flex flex-col gap-2 h-[95vh] max-w-[30vw] bg-gray-100 text-sm p-3 rounded-xl shadow-xl overflow-hidden text-slate-700 border-4 border-slate-500">
  <div>
    <h1 class="font-bold text-base text-center">Documentation</h1>
    <p class="text-xs text-center px-2">A handbook that provide all the concepts that you need</p>
  </div>
  <div class="flex flex-col gap-2 overflow-hidden text-xs">
    <div class="flex flex-wrap gap-1 justify-center">
      {#each Object.keys(data) as name}
        <button class="rounded-lg p-1 px-2 bg-gray-300 font-semibold" class:bg-green-300={current_menu === name} onclick={() => toggleMenu(name)}>{name}</button>
      {/each}
    </div>
    <div class="flex flex-col gap-2 flex-grow overflow-y-scroll h-[85vh]">
      {#each Object.keys(data[current_menu]) as name}
        {@const val = data[current_menu][name]}
        <div class="flex flex-col border-2 border-slate-400 rounded-lg p-2 gap-2">
          <div class="flex gap-2 items-center justify-between">
            <p class="font-bold" style="font-family: 'Courier Prime'">{name}</p>
            <p class="font-bold p-1 px-2 text-xs bg-[#262b36] rounded scale-90" style={"color:" + TYPE_COLORS[data[current_menu][name].type]}>{data[current_menu][name].type}</p>
          </div>
          {#if current_menu === "crops"}
          <img class="w-10 h-10 object-contain" src={val.icon} alt="RAR"/>
          {/if}
          <p>{data[current_menu][name].definition}</p>
          <pre class="overflow-x-auto code p-2 bg-gray-200 rounded-lg">{data[current_menu][name].example}</pre>
          {#if data[current_menu][name]?.note != null}
            <div class="bg-green-200 p-2 rounded-lg border-2 border-green-400">
              <p class="text-green-800 font-bold">Remember!</p>
              <p>{data[current_menu][name]?.note}</p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  </div>
</div>
