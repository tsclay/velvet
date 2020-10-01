<script>
  export let toggleModal;
  export let width;
  export let toggleNavButtons;
  export let navIsSticky;
  export let stickyNav;

  const scrollToTarget = (e) => {
    const target = document.querySelector(
      `#${e.target.innerText.toLowerCase()}`
    ).offsetTop;
    window.scrollTo({
      left: 0,
      top: target - 100,
      behavior: "smooth",
    });
  };
</script>

<style>
  #velvet-nav-bar {
    /* position: relative; */
    position: sticky;
    position: -webkit-sticky;
    z-index: 99;
    top: 0;
    height: 4rem;
    display: flex;
    flex-flow: row nowrap;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    background: rgb(255, 246, 126);
  }

  #velvet-nav-bar > :first-child {
    margin-left: 0.25rem;
  }
  #velvet-nav-bar > :last-child {
    margin-right: 0.25rem;
  }

  .button-group {
    display: flex;
    align-items: center;
  }

  .button-group > button {
    margin: 0;
    text-transform: uppercase;
  }

  .button-group > button:not(:last-of-type) {
    margin-right: 0.25rem;
  }

  .sm-modal {
    position: absolute;
    z-index: 2;
    right: 0.5rem;
    top: 0;
    background: gray;
    border-radius: 4px;
    display: flex;
    flex-flow: column nowrap;
    justify-content: start;
  }

  .sm-modal button {
    margin-bottom: 0;
  }

  #nav-modal-toggler {
    margin: 0;
    margin-right: 0.25rem;
    width: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .burger-bars {
    fill: white;
  }
</style>

<div id="velvet-nav-bar" style={navIsSticky ? stickyNav : null}>
  <h1>Some Logo</h1>

  {#if width > 600}
    <div class="button-group">
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>Home</button>
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>About</button>
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>Gallery</button>
      <button
        class="active-flash"
        type="button"
        on:click={scrollToTarget}>Contact</button>
    </div>
  {:else}
    <button on:click|stopPropagation={toggleNavButtons} id="nav-modal-toggler">
      <svg
        xmlns:dc="http://purl.org/dc/elements/1.1/"
        xmlns:cc="http://creativecommons.org/ns#"
        xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
        xmlns:svg="http://www.w3.org/2000/svg"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 135.46666 116.94583"
        version="1.1"
        id="svg8">
        <g id="layer1">
          <g
            id="g842"
            transform="matrix(0.99618808,0,0,0.99997149,-34.076739,-84.989974)">
            <rect
              class="burger-bars"
              ry="15.501632"
              y="86.060791"
              x="35.279579"
              height="31.003263"
              width="134.70384"
              id="rect833"
              style="fill-opacity:1;" />
            <rect
              class="burger-bars"
              style="fill-opacity:1;"
              id="rect835"
              width="134.70384"
              height="31.003263"
              x="35.279579"
              y="128.39412"
              ry="15.501632" />
            <rect
              class="burger-bars"
              ry="15.501632"
              y="170.72749"
              x="35.279579"
              height="31.003263"
              width="134.70384"
              id="rect837"
              style="fill-opacity:1;" />
          </g>
        </g>
      </svg>
    </button>
    {#if toggleModal}
      <div class="sm-modal">
        <button
          class="active-flash"
          type="button"
          on:click={scrollToTarget}>Home</button>
        <button
          class="active-flash"
          type="button"
          on:click={scrollToTarget}>About</button>
        <button
          class="active-flash"
          type="button"
          on:click={scrollToTarget}>Gallery</button>
        <button
          class="active-flash"
          type="button"
          on:click={scrollToTarget}>Contact</button>
      </div>
    {/if}
  {/if}
</div>
