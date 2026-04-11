<script>
  import { PLAYER_DATA } from "../game/global/global.js";
  const SHOP_DATA = {
    tomato: 0,
  }
</script>

<div class="z-50 fixed inset-0 backdrop-blur-sm flex justify-center items-center">
  <div class="enter-anim relative w-[33vw] h-fit bg-[#ab7440] text-sm rounded-lg border-3 border-[#5f4124] outline-3 outline-[#ffd6af] select-none shadow-lg">
      <div>
      </div>
  </div>
  
</div>

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
    animation: scaleup 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
