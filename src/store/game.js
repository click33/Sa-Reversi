import { defineStore } from 'pinia'
import {useSelectStore} from "./select";
import {getTranList} from "../algo/qi-zi-tran";
import {useDictStore} from "./dict";

/**
 * 定义游戏进行时参数信息 
 */
export const useGameStore = defineStore({
    id: 'game',
    state: () => {
        return {
            isInit: false,  // 是否初始化
            activeRole: 'black', // 当前活动执子角色
            // 棋盘状态数据
            qiPanData: null,
            // 落子顺序数据 
            downData: [
                { x: 5, y: 4, type: 'black' },
                { x: 4, y: 4, type: 'white' },
                { x: 4, y: 5, type: 'black' },
                { x: 5, y: 5, type: 'white' },
            ]
        }
    },
    actions: {
        // 初始化
        init: function () {
            const selectStore = useSelectStore();
            
            // 初始化棋盘数据
            const {xCount, yCount} = useSelectStore();
            this.initQiPanData(xCount, yCount);
            
            // 初始化成功 
            this.isInit = true;
            
            // 显示初始落子
            this.downDataToQiPanData2(0, () => {
                if(!selectStore.blackAuto) {
                    this.showCanDown();
                }
            });

        },
        
        // 创建一个棋子数据
        createQiZi: function (x, y, type, tipsType) {
            return {
                x,   // x轴坐标 
                y,  // y轴坐标 
                type,  // 棋子类型 
                tipsType,  // 提示类型
                tranCount: 0,  // 此处落子可翻转的棋子数量
            }
        },
        
        // 初始化棋盘 
        initQiPanData: function (xCount, yCount) {
            const xArr = [{ type: 'fill' }];
            for (let i = 1; i <= xCount; i++) {
                const yArr = [{ type: 'fill' }];
                for (let j = 1; j <= yCount; j++) {
                    const item = this.createQiZi(j, i, 'none', 'none');
                    yArr.push(item)
                }
                xArr.push(yArr);
            }
            this.qiPanData = xArr;
        },
       
        // 遍历棋盘所有格子
        forEachQiPan: function(callback){
            this.qiPanData.forEach(tr => {
                if(tr.type === 'fill') {
                    return;
                }
                tr.forEach(td => {
                    if(td.type === 'fill') {
                        return;
                    }
                    callback(td);
                })
            });
        },
        
        // 按照落子顺序数据，更新棋盘数据 (无动画)
        downDataToQiPanData: function () {
            this.downData.forEach(item => {
                this.getQiZi(item.x, item.y).type = item.type;
            })
        },
        
        // 按照落子顺序数据，更新棋盘数据 (快速动画)
        downDataToQiPanData2: function (i, callback) {
            setTimeout(() => {
                if(i >= this.downData.length) {
                    callback();
                    return;
                }
                
                const item = this.downData[i];
                this.getQiZi(item.x, item.y).type = item.type;
                i++;
                this.downDataToQiPanData2(i, callback);
            }, 500)
        },
        
        // 获取指定坐标的棋子
        getQiZi: function (x, y) {
            return this.qiPanData[y][x];
        },
        getQiPanQiZi: function (qiPan, x, y) {
            return qiPan[y][x];
        },
    
        // 获取每种棋子的数量
        getQiZiCount: function () {
            let blackCount = 0;  // 黑棋数量
            let whiteCount = 0;  // 白棋数量
            let noneCount = 0;  // 空格数量 
            this.qiPanData.forEach(x => {
                if(x.type === 'fill') {
                    return;
                }
                x.forEach(y => {
                    if(y.type === 'fill') {
                        return;
                    }
                    if(y.type === 'black'){
                        blackCount++;
                    }
                    else if(y.type === 'white'){
                        whiteCount++;
                    }
                    else{
                        noneCount++;
                    }
                })
            });
            return {
                blackCount, 
                whiteCount, 
                noneCount
            }
        },
        
        // 指定位置被落子
        downQiZi: function (x, y, downType) {
            // this.qiPanData[x][y].type = type;
            
            const qiZi = this.getQiZi(x, y);

            // 判断该位置是否已经有棋子了
            if(qiZi.type === 'black' || qiZi.type === 'white'){
                const selectStore = useSelectStore();
                if (selectStore.allowCoverDown) {
                    this.changeQiZiType(qiZi);
                } else {
                    sa.msg('这个地方已经有落子了');
                }
                return;
            }
            // 清除落子提示
            this.clearCanDown();
            
            // 根据用户选择的执子类型，调用对应的方法
            if(downType === 'black'){
                this.setQiZiBlack(qiZi);
            }
            if(downType === 'white'){
                this.setQiZiWhite(qiZi);
            }
            
            // 收集所有应该转换的棋子，开始转换 
            let selectStore = useSelectStore();
            const downQiZi = this.getQiZi(x, y);
            const tranArr = getTranList(downQiZi, this.qiPanData, selectStore.xCount, selectStore.yCount);
            this.changeQiZiArrType_anim(tranArr, 0, () => {
                // 切换完了，开始切换活动执子  
                this.changeActiveRole();
            });
        },

        // 切换一组棋子类型
        changeQiZiArrType: function (tranArr) {
            tranArr.forEach(item => {
                this.changeQiZiType(item);
            })
        },
        // 切换一组棋子类型（带延迟动画）
        changeQiZiArrType_anim: function (tranArr, i = 0, callback) {
            setTimeout(() => {
                if(i >= tranArr.length) {
                    return callback();
                }
                this.changeQiZiType(tranArr[i]);
                i++;
                this.changeQiZiArrType_anim(tranArr, i, callback);
            }, 200)
        },
        // 切换一个棋子类型
        changeQiZiType: function (qiZi) {
            if(qiZi.type === 'black'){
                this.setQiZiWhite(qiZi);
            }
            else if(qiZi.type === 'white'){
                this.setQiZiBlack(qiZi);
            }
        },
        setQiZiBlack: function (qiZi) {
            qiZi.type = 'black';
        },
        setQiZiWhite: function (qiZi) {
            qiZi.type = 'white';
        },
        
        // 切换活动执子
        changeActiveRole: function () {
            const selectStore = useSelectStore();
            if(this.activeRole === 'black'){
                this.activeRole = 'white';
                if(!selectStore.whiteAuto) {
                    this.showCanDown();
                    this.startUserDown();
                } else {
                    this.startAIDown();
                }
            }
            else if(this.activeRole === 'white'){
                this.activeRole = 'black';
                if(!selectStore.blackAuto) {
                    this.showCanDown(); 
                    this.startUserDown();
                } else {
                    this.startAIDown();
                }
            }
        },
        // 计算并显示可落子位置 
        showCanDown: function () {
            const qiZiType = this.activeRole;
            this.getCanDown().forEach(qiZi => qiZi.tipsType = qiZiType);
        },
        // 计算可落子位置 
        getCanDown: function () {
            const canDownArr = [];
            let selectStore = useSelectStore();
            const qiZiType = this.activeRole;

            // 遍历所有棋子，计算每个格子是否可以落子
            this.forEachQiPan(qiZi => {
                if(qiZi.type !== 'none'){
                    return;
                }
                // 假设在此处落子，有超过1个棋子是可以转换的，则代表此处可以落子
                const mockDownQiZi = this.createQiZi(qiZi.x, qiZi.y, qiZiType, 'none');
                const mockTranArr = getTranList(mockDownQiZi, this.qiPanData, selectStore.xCount, selectStore.yCount);
                if(mockTranArr.length > 0){
                    // qiZi.tipsType = qiZiType;
                    qiZi.tranCount = mockTranArr.length;
                    canDownArr.push(qiZi);
                }
            })
            
            // 
            return canDownArr;
        },
        // 清楚所有可落子提示
        clearCanDown: function () {
            this.forEachQiPan(qiZi => {
                qiZi.tipsType = 'none';
            })
        },
        
        // 开始 User 落子
        startUserDown: function(){
            // 等待用户落子，程序无需任何动作 
        },
        // 开始 AI 落子
        startAIDown: function() {
            // console.log('开始AI落子');

            const gameStore = useGameStore();

            // 当前活动角色 
            const activeRole = gameStore.activeRole;

            // 获取所有可落子位置
            const canDownArr = gameStore.getCanDown();
            
            // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
            // canDownArr.sort(() => Math.random() - 0.5);
            
            // 按照 tranCount 从小到大升序排列  
            canDownArr.sort((a, b) => a.tranCount - b.tranCount);
            
            // 调用 AI 算法落子
            const aiRole = this.getCurrentAIRole();
            const informDown = aiRole.downChess(activeRole, canDownArr);
            this.downQiZi(informDown.x, informDown.y, activeRole);
        },
        // 获取当前 AI 角色 
        getCurrentAIRole: function () {
            const dictStore = useDictStore();
            const selectStore = useSelectStore();
            return dictStore.getAIRole(selectStore.aiRole);
        },
    
    }
})
