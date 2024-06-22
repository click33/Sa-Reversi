/**
 * ---------------- 定义导航守卫 ----------------
 */
import router from "./index";
import NProgress from "nprogress";
import 'nprogress/nprogress.css';
import { useAppStore } from "../store/app";
import { isWhiteRoute, setTitle } from "./router-util";

// 进度条配置：隐藏右上角进度环
NProgress.configure({ showSpinner: false });

// 路由初始化完毕钩子
router.isReady().then(() => {
    
});

// 路由加载前
// router.beforeEach( async (to, from, next) => {
router.beforeEach( (to, from, next) => {
    // 进度条和loading 
    NProgress.start();
    useAppStore().showOsLoading();
    
    setTitle(to);
    next();
    
})

// 路由加载后
router.afterEach(() => {
    // 关闭进度条
    NProgress.done();
    // 关闭全局loading 
    useAppStore().hideOsLoading2();
    // setTimeout(function (){
    //     useAppStore().isOsLoading = false;
    // }, 10)
})

