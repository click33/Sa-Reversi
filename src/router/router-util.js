// --------------- 定义所有在操作 Router 时可能用到的工具函数

// 判断一个路由是否为白名单  
import {useSettingStore} from "../store/setting";

export const isWhiteRoute = function (route) {
    return ['login', '403', '404', 'index'].indexOf(route.name) > -1;
}


// 设置网页标题
export const setTitle = function (route) {
    if(route.meta && route.meta.title) {
        document.title = route.meta.title + ' - ' + useSettingStore().title;
    }
}

