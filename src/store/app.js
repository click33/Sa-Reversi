import { defineStore } from 'pinia'
import {useSettingStore} from "./setting";


/**
 * 有关 app 临时布局的相关状态
 */
export const useAppStore = defineStore({
    id: 'app',
    state: () => {
        return {
            // ------------------------------- 状态 -------------------------------
            isOsLoading: false,     // 是否显示全局 loading 图 
            osLoadingMsg: '',       // 全局 loading 的文字 
            // isInit: false,          // 标记当前系统是否已经初始化完成
            // isLogin: false,         // 标记当前客户端是否已经登录
            
        }
    },
    actions: {

        // ------------------- 初始化相关 --------------------
        // 初始化, 此方法必须且只能调用一次
        init: function() {

            // 写入配置信息
            // const appStore = useAppStore();
            // // appStore.setAppInfo(appCfg);
            //
            // // 打印版本信息 
            // const settingStore = useSettingStore();
            // var str = `${settingStore.title} ${settingStore.version} (${settingStore.updateTime})`;
            // console.log('%c%s', 'color: green; font-size: 13px; font-weight: 700; margin-top: 2px; margin-bottom: 2px;', str);
            //
            // // 初始化完成标记 
            // appStore.isLogin = true;
        },
        
        // ------------------- 其它操作 --------------------
        // 显示全局loading……
        showOsLoading: function (msg) {
            this.isOsLoading = true;
            this.osLoadingMsg = msg || '';
        },
        // 隐藏全局loading
        hideOsLoading: function () {
            this.isOsLoading = false;
        },
        // 隐藏全局loading (msg为空时才关闭，可以保证loading动画的连续性)
        hideOsLoading2: function () {
            setTimeout(function (){
                if(this.osLoadingMsg === '') {
                    this.isOsLoading = false;
                }
            }.bind(this),200)
        }
    }
})
