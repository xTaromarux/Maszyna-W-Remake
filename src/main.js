// src/main.ts
import '@/styles/main.scss';
import { createApp } from 'vue';
import App from './App.vue';
import { i18n } from './i18n';

const app = createApp(App);

app.use(i18n);

// Mount the app
app.mount('#app');
