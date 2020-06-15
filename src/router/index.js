import Vue from 'vue'
import Router from 'vue-router'
import LoginForm from '@/components/LoginForm'
import HostNav from '@/components/HostNav'
import HDFSTab from '@/components/HDFSTab'
import UserManager from '@/components/userManager'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/HostNav',
      name: 'HostNav',
      component: HostNav,
      meta: {
        requireAuth: true
      },
      children: [
        {
          path: 'UserManager',
          name: 'UserManager',
          component: UserManager
        }
      ]
    },
    {
      path: '/',
      name: 'login',
      component: LoginForm,
    }
  ],
  // mode: "hash"
})
