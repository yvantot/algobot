<script>
  import Inventory from "./Inventory.svelte";
  import TextBased from "./TextBased.svelte";
  import BlockBased from "./BlockBased.svelte";
  import Document from "./Document.svelte";
  import Shop from "./Shop.svelte";
  import Quest from "./Quest.svelte";
  import PlayerInfo from "./PlayerInfo.svelte";
  import LevelReward from "./LevelReward.svelte";
  import FarmPersonalize from "./FarmPersonalize.svelte";
  import { ModalTypes } from "../game/global/enum.js";
  import { Modals } from "./global.svelte";

  let Editors = { BLOCK: 0, TEXT: 1 };
  let Menus = { NONE: -1, COMMAND: 0, DOCUMENT: 1, QUEST: 2, SHOP: 3 };

  let current_menu = $state(Menus.COMMAND);
  let current_editor = $state(Editors.TEXT);

  function toggleEditor() {
    current_editor = current_editor === Editors.TEXT ? Editors.BLOCK : Editors.TEXT;
  }

  function toggleMenu(menu) {
    current_menu = current_menu === menu ? Menus.NONE : menu;
  }
</script>

<div class="fixed h-[97vh] top-2 right-2 bottom-2 overflow-hidden rounded-lg">
  <LevelReward />
  <FarmPersonalize />

  <div class="flex gap-2 bg-red-100 top-4 left-4 fixed w-[30vw]">
    <div class="flex flex-col gap-4 items-start">
      <PlayerInfo />
      <Inventory />
    </div>
    <div>
      <img src="/sprites/icon_skilltree.png" alt="skilltree" />
    </div>
  </div>

  <div class="flex gap-2">
    <!-- Command editor panel -->
    <div class={Menus.COMMAND === current_menu ? "relative" : "hidden"}>
      <button class="absolute top-2 left-2 z-10 bg-gray-300 border-2 border-gray-400" onclick={toggleEditor}>
        {#if current_editor === Editors.BLOCK}
          <!-- Show Text icon (switch TO text) -->
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666">
            <path d="M280-160v-520H80v-120h520v120H400v520H280Zm360 0v-320H520v-120h360v120H760v320H640Z" />
          </svg>
        {:else}
          <!-- Show Block icon (switch TO block) -->
          <svg xmlns="http://www.w3.org/2000/svg" height="20px" viewBox="0 -960 960 960" width="20px" fill="#666666">
            <path d="M440-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v720Zm-80-80v-560H200v560h160Zm160-320v-320h240q33 0 56.5 23.5T840-760v240H520Zm80-80h160v-160H600v160Zm-80 480v-320h320v240q0 33-23.5 56.5T760-120H520Zm80-80h160v-160H600v160ZM360-480Zm240-120Zm0 240Z" />
          </svg>
        {/if}
      </button>

      {#if current_editor === Editors.TEXT}
        <TextBased />
      {:else}
        <!-- <BlockBased /> -->
      {/if}
    </div>

    {#if current_menu === Menus.DOCUMENT}
      <Document />
    {:else if current_menu === Menus.QUEST}
      <Quest />
    {:else if current_menu === Menus.SHOP}
      <Shop />
    {/if}

    <!-- Nav buttons -->
    <div class="bg-gray-100 rounded-xl p-3 flex flex-col gap-5 h-fit">
      <button aria-label="Open command menu" class:bg-gray-300={Menus.COMMAND === current_menu} onclick={() => toggleMenu(Menus.COMMAND)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M160-360q-50 0-85-35t-35-85q0-50 35-85t85-35v-80q0-33 23.5-56.5T240-760h120q0-50 35-85t85-35q50 0 85 35t35 85h120q33 0 56.5 23.5T800-680v80q50 0 85 35t35 85q0 50-35 85t-85 35v160q0 33-23.5 56.5T720-120H240q-33 0-56.5-23.5T160-200v-160Zm242.5-97.5Q420-475 420-500t-17.5-42.5Q385-560 360-560t-42.5 17.5Q300-525 300-500t17.5 42.5Q335-440 360-440t42.5-17.5Zm240 0Q660-475 660-500t-17.5-42.5Q625-560 600-560t-42.5 17.5Q540-525 540-500t17.5 42.5Q575-440 600-440t42.5-17.5ZM320-280h320v-80H320v80Zm-80 80h480v-480H240v480Zm240-240Z" /></svg>
      </button>
      <button aria-label="Open documentation menu" class:bg-gray-300={Menus.DOCUMENT === current_menu} onclick={() => toggleMenu(Menus.DOCUMENT)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M270-80q-45 0-77.5-30.5T160-186v-558q0-38 23.5-68t61.5-38l395-78v640l-379 76q-9 2-15 9.5t-6 16.5q0 11 9 18.5t21 7.5h450v-640h80v720H270Zm90-233 200-39v-478l-200 39v478Zm-80 16v-478l-15 3q-11 2-18 9.5t-7 18.5v457q5-2 10.5-3.5T261-293l19-4Zm-40-472v482-482Z" /></svg>
      </button>
      <button aria-label="Open quest menu" class:bg-gray-300={Menus.QUEST === current_menu} onclick={() => toggleMenu(Menus.QUEST)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M480-120 80-600l120-240h560l120 240-400 480Zm-95-520h190l-60-120h-70l-60 120Zm55 347v-267H218l222 267Zm80 0 222-267H520v267Zm144-347h106l-60-120H604l60 120Zm-474 0h106l60-120H250l-60 120Z" /></svg>
      </button>
      <button aria-label="Open shop menu" class:bg-gray-300={Menus.SHOP === current_menu} onclick={() => toggleMenu(Menus.SHOP)}>
        <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#666666"><path d="M841-518v318q0 33-23.5 56.5T761-120H201q-33 0-56.5-23.5T121-200v-318q-23-21-35.5-54t-.5-72l42-136q8-26 28.5-43t47.5-17h556q27 0 47 16.5t29 43.5l42 136q12 39-.5 71T841-518Zm-272-42q27 0 41-18.5t11-41.5l-22-140h-78v148q0 21 14 36.5t34 15.5Zm-180 0q23 0 37.5-15.5T441-612v-148h-78l-22 140q-4 24 10.5 42t37.5 18Zm-178 0q18 0 31.5-13t16.5-33l22-154h-78l-40 134q-6 20 6.5 43t41.5 23Zm540 0q29 0 42-23t6-43l-42-134h-76l22 154q3 20 16.5 33t31.5 13ZM201-200h560v-282q-5 2-6.5 2H751q-27 0-47.5-9T663-518q-18 18-41 28t-49 10q-27 0-50.5-10T481-518q-17 18-39.5 28T393-480q-29 0-52.5-10T299-518q-21 21-41.5 29.5T211-480h-4.5q-2.5 0-5.5-2v282Zm560 0H201h560Z" /></svg>
      </button>
    </div>
  </div>
</div>

<style>
  button:hover {
    background: hsl(0, 0%, 90%);
  }
  button {
    border-radius: 0.2rem;
    padding: 0.2rem;
  }
</style>
