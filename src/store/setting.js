import { defineStore } from 'pinia'

import logoPath from '../assets/logo6.png';


/**
 * 定义所有全局设置
 */
export const useSettingStore = defineStore({
    id: 'setting',
    state: () => {
        return {
            title: 'Sa-Reversi 黑白棋',		// 页面标题
            logo: logoPath,		// logo地址
            version: 'v1.0.0',          // 版本号 
            updateTime: '2024-6-22',    // 更新日期 
            intro: '黑白棋',          // 系统描述
        };
    },
    actions: {

    }
})
