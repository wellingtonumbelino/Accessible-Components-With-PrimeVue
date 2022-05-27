<template>
  <div class="home">
    <h1>Home</h1>
    <ul>
      <li>
        <a href="/" @keyup.tab="closeMultiSelect">Home</a>
      </li>
    </ul>
    <MultiSelectAccessible
      ariaLabel="MultiSelect Accessible"
      panelId="accessible"
      placeholderFilter="Search Option"
      optionAriaLabel="Country"
      optionLabel="name"
      ref="multiSelectAccessible"
      v-model="selectedCountries"
      :filter="true"
      :options="countries"
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
      teste: [],
      selectedCountries: []
    };
  },
  methods: {
    closeMultiSelect() {
      this.$refs.multiSelectAccessible.closeMultiSelectPanel();
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