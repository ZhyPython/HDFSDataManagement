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
import { color } from 'highcharts'

Vue.use(ElementUI)
Vue.use(HighchartsVue)

Vue.prototype.$axios = Axios
Vue.prototype.$qs = qs
Vue.prototype.$cookie = cookie
Vue.prototype.$echarts = echarts
Vue.prototype.$backend = "/hdfsManageBackend"
// clusterInfo表示当前显示的信息属性哪个集群以及该集群的active namenode地址
Vue.prototype.$clusterInfo = {
    'cluster': null,
    'activeNN': null
}

Axios.defaults.withCredentials = true
// Axios.defaults.headers.post['content-Type'] = 'application/json'

Vue.prototype.$processFunc = ProcessFunc

Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
    // 登录状态下跳转到'/'会直接到内容界面
    if (to.path == '/' && localStorage.getItem('username')) {
        next({path: '/HostNav'})
        return
    }
    // 跳转到内容页面会先请求验证
    if (to.meta.requireAuth) {
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
            next('/')
        })
    } else {
        next() // 确保一定要调用 next()
    }
})

async function getActiveNN () {
    try {
        // 页面初始化时访问后端接口，获取第一个集群
        let firstClusterName = null
        jQuery.ajax({
            type: 'GET',
            url: Vue.prototype.$backend + "/get_clusters/",
            dataType: 'json',
            async: false,
            success: function(res) {
                firstClusterName = res[0].name
                Vue.prototype.$clusterInfo.cluster = firstClusterName
            },
            error: function(){
                alert('无法获取集群信息');
            }
        })
        let url = Vue.prototype.$backend
              + "/get_active_namenode/?clusterName="
              + firstClusterName
        jQuery.ajax({
            type: 'GET',
            url: url,
            dataType: 'json',
            async: false,
            success: function(res) {
                Vue.prototype.$clusterInfo.activeNN = res
            }
        })
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
