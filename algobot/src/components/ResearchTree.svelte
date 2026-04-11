<script>
	import { ModalTypes } from "../game/global/enum.js";
	import { PLAYER_DATA } from "../game/global/global.js";
  	import { Modals } from "./global.svelte.js";	

  	const RESEARCH_DATA = {
  		crops: {

  		},
  		syntax: {

  		},
  		bot: {
  			
  		}
  	}
</script>

{#if Modals[ModalTypes.RESEARCH_TREE] === true}
<div class="z-50 fixed inset-0 backdrop-blur-sm flex justify-center items-center">
	<div class="enter-anim relative w-[33vw] h-fit bg-[#ab7440] text-sm rounded-lg border-3 border-[#5f4124] outline-3 outline-[#ffd6af] select-none shadow-lg">
		<button onclick={() => (Modals[ModalTypes.RESEARCH_TREE] = false)} class="absolute right-2 top-0 font-bold text-base">(X)</button>
	</div>	
</div>
{/if}

<style>	
  @keyframes scaleup {
    0% {
      transform: scale(0, 0);
    }
    100% {
      transform: scale(1, 1);
    }
  }

  .enter-anim {
    animation:
      scaleup 0.5s cubic-bezier(0.34, 1.56, 0.64, 1),
      subtle-rotate 0.3s ease-in-out infinite alternate;
  }
	
</style>
