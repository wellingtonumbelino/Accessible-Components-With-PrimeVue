<template>
  <div class="multiselect-accessible">
    <button
      class="multiselect-button"
      :aria-label="ariaLabel + formatMultiSelectStatus()"
      :id="'multiselect-button' + panelId"
      @click.stop.prevent="showHideMultiSelectPanel"
    >
      <span class="multiselect-label">
        <template v-if="display === 'default'">
          {{
            selectedOptions.length > 0
              ? getLabelByValue(selectedOptions)
              : placeholder
          }}
        </template>
        <template v-else-if="display === 'chip'">
          <template v-if="selectedOptions.length > 0">
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

      <i v-if="showMultiSelectPanel" class="pi pi-chevron-up" />
      <i v-else-if="!showMultiSelectPanel" class="pi pi-chevron-down" />
    </button>

    <div
      v-if="showMultiSelectPanel"
      class="multiselect-panel"
      @keyup.esc="closeMultiSelectPanel"
    >
      <div class="multiselect-panel-header">
        <Checkbox
          v-model="checkedAllOptions"
          :aria-label="`Checkbox. Select All Options ${formatCheckboxStatus()}`"
          :binary="true"
          @click.stop.prevent="selectAllOptions"
          @keyup.enter.stop.prevent="selectAllOptions"
        />
        <div v-show="filter" class="multiselect-panel-filter">
          <span class="p-input-icon-right">
            <InputText
              aria-label="MultiSelect Filter"
              :placeholder="placeholderFilter"
              v-model="filterValue"
              @input="onFilterChange"
            />
            <i class="pi pi-search" />
          </span>
        </div>
        <button
          aria-label="Close MultiSelect Panel"
          class="pi pi-times"
          @click="closeMultiSelectPanel"
        />
      </div>
      <ul class="multiselect-panel-items" :id="'multiselect-panel' + panelId">
        <li
          v-for="(option, idx) in availableOptions"
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
        <span v-if="emptyMessage" class="empty-message" tabindex="0">
          No results found
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
      required: true,
      default: 'default'
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
      filterValue: '',
      statusMultiSelect: false,
      selectedOptions: [],
      showMultiSelectPanel: false
    }
  },
  created() {
    this.prepareOptions();
  },
  watch: {
    availableOptions: {
      handler() {
        let count = 0;
        this.availableOptions.forEach(option => {
          option.checked ? count += 1 : this.checkedAllOptions = false;
        });
        this.checkedAllOptions = this.availableOptions.length === count ? true : false;
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
      if (value.length > 0) {
        for (let optionValue of value) {
          options.push(this.findOptionByValue(optionValue));
        }
      }
      return options.join(", ");
    },
    findOptionByValue(value) {
      return this.optionLabel ? ObjectUtils.resolveFieldData(value, this.optionLabel) : value;
    },
    showHideMultiSelectPanel() {
      this.statusMultiSelect = !this.statusMultiSelect;
      this.showMultiSelectPanel = !this.showMultiSelectPanel;
    },
    closeMultiSelectPanel() {
      this.showMultiSelectPanel = false;
    },
    prepareOptions() {
      let options = [];
      this.options.forEach(option => {
        options.push({
          id: option.id,
          name: option.name,
          checked: false
        });
      });

      this.availableOptions = [...options];
    },
    selectOption(option) {
      if (!option.checked) {
        this.availableOptions.forEach(availableOption => {
          if (this.isEquals(availableOption, option)) {
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
        this.availableOptions.forEach(option => {
          this.selectedOptions.push(option);
          option.checked = true;
        });
      } else if (this.checkedAllOptions) {
        this.checkedAllOptions = false;
        this.availableOptions.forEach(option => {
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
        let a = Object.values(value);
        let b = Object.values(option)
        return a[0] === b[0];
      });
      this.selectedOptions.splice(index, 1);
      this.$emit('update:modelValue', this.selectedOptions);
    },
    isEquals(a, b) {
      return JSON.stringify(a) === JSON.stringify(b);
    },
    onFilterChange(event) {
      this.emptyMessage = false;
      let span = null;
      let textValue = '';
      let ul = document.getElementById("multiselect-panel" + this.panelId);
      let li = ul.getElementsByTagName("li");
      let count = 0;

      for (let i = 0; i < li.length; i++) {
        span = li[i].getElementsByTagName("span")[1];
        textValue = span.outerText || span.innerText;
        if (textValue.toLowerCase().indexOf(event.target.value.toLowerCase()) > -1) {
          li[i].style.display = "";
        } else {
          li[i].style.display = "none";
          count += 1;
        }
      }
      if (li.length === count) {
        this.emptyMessage = true;
      }
    },
    formatMultiSelectStatus() {
      return this.statusMultiSelect ? ` Open ${this.formatSelectedOptionsStatus()}` : ` Closed ${this.formatSelectedOptionsStatus()}`;
    },
    formatSelectedOptionsStatus() {
      if (this.selectedOptions.length > 0) {
        return 'Selected options ' + this.getLabelByValue(this.selectedOptions);
      } else {
        return ' No option selected';
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