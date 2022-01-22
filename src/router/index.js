import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Welcome from '../components/Welcome.vue'
import Users from '../components/users/Users.vue'
import Case from '../components/ui_test/case.vue'
import Method from '../components/ui_test/method.vue'
import Element from '../components/ui_test/element.vue'
import Step from '../components/ui_test/step.vue'
import Record from '../components/ui_test/record.vue'
import ElementPage from '../components/ui_test/element_page'
Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children:
      [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: Users },
        { path: '/case', component: Case },
        { path: '/method', component: Method },
        { path: '/element', component: Element },
        { path: '/step', component: Step },
        { path: '/record', component: Record },
        { path: '/elementpage', component: ElementPage }
      ]
    }
  ]
})

router.beforeEach((to, from, next) => {
  // to 将访问哪一个路径
  // from 代表从哪个路径跳转而来
  // next 是一个函数,表示放行
  //   next() 放行 next('/login') 强制跳转
  if (to.path === '/login') return next()
  // 获取token
  const token = window.sessionStorage.getItem('token')
  if (!token) return next('/login')
  next()
})

export default router
