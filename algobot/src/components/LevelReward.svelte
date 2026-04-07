<script>
  import { ModalTypes, RewardTypes } from "../game/global/enum.js";
  import { LEVEL_REWARDS_DATA, PLAYER_DATA, INVENTORY } from "../game/global/global.js";

  import { Personalize, Modals, CLAIMED_REWARDS } from "./global.svelte.js";

  const MAX_LEVEL = 30;

  function claimReward(level) {
    if (CLAIMED_REWARDS[level]) return;
    CLAIMED_REWARDS[level] = true;
    const { type, item = null, amount } = LEVEL_REWARDS_DATA[level] ?? LEVEL_REWARDS_DATA.DEFAULT;
    console.log(type, amount, item);
    if (type === RewardTypes.COIN) INVENTORY.changeCoins(amount);
    else if (type === RewardTypes.CROPS) INVENTORY.changeCrops(item, amount);
  }
</script>

{#if Modals[ModalTypes.LEVEL_REWARDS]}
  <div class="z-50 fixed inset-0 backdrop-blur-sm flex justify-center items-center">
    <div class="enter-anim relative w-[33vw] h-fit bg-[#ab7440] text-sm rounded-lg border-3 border-[#5f4124] outline-3 outline-[#ffd6af] select-none shadow-lg">
      <button onclick={() => (Modals[ModalTypes.LEVEL_REWARDS] = false)} class="absolute right-2 top-0 font-bold text-base">(X)</button>
      <div class="p-4 w-full h-full border-b-3 border-[#815831]">
        <h1 class="text-base font-bold text-center">Level Rewards</h1>
        <p class="text-xs font-bold text-center">Yo fuckening rewards, boi!</p>

        <div class="overflow-y-auto h-[50vh] scroll-smooth flex flex-col gap-2 p-4">
          {#each Array(MAX_LEVEL) as _, i}
            {@const level = i + 1}
            {@const is_default = LEVEL_REWARDS_DATA[level] == undefined}
            {@const is_unlocked = PLAYER_DATA.level >= level}
            {@const is_claimed = CLAIMED_REWARDS[level]}
            <button onclick={() => claimReward(level)} class:claim-anim={is_claimed} class:claimed={is_claimed} class:unlocked={is_unlocked} disabled={!is_unlocked} class:locked={!is_unlocked} class:outline-3={!is_default} class="flex gap-2 items-center justify-evenly p-1 border-b-4 border-[#815831] bg-[#c5864b] rounded-lg outline-[#ffd6af] relative">
              <p class="font-bold">Level {level}</p>
              <img class="w-10 h-10 object-contain border-t-3 p-1 border-[#5f4124] bg-[#ab7440] rounded-lg" src={is_default ? "/sprites/icon_coin.png" : "/sprites/icon_" + LEVEL_REWARDS_DATA[level].item + ".png"} alt="Reward" />
              <p class="text-lg font-bold">x{is_default ? LEVEL_REWARDS_DATA.DEFAULT.amount : LEVEL_REWARDS_DATA[level].amount}</p>
              {#if is_unlocked && !is_claimed}
                <img class="absolute top-[-10px] right-[-4px]" src="/sprites/icon_alert.png" alt="Claim" />
              {/if}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .claimed {
    filter: grayscale();
    opacity: 0.7;
    outline: none;
  }
  .unlocked {
    cursor: pointer;
  }
  .locked {
    cursor: not-allowed;
    opacity: 0.5;
  }
  @keyframes claim {
    0% {
      transform: scale(1, 1);
    }
    50% {
      transform: scale(1.1, 1.1);
    }
    100% {
      transform: scale(1, 1);
    }
  }
  @keyframes scaleup {
    0% {
      transform: scale(0, 0);
    }
    100% {
      transform: scale(1, 1);
    }
  }
  .claim-anim {
    animation: claim 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  .enter-anim {
    animation: scaleup 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
</style>
