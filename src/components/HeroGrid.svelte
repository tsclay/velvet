<script>
  export let imgSrc, imgAlt;
  export let upperLeft,
    upperMid,
    upperRight,
    centerLeft,
    centerMid,
    centerRight,
    lowerLeft,
    lowerMid,
    lowerRight;
  export let gridOverride;
</script>

<style>
  img {
    width: 100%;
    height: auto;
  }

  .wrapper {
    position: relative;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    grid-template-rows: repeat(3, 1fr);
    grid-template-areas:
      "upper-left upper-mid upper-right"
      "center-left center-mid center-right"
      "lower-left lower-mid lower-right";
    width: 100%;
  }

  .wrapper > div {
    align-self: center;
    justify-self: center;
    width: 100%;
    height: 100%;
    display: grid;
  }

  .wrapper > img {
    grid-area: 1/1/4/4;
  }
</style>

<div class="wrapper" style={gridOverride}>
  {#if imgSrc}<img src={imgSrc} alt={imgAlt} />{/if}
  {#if upperLeft}
    <div style="grid-area: upper-left">
      <slot name="upper-left" />
    </div>
  {/if}
  {#if upperMid}
    <div style="grid-area: upper-mid">
      <slot name="upper-mid" />
    </div>
  {/if}
  {#if upperRight}
    <div id="hero-grid-upperRight" style="grid-area: upper-right;">
      <slot name="upper-right" />
    </div>
  {/if}
  {#if centerLeft}
    <div style="grid-area: center-left">
      <slot name="center-left" />
    </div>
  {/if}
  {#if centerMid}
    <div style="grid-area: center-mid">
      <slot name="center-mid" />
    </div>
  {/if}
  {#if centerRight}
    <div style="grid-area: center-right">
      <slot name="center-right" />
    </div>
  {/if}
  {#if lowerLeft}
    <div style="grid-area: lower-left">
      <slot name="lower-left" />
    </div>
  {/if}
  {#if lowerMid}
    <div style="grid-area: lower-mid">
      <slot name="lower-mid" />
    </div>
  {/if}
  {#if lowerRight}
    <div style="grid-area: lower-right">
      <slot name="lower-right" />
    </div>
  {/if}
</div>
