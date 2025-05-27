import 'virtual:svg-icons-register';

import { createApp } from 'vue';
import { createPinia } from "pinia";

import App from './views/index/index.vue';

const pinia = createPinia();

window.startTime = new Date().getTime();
const app = createApp(App);

app.use(pinia)
app.mount('#app');

