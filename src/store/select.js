import { defineStore } from 'pinia'
import {nextTick} from "vue";
import {ElMessage} from "element-plus";
import {randomPlayerName} from "../algo/random-player-name";

/**
 * 玩家选择的参数信息  
 */
export const useSelectStore = defineStore({
    id: 'select',
    state: () => {
        // 玩家选择的参数信息   --- 注意：从这里改动配置后，需要手动刷新页面才会生效
        const defaultSelectStore = {
            // role: 'black',  // 玩家执子：black=黑，white=白 
            // aiRole: 'caigou',  // Ai 角色 
            blackRole: 'user',  // 黑子角色 
            whiteRole: 'caigou',  // 白子角色 
            // blackAuto: false, // 黑棋是否自动下子
            // whiteAuto: false, // 白棋是否自动下子
            playerName: '', // 玩家昵称 
            xCount: 8,  // 棋盘行数
            yCount: 8,  // 棋盘列数
            xyCount: 8,  // 棋盘大小，快速设置 xCount、yCount 两个属性
            allowCoverDown: false,  // 允许覆盖落子 
            allowForceDown: false,  // 允许强制落子 
            tipsDown: true,  // 提示落子位置 
            tipsDownTranCount: false,  // 提示落子可回收棋子数量 
            tipsDownScore: false,  // 提示落子得分 
        };
        const defaultSelectStoreString = JSON.stringify(defaultSelectStore);

        // 如果开发者改动过的配置
        const cacheSelectStore = JSON.parse(localStorage.getItem('cache-layout-select-store') || defaultSelectStoreString);

        // 用户改动过的配置
        const userSelectStore = JSON.parse(localStorage.getItem('user-layout-select-store') || defaultSelectStoreString);
        
        // 优先级：开发者改动 > 用户改动 > 默认配置
        for (const key in defaultSelectStore) {
            // 默认配置的有改动时，以改动为准 
            if(defaultSelectStore[key] !== cacheSelectStore[key]) {
                userSelectStore[key] = defaultSelectStore[key];      // user 配置同步更新 
            }
            // 如果用户配置有改动时，以用户配置为准 
            else if(defaultSelectStore[key] !== userSelectStore[key]) {
                defaultSelectStore[key] = userSelectStore[key];
            } 
            // 否则，以默认主题配置为准 
            else {
                
            }
        }

        // 记录下本次默认 SelectStore，以便下次比对
        localStorage.setItem('cache-layout-select-store', defaultSelectStoreString);
        localStorage.setItem('user-layout-select-store', JSON.stringify(userSelectStore));

        // 构建部分配置项
        nextTick(function (){
            // const selectStore = useSelectStoreStore();
            // selectStore.greyModeChange(defaultSelectStore.greyMode);
            // selectStore.weakModeChange(defaultSelectStore.weakMode);
        })
        
        if(!defaultSelectStore.playerName) {
            defaultSelectStore.playerName = randomPlayerName();
        }

        // 返回
        return defaultSelectStore;
    },
    actions: {
        // set 配置信息到本地缓存
        setSelectStore: function () {
            // console.log(this.$state)
            // console.log(JSON.stringify(this.$state))
            localStorage.setItem('user-layout-select-store', JSON.stringify(this.$state));
        },
        
        // 恢复默认
        resetSelectStore: function () {
            const cacheSelectStoreString = localStorage.getItem('cache-layout-select-store');
            if(!cacheSelectStoreString) {
                return ElMessage({type:'warning', message: '未能读取到缓存数据，请尝试刷新页面'})
            }
            const cacheSelectStore = JSON.parse(cacheSelectStoreString);
            for (const key in this.$state) {
                this.$state[key] = cacheSelectStore[key];
            }
        }
    }
})
