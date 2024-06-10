import Vue from 'vue';
import App from './App.vue';
import axios from 'axios';

Vue.config.productionTip = false;

axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? process.env.RENDER_DEPLOY_HOOK_URL : 'http://localhost:5000';

new Vue({
  render: h => h(App),
}).$mount('#app');
