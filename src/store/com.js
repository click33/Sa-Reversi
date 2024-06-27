import { defineStore } from 'pinia'

/**
 * 有关全局组件的状态
 */
export const useComStore = defineStore({
    id: 'com',
    state: () => {
        return {
            weFinger: null,  // 我方组件
            enemyFinger: null   // 敌方手指
        }
    },
    actions: {
        
    }
})
