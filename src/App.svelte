<script>
  import HeroGrid from "./components/HeroGrid.svelte";
  import Dropdown from "./components/Dropdown.svelte";

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
</script>

<!-- <HeroGrid centerMid upperRight imgSrc={'../path60.png'}>
  <div slot="center-mid">
    <p>HEY THERE YO</p>
  </div>
  <div slot="upper-right" style="align-self: center">
    <p>HEY THERE YO</p>
  </div>
</HeroGrid> -->
<Dropdown bind:selected={testValue} {options} {defaultOption}/>
<span>{testValue}</span>

<Dropdown
  bind:selected={anotherTest}
  options={['Blue', 'Red', 'Green', 'Yellow', 'White', 'Black', 'Hat', 'A', 'Bat']}
  defaultOption="Red" />
<span>{anotherTest}</span>
