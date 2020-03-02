// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Axios from 'axios'
import ProcessFunc from './process_func/hdfs_table'

Vue.use(ElementUI)

Vue.prototype.$axios = Axios
Axios.defaults.baseURL = '/browse'
Axios.defaults.headers.post['content-Type'] = 'application/json'

Vue.prototype.$processFunc = ProcessFunc

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
