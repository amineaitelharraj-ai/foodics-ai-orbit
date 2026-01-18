import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './index.css';

const app = createApp(App);

app.config.errorHandler = (err, _vm, info) => {
  console.error('Vue Error:', err, 'Info:', info);
};

router.onError((err) => {
  console.error('Router Error:', err);
});

app.use(createPinia());
app.use(router);

app.mount('#app');
