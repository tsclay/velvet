<script>
  import HeroGrid from "./components/HeroGrid.svelte";
  import Dropdown from "./components/Dropdown.svelte";
  import NavBar from "./components/NavBar.svelte";

  import { windowWidth, needModal } from "./stores.js";

  export let toggleModal;
  export let width;

  let testValue, anotherTest;
  console.log(testValue, "before");
  const options = [
    "Email",
    "Phone",
    "Boats",
    "Supercalifragiliciousexpealidocious",
    "What is your most favorite pet ever on Earth?",
  ];
  const defaultOption = options[2];

  const unsubscribeWidth = windowWidth.subscribe((value) => (width = value));
  const unsubscribeModal = needModal.subscribe((value) => {
    toggleModal = value;
  });

  const toggleNavButtons = () => {
    needModal.set(!toggleModal);
  };
</script>

<svelte:body
  on:click={(e) => {
    if (e.target.id !== 'modal-toggler') {
      needModal.set(false);
    }
  }} />

<svelte:window
  on:resize={() => {
    windowWidth.set(window.innerWidth);
  }} />

<!-- <HeroGrid centerMid upperRight imgSrc={'../path60.png'}>
  <div slot="center-mid">
    <p>HEY THERE YO</p>
  </div>
  <div slot="upper-right" style="align-self: center">
    <p>HEY THERE YO</p>
  </div>
</HeroGrid> -->

<NavBar {width}/>
<Dropdown bind:selected={testValue} {options} {defaultOption} />
<span>{testValue}</span>

<Dropdown
  bind:selected={anotherTest}
  options={['Blue', 'Red', 'Green', 'Yellow', 'White', 'Black', 'Hat', 'A', 'Bat']}
  defaultOption="Red" />
<span>{anotherTest}</span>
