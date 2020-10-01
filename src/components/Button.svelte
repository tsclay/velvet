<script>
  import { createEventDispatcher } from "svelte";
  export let type, disabled, outlined, style;
  export let status;

  const dispatch = createEventDispatcher();
</script>

<style>
  .primary {
    background: var(--linkBlue);
  }
  .danger {
    background: var(--accentOrange);
  }
</style>

<button
  {style}
  {type}
  on:click={(e) => dispatch('buttonClicked', { forwardedEvent: e })}
  {disabled}
  class={status}
  class:outlined>
  <slot />
</button>
