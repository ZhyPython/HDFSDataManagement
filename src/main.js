// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import Axios from 'axios'
import qs from 'qs';
import ProcessFunc from './process_func/hdfs_table'
import cookie from './assets/js/cookie'
import echarts from 'echarts'
import HighchartsVue from 'highcharts-vue'

Vue.use(ElementUI)
Vue.use(HighchartsVue)

Vue.prototype.$axios = Axios
Vue.prototype.$qs = qs
Vue.prototype.$cookie = cookie
Vue.prototype.$echarts = echarts
Vue.prototype.$backend = "http://127.0.0.1:8000"

Axios.defaults.withCredentials = true
// Axios.defaults.baseURL = '/nn1'
Axios.defaults.headers.post['content-Type'] = 'application/json'

Vue.prototype.$processFunc = ProcessFunc

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  if (to.matched.some(item => item.meta.requireAuth)) {
    // 向后台发出请求，验证用户是否登录过
    Axios.get(Vue.prototype.$backend + "/valid/")
    .then(res => {
      // console.log(res)
      if (res.data.info == 'logined') {
        localStorage.setItem('username', res.data.username)
        next()
      } else {
        next('/')
      }
    })
    .catch(err => {
      console.log(err)
    })
  } else {
    next() // 确保一定要调用 next()
  }
})

async function getActiveNN () {
  try {
    // 页面初始化时访问后端接口，获取第一个集群
    let res =  await Axios.get(Vue.prototype.$backend
                                    + "/get_active_namenode/")
    Axios.defaults.baseURL =  '/' + res.data['active']
  } catch (err) {
    console.log(err)
  }
}

/* eslint-disable no-new */
getActiveNN().then(() => {
  new Vue({
    el: '#app',
    router,
    components: { App },
    template: '<App/>',
  })
})
