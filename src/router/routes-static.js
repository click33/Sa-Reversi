/**
 * 静态路由表，定义所有路由 
 */
export const staticRoutes = [
    {
        name: 'index',
        path: '/',
        meta: { title: '首页' },
        component: () => import('/@/pages/home/index.vue'),
    },
    {
        name: 'home-select',
        path: '/select',
        meta: { title: '选择' },
        component: () => import('/@/pages/home/select.vue'),
    },
    {
        name: 'game',
        path: '/game',
        meta: { title: '游戏' },
        component: () => import('/@/pages/home/game.vue'),
    },
    // 404
    {
        name: '403',
        path: "/403",
        component: () => import('/@/pages/more/403'),
    },
    // 404
    {
        name: '404',
        path: "/404",
        component: () => import('/@/pages/more/404'),
    },
    {
        name: 'whole404',
        path: "/:pathMatch(.*)*",
        component: () => import('/@/pages/more/404'),
        // component: () => import('/@/pages/more/whole404'),
        // redirect: '/404',   // 使用 redirect 方式，会导致浏览器path也变成404，不方便调试，所以改为 component 显示方式 
        // component: () => import('/@/layout/view/404'),
    }
];
