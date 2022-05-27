<template>
  <div class="multiselect-accessible">
    <button
      class="multiselect-button"
      ref="multiselectButton"
      :aria-label="ariaLabel + formatMultiSelectStatus()"
      @click.stop.prevent="showHideMultiSelectPanel"
    >
      <span class="multiselect-label">
        <template v-if="display === 'default'">
          {{ labelOptions }}
        </template>
        <template v-else-if="display === 'chip'">
          <template v-if="selectedOptions.length">
            <Chip
              v-for="(option, key) in selectedOptions"
              removable
              :label="getOptionLabel(option)"
              :key="key"
              @remove.stop.prevent="removeOption(option)"
            />
          </template>
          <template v-else>
            {{ placeholder }}
          </template>
        </template>
      </span>
      <i class="pi pi-chevron-down" />
    </button>

    <div
      v-show="showMultiSelectPanel"
      class="multiselect-panel"
      @keyup.esc="closeMultiSelectPanel"
    >
      <div class="multiselect-panel-header">
        <Checkbox
          v-model="checkedAllOptions"
          :aria-label="`Checkbox. Select All Options ${formatCheckboxStatus()}`"
          :binary="true"
          :disabled="!availableOptions.length"
          @click.stop.prevent="selectAllOptions"
          @keyup.enter.stop.prevent="selectAllOptions"
        />
        <div v-if="filter" class="multiselect-panel-filter">
          <span class="p-input-icon-right">
            <InputText
              aria-label="MultiSelect Filter"
              :disabled="!availableOptions.length"
              :placeholder="placeholderFilter"
              v-model="filterValue"
              @input="onFilterChange"
            />
            <i class="pi pi-search" />
          </span>
        </div>
        <button
          aria-label="Close multiselect panel and clear filter input."
          class="pi pi-times"
          v-tooltip.top="'Close multiselect panel and clear filter input.'"
          @click="closeMultiSelectPanel"
        />
      </div>
      <ul class="multiselect-panel-items" :id="'multiselect-panel' + panelId">
        <li
          v-for="(option, idx) in filteredOptions"
          class="multiselect-panel-item"
          tabindex="0"
          :aria-label="formatItemAriaLabel(option, optionAriaLabel)"
          :class="option.checked ? 'item-checked' : ''"
          :key="idx"
          @click.stop.prevent="selectOption(option)"
          @keyup.enter.stop.prevent="selectOption(option)"
        >
          <Checkbox
            v-model="option.checked"
            tabindex="-1"
            :binary="true"
            @click.stop.prevent="selectOption(option)"
          />
          <span>
            {{ getOptionLabel(option) }}
          </span>
        </li>
        <span v-show="emptyMessage" class="empty-message" tabindex="0">
          No results found
        </span>
        <span
          v-if="!availableOptions.length"
          class="empty-message"
          tabindex="0"
        >
          No available options
        </span>
      </ul>
    </div>
  </div>
</template>

<script>
import { ObjectUtils } from 'primevue/utils';

export default {
  name: "MultiSelectAccessible",
  emits: [
    "update:modelValue"
  ],
  props: {
    ariaLabel: {
      type: String,
      default: 'MultiSelect'
    },
    display: {
      type: String,
      default: 'default'
    },
    filter: {
      type: Boolean,
      default: false
    },
    modelValue: {
      type: Array,
      default: new Array()
    },
    options: {
      type: Array,
      default: new Array()
    },
    optionAriaLabel: {
      type: String,
      default: ''
    },
    optionLabel: {
      type: String,
      default: ''
    },
    panelId: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: "Select options"
    },
    placeholderFilter: {
      type: String,
      default: "Search by text"
    }
  },
  data() {
    return {
      availableOptions: [],
      checkedAllOptions: false,
      emptyMessage: false,
      filteredOptions: [],
      filterValue: '',
      selectedOptions: [],
      showMultiSelectPanel: false,
      statusMultiSelect: false
    }
  },
  created() {
    this.prepareOptions();
  },
  computed: {
    labelOptions() {
      return this.selectedOptions.length ? this.getLabelByValue(this.selectedOptions) : this.placeholder
    }
  },
  watch: {
    filteredOptions: {
      handler() {
        let count = 0;
        if (this.filteredOptions.length) {
          this.filteredOptions.forEach(option => {
            option.checked ? count += 1 : this.checkedAllOptions = false;
          });
          this.checkedAllOptions = this.filteredOptions.length === count ? true : false;
        }
      },
      deep: true
    }
  },
  methods: {
    getOptionLabel(option) {
      return this.optionLabel ? ObjectUtils.resolveFieldData(option, this.optionLabel) : option;
    },
    getLabelByValue(value) {
      let options = [];
      if (value.length) {
        for (let optionValue of value) {
          options.push(this.getOptionLabel(optionValue));
        }
      }
      return options.join(", ");
    },
    showHideMultiSelectPanel() {
      this.clearFilter();
      this.filteredOptions = [...this.availableOptions];
      this.statusMultiSelect = !this.statusMultiSelect;
      this.showMultiSelectPanel = !this.showMultiSelectPanel;
    },
    close() {
      this.clearFilter();
      this.showMultiSelectPanel = false;
    },
    closeMultiSelectPanel() {
      this.clearFilter();
      this.$refs.multiselectButton.focus();
      this.showMultiSelectPanel = false;
    },
    prepareOptions() {
      let options = [...this.options];
      options.forEach(option => {
        option.checked = false;
      });

      this.availableOptions = [...options];
      this.filteredOptions = [...options];
    },
    selectOption(option) {
      if (!option.checked) {
        this.availableOptions.forEach(availableOption => {
          if (this.isEquals(availableOption, option)) {
            availableOption.checked = true;
            option.checked = true;
          }
        });
        this.selectedOptions.push({ ...option });
      } else if (option.checked) {
        this.removeOption(option);
      }

      this.$emit('update:modelValue', this.selectedOptions);
    },
    selectAllOptions() {
      if (!this.checkedAllOptions) {
        this.selectedOptions = [];
        this.checkedAllOptions = true;
        this.filteredOptions.forEach(option => {
          option.checked = true;
          this.selectedOptions.push(option);
        });
      } else if (this.checkedAllOptions) {
        this.checkedAllOptions = false;
        this.filteredOptions.forEach(option => {
          option.checked = false;
        });
        this.selectedOptions = [];
      }

      this.$emit('update:modelValue', this.selectedOptions);
    },
    removeOption(option) {
      this.availableOptions.forEach(content => {
        if (this.isEquals(content, option)) {
          content.checked = false;
        }
      });
      let index = this.selectedOptions.findIndex(value => {
        return this.getOptionLabel(value) === this.getOptionLabel(option);
      });
      this.selectedOptions.splice(index, 1);
      this.$emit('update:modelValue', this.selectedOptions);
    },
    isEquals(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    },
    onFilterChange() {
      if (!this.filterValue.trim().length) {
        this.filteredOptions = [...this.availableOptions];
      } else {
        this.filteredOptions = this.availableOptions.filter(option => {
          let value = this.getOptionLabel(option);
          return value.toLowerCase().includes(this.filterValue.toLowerCase());
        });
        this.emptyMessage = !this.filteredOptions.length ? true : false;
      }
    },
    clearFilter() {
      this.filterValue = '';
      this.emptyMessage = false;
    },
    formatMultiSelectStatus() {
      return this.statusMultiSelect ? ` open ${this.formatSelectedOptionsStatus()}.` : ` closed ${this.formatSelectedOptionsStatus()}.`;
    },
    formatSelectedOptionsStatus() {
      if (this.selectedOptions.length) {
        return 'Selected options ' + this.getLabelByValue(this.selectedOptions) + '.';
      } else {
        return ' No option selected.';
      }
    },
    formatCheckboxStatus() {
      return this.checkedAllOptions ? 'checked' : 'not checked';
    },
    formatItemAriaLabel(option, optionType) {
      if (option.checked) {
        return `${optionType} option: ${this.getOptionLabel(option)}, selected option, option `
      } else {
        return `${optionType} option: ${this.getOptionLabel(option)}, option `
      }
    }
  }
};
</script>