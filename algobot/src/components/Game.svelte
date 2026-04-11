<script>
  import Inventory from "./Inventory.svelte";
  import TextBased from "./TextBased.svelte";
  import BlockBased from "./BlockBased.svelte";
  import Document from "./Document.svelte";
  import Shop from "./Shop.svelte";
  import Quest from "./Quest.svelte";
  import PlayerInfo from "./PlayerInfo.svelte";
  import LevelReward from "./LevelReward.svelte";
  import ResearchTree from "./ResearchTree.svelte";
  import FarmPersonalize from "./FarmPersonalize.svelte";
  import { ModalTypes } from "../game/global/enum.js";
  import { Modals } from "./global.svelte";

  let Editors = { BLOCK: 0, TEXT: 1 };
  let Menus = { NONE: -1, COMMAND: 0, DOCUMENT: 1, QUEST: 2, SHOP: 3, RESEARCH: 4};

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
  <ResearchTree />

  <div class="flex gap-2 top-4 left-4 fixed">
    <div class="flex flex-col gap-4 items-start">
      <PlayerInfo />
      <Inventory />
    </div>
    <div class="pt-2">
      <!-- Skill Tree -->
      <button class="cursor-pointer" onclick={() => toggleMenu(Menus.COMMAND)}>
        <img class="hover:scale-110 transition-transform w-12 h-12" src="/sprites/icon_command.png" alt="skilltree" />
      </button>
      <!-- Command -->
      <button class="cursor-pointer" onclick={() => toggleMenu(Menus.DOCUMENT)}>
        <img class="hover:scale-110 transition-transform w-12 h-12" src="/sprites/icon_document.png" alt="skilltree" />
      </button>
      <!-- Document -->
      <button class="cursor-pointer" onclick={() => toggleMenu(Menus.QUEST)}>
        <img class="hover:scale-110 transition-transform w-12 h-12" src="/sprites/icon_quest.png" alt="skilltree" />
      </button>
      <!-- Quest -->
      <button class="cursor-pointer" onclick={() => (Modals[ModalTypes.RESEARCH_TREE] = true)}>
        <img class="hover:scale-110 transition-transform w-12 h-12" src="/sprites/icon_skilltree.png" alt="skilltree" />
      </button>
      <!-- Shop -->
      <button class="cursor-pointer" onclick={() => toggleMenu(Menus.SHOP)}>
        <img class="hover:scale-110 transition-transform w-12 h-12" src="/sprites/icon_shop.png" alt="skilltree" />
      </button>
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
  </div>
</div>

<style>
  button {
    border-radius: 0.2rem;
    padding: 0.2rem;
  }
</style>
