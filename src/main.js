import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
/** 导入全局样式 */
import './assets/css/global.css'
// axios 配置
import axios from 'axios'
import { Message, Loading } from 'element-ui'
Vue.prototype.$http = axios

// 那么 showFullScreenLoading() tryHideFullScreenLoading() 要干的事儿就是将同一时刻的请求合并。
// 声明一个变量 needLoadingRequestCount，每次调用showFullScreenLoading方法 needLoadingRequestCount + 1。
// 调用tryHideFullScreenLoading()方法，needLoadingRequestCount - 1。needLoadingRequestCount为 0 时，结束 loading。

let loading // 定义loading变量
let needLoadingRequestCount = 0
function startLoading() { //  使用Element loading-start 方法
  loading = Loading.service({
    lock: true,
    text: '加载中……',
    background: 'rgba(0, 0, 0, 0.7)'
  })
}
function endLoading() { // 使用Element loading-close 方法
  loading.close()
}
export function showFullScreenLoading() {
  if (needLoadingRequestCount === 0) {
    startLoading()
  }
  needLoadingRequestCount++
}

export function tryHideFullScreenLoading() {
  if (needLoadingRequestCount <= 0) return
  needLoadingRequestCount--
  if (needLoadingRequestCount === 0) {
    endLoading()
  }
}

// 配置请求的根路径
// axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// axios.defaults.baseURL = 'https://lianghj.top:8888/api/private/v1/'
axios.defaults.baseURL = 'http://127.0.0.1:8082/VueApi/'
// http request 拦截器
axios.interceptors.request.use(
  config => {
    // console.log(config)
    // NProgress.start()
    showFullScreenLoading()
    // 登录授权 请求验证是否有token  需要授权的 API ，必须在请求头中使用 `Authorization` 字段提供 `token` 令牌
    config.headers.Authorization = window.sessionStorage.getItem('token')
    return config // 必须返回否则没有值
  },
  error => {
    tryHideFullScreenLoading()
    return Promise.reject(error)
  }
)

// http response 拦截器
axios.interceptors.response.use(
  response => {
    tryHideFullScreenLoading()
    return response
  },
  error => {
    tryHideFullScreenLoading()
    return Promise.reject(error)
  }
)
Vue.prototype.$http = axios

Vue.config.productionTip = false
// Sortable.prototype.Sortable = axios

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
