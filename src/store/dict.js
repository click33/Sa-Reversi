import { defineStore } from 'pinia'

/**
 * 字典数据
 */
export const useDictStore = defineStore({
    id: 'dict',
    state: () => {
        return {
            // 等级列表
            levelList: [
                { value: 1, name: '菜狗' },
                { value: 2, name: '初级陪练' },
                { value: 3, name: '中级陪练' },
                { value: 4, name: '高级陪练' },
                { value: 5, name: '棋圣' },
            ],
            // 选手信息列表 
            roleList: [
                { value: 'black', name: '我要执黑 (先手)' },
                { value: 'white', name: '我要执白 (后手)' },
                { value: 'double', name: '我要执双（无AI）' },
                { value: 'non', name: '我不执（双AI对战）' },
            ],
        }
    },
    actions: {
        // 根据等级获取等级名称
        getLevelName(level) {
            return this.levelList.find(item => item.value === level).name;
        },
    }
})
