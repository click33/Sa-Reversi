import { createApp } from 'vue'
import App from './App.vue'

// 去除警告： Added non-passive event listener to a scroll-blocking ‘wheel‘
import 'default-passive-events'

// 全局样式
import './sa-frame/sa.scss';
import './sa-frame/transition.scss'

// createApp
const app = createApp(App);

// 安装 layer-vue
import layer from '@layui/layer-vue';
import '@layui/layer-vue/lib/index.css';
app.use(layer);

// 安装 pinia
import store from "./store";
app.use(store);

// 安装 vue-router
import './router/router-guards'
import router from './router';
app.use(router);

// 全局解决页面元素滚动报错的问题
import "./init/solve-scroll-error";

// 安装 Element-Plus
import 'element-plus/dist/index.css';
import ElementPlus from 'element-plus';
import zhCn from 'element-plus/es/locale/lang/zh-cn'
app.use(ElementPlus, {
    locale: zhCn,
    // size: 'small'
});

// 全局图标 
import { initElIcons } from "./init/init-el-icons";
initElIcons(app);

// 全局 sa 对象
import sa from './sa-frame/sa.js';
app.config.globalProperties.sa = sa;
globalThis.sa = sa;

// 全局异常处理 
import {initErrorHandler} from "./init/error-handler";
initErrorHandler(app);

// 绑定dom
app.mount('#app');
