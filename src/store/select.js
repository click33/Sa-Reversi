import { defineStore } from 'pinia'
import {nextTick} from "vue";
import {ElMessage} from "element-plus";
import {randomUsername} from "../algo/random-username";

/**
 * 玩家选择的参数信息  
 */
export const useSelectStore = defineStore({
    id: 'select',
    state: () => {
        // 玩家选择的参数信息   --- 注意：从这里改动配置后，需要手动刷新页面才会生效
        const defaultSelectStore = {
            blackRole: 'user',  // 黑子角色 
            whiteRole: 'caigou',  // 白子角色
            blackOneHornStrong: false,  // 黑子占一角
            whiteOneHornStrong: false,  // 白子占一角
            blackHornStrong: false,  // 黑子占四角
            whiteHornStrong: false,  // 白子占四角
            blackEdgeStrong: false,  // 黑子占四边
            whiteEdgeStrong: false,  // 白子占四边
            blackRandomFourStrong: false,  // 黑子随机四子
            whiteRandomFourStrong: false,  // 白子随机四子
            blackQxDepth: 4,  // 黑子AI棋仙迭代深度 
            whiteQxDepth: 4,  // 白子AI棋仙迭代深度 
            helpQxDepth: 4,  // AI 帮走棋子时，AI棋仙迭代深度 
            username: '', // 玩家昵称 
            xCount: 8,  // 棋盘行数
            yCount: 8,  // 棋盘列数
            xyCount: 8,  // 棋盘大小，快速设置 xCount、yCount 两个属性
            allowCoverDown: false,  // 允许覆盖落子 
            allowForceDown: false,  // 允许强制落子 
            tipsDown: true,  // 提示落子位置 
            tipsDownTranCount: false,  // 提示落子可回收棋子数量 
            tipsDownScore: false,  // 提示落子得分 
            showChessPoint: false,  // 显示棋子坐标 
            theme: 'light',  // 主题：light、dark 
            downChessAnim: 'random',  // 落子动画：random、none 
            pace: 1, // 运转节奏，每次的定时器延时间隔乘以的系数：1为正常速度，<1会变快，>1会变慢 
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
        
        if(!defaultSelectStore.username) {
            defaultSelectStore.username = randomUsername();
        }

        // 返回
        return defaultSelectStore;
    },
    actions: {
        // set 配置信息到本地缓存
        setSelectStoreToLocal: function () {
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
                // 除了 theme、username 之外，其他配置项恢复默认值
                if(['theme', 'username'].indexOf(key) > -1) {
                    continue;
                }
                this.$state[key] = cacheSelectStore[key];
            }
        },
        
        // 获取一个定时器延时时间乘以 pace 系数后的值 
        getSleep: function (ms) {
            return ms * this.pace;
        }
    }
})
