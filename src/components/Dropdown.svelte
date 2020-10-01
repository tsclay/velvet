<script>
  export let options, defaultOption;
  let showOptions = false;

  const handleSelection = (e) => {
    selected = e.target.innerText;
    showOptions = false;
  };

  export let selected = defaultOption || options[0];
</script>

<style>
  .velvet-dropdown {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 1rem 0;
  }

  .sel-options {
    position: relative;
    z-index: 4;
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    background: rgb(207, 207, 207);
  }
  .sel-text {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 300px;
    height: 100%;
    padding: 4px;
    border-radius: 4px;
  }
  .sel-text > button {
    border: none;
    padding: 0.25rem 0;
    cursor: pointer;
    margin: 0;
    width: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    margin-right: 1rem;
  }

  .sel-text > span {
    overflow: hidden;
    white-space: nowrap;
  }

  .dropdown-menu {
    position: absolute;
    box-sizing: border-box;
    width: 100%;
    bottom: 0;
    transform: translateY(100%);
    left: 0;
    border-radius: 0 0 4px 4px;
    background: rgb(255, 250, 241);
    max-height: 210px;
    overflow-y: auto;
    height: 210px;
    transition: height 0.2s linear;
  }

  .dropdown-menu:empty {
    height: 0;
  }

  .dropdown-menu > div {
    padding: 4px;
    cursor: pointer;
  }

  .dropdown-menu > div:after {
    content: "";
    width: 0;
    display: block;
    padding: 4px 0;
    margin: 0 auto;
    border-bottom: 1px solid gray;
    transition: width 0.2s linear;
  }

  .dropdown-menu > div:hover::after {
    content: "";
    width: 90%;
    display: block;
    margin: 0 auto;
    border-bottom: 1px solid gray;
    transition: width 0.2s linear;
  }

  .arrow-icon {
    fill: black;
    stroke: #000000;
    stroke-width: 0.5;
    stroke-opacity: 1;
  }
  .rest {
    transition: transform 0.1s linear;
    transform-origin: center;
  }

  .active {
    transition: transform 0.1s linear;
    transform-origin: center;
    transform: rotate(90deg);
  }
</style>

<div class="velvet-dropdown">
  <div class="sel-options">
    <div
      class="sel-text"
      on:click|stopPropagation={(e) => {
        showOptions = !showOptions;
      }}>
      <button type="button" class="svg-wrapper">
        <svg
          xmlns:svg="http://www.w3.org/2000/svg"
          xmlns="http://www.w3.org/2000/svg"
          width="100"
          height="15"
          viewBox="0 0 158.75 158.75"
          version="1.1">
          <g>
            <path
              d="M 155.46289,78.494058 42.636336,144.00382 42.636333,13.648303 Z"
              class="arrow-icon {showOptions ? 'active' : 'rest'}" />
          </g>
        </svg>
      </button>
      <span>{selected}</span>
    </div>

    <div class="dropdown-menu">
      {#if showOptions}
        {#each options as option, i}
          <div value={option.toLowerCase()} on:click={handleSelection}>
            {option}
          </div>
        {/each}
      {/if}
    </div>
  </div>
</div>
