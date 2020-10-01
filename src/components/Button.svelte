<script>
  import { createEventDispatcher } from "svelte";
  export let type, disabled, outlined, style;
  export let primary;
  export let danger;
  export let caution;
  export let secondary;

  const dispatch = createEventDispatcher();
</script>

<button
  {style}
  {type}
  on:click={(e) => dispatch('buttonClicked', { forwardedEvent: e })}
  {disabled}
  class:danger={danger && !caution && !primary && !secondary}
  class:caution={caution && !danger && !primary && !secondary}
  class:primary={primary && !caution && !danger && !secondary}
  class:secondary={secondary && !caution && !primary && !danger}
  class:outlined>
  <slot />
</button>
