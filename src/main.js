import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import MultiSelectAccessible from './components/utils/MultiSelectAccessible';
import Checkbox from 'primevue/checkbox';
import InputText from 'primevue/inputtext';
import Chip from './components/utils/Chip.vue';

import "primevue/resources/themes/saga-blue/theme.css";
import "primevue/resources/primevue.min.css";
import "primeicons/primeicons.css";
import "./assets/sass/layout.scss";

const app = createApp(App);

app.use(PrimeVue);

app.component('MultiSelectAccessible', MultiSelectAccessible);
app.component('Checkbox', Checkbox);
app.component('InputText', InputText);
app.component('Chip', Chip);

app.mount('#app');