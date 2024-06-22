import {createRouter, createWebHashHistory, createWebHistory} from 'vue-router';

// 所有路由
import { staticRoutes } from "./routes-static";

/**
 * 创建 vue-router 实例
 */
const router = createRouter({
    // history: createWebHashHistory(),  // hase 模式
    history: createWebHistory(),  // 正常路由模式，此时不可以配置 VITE_PUBLIC_PATH 属性 
    routes: [...staticRoutes],
});

// 导出
export default router;
