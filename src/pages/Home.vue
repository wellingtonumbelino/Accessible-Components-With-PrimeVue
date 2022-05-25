<template>
  <div class="home">
    <h1>Home</h1>
    <ul>
      <li>
        <a href="/" @keyup.tab="closeMultiselect">Home</a>
      </li>
    </ul>
    <MultiSelectAccessible
      display="chip"
      ref="multiselectAccessible"
      v-model="selectedCountries"
      ariaLabel="MultiSelect Accessible"
      :filter="true"
      :options="countries"
      panelId="accessible"
      optionLabel="name"
    />
    <div class="container">
      {{ selectedCountries }}
    </div>
  </div>
</template>

<script>
import countries from "../data/countries";

export default {
  name: "Home",
  data() {
    return {
      countries: countries,
      selectedCountries: []
    };
  },
  methods: {
    closeMultiselect() {
      this.$refs.multiselectAccessible.closeMultiSelectPanel();
    }
  },
};
</script>

<style>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>