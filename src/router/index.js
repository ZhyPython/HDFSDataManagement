import Vue from 'vue'
import Router from 'vue-router'
import LoginForm from '@/components/LoginForm'
import HostNav from '@/components/HostNav'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/HostNav',
      name: 'HostNav',
      component: HostNav,
      meta: {
        requireAuth: true
      }
    },
    {
      path: '/login',
      name: 'login',
      component: LoginForm,
    }
  ],
  mode: "history"
})
