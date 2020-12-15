import Vue from 'vue'
import App from './App.vue'
import router from './router'
import BootstrapVue from "bootstrap-vue";
import VueRx from 'vue-rx'
import Vuebar from 'vuebar';
import "bootstrap/dist/css/bootstrap.min.css"
import "bootstrap-vue/dist/bootstrap-vue.css"
import { longClickDirective } from 'vue-long-click'
import store from './store/store'
import Progress from 'vue-multiple-progress'
import VueRecord from '@codekraft-studio/vue-record'

 
const longClickInstance = longClickDirective({delay: 400, interval: 50})
Vue.directive('longclick', longClickInstance)

Vue.use(Vuebar);
// install vue-rx
Vue.use(VueRx)
Vue.use(BootstrapVue);
Vue.use(Progress)
Vue.use(VueRecord)

Vue.config.productionTip = false
require('./roslib.min.js')
require('./eventemitter2.min.js')
require('./jquery-3.2.1.min.js')
require('./keyboardteleop.js')
//require('./block.js')

Vue.config.ignoredElements = ['field','block','category','xml','mutation','value','sep']

//require('./blockly/blockly_compressed.js')
//require('./blockly/blocks_compressed.js')
//require('./blockly/msg/js/en.js')


new Vue({
  render: h => h(App),
  store,
  router,
}).$mount('#app')



