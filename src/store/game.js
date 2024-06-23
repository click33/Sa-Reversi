import { defineStore } from 'pinia'
import {useSelectStore} from "./select";
import {getTranList} from "../algo/qi-zi-tran";

/**
 * 定义游戏进行时参数信息 
 */
export const useGameStore = defineStore({
    id: 'game',
    state: () => {
        return {
            isInit: false,  // 是否初始化
            blackAuto: false, // 黑棋是否自动下子
            whiteAuto: false, // 白棋是否自动下子
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
            // 初始化棋盘数据
            const {xCount, yCount} = useSelectStore();
            this.initQiPanData(xCount, yCount);
            
            // 初始化落子顺序数据 
            this.downDataToQiPanData2();


            // 初始化成功 
            this.isInit = true;
        },
        
        // 初始化棋盘 
        initQiPanData: function (xCount, yCount) {
            const xArr = [{ type: 'fill' }];
            for (let i = 1; i <= xCount; i++) {
                const yArr = [{ type: 'fill' }];
                for (let j = 1; j <= yCount; j++) {
                    const item = {
                        x: j, 
                        y: i, 
                        type: 'none'
                    }
                    yArr.push(item)
                }
                xArr.push(yArr);
            }
            this.qiPanData = xArr;
        },
       
        // 按照落子顺序数据，更新棋盘数据 (无动画)
        downDataToQiPanData: function () {
            this.downData.forEach(item => {
                this.getQiZi(item.x, item.y).type = item.type;
            })
        },
        
        // 按照落子顺序数据，更新棋盘数据 (快速动画)
        downDataToQiPanData2: function (i = 0) {
            if(i >= this.downData.length) {
                return;
            }
            setTimeout(() => {
                const item = this.downData[i];
                this.getQiZi(item.x, item.y).type = item.type;
                i++;
                this.downDataToQiPanData2(i);
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
        downQiZi: function (x, y) {
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
            // 根据用户选择的执子类型，调用对应的方法
            let downType = '';
            if(this.activeRole === 'black'){
                this.setQiZiBlack(qiZi);
                downType = 'black';
                this.activeRole = 'white';
            }
            else if(this.activeRole === 'white'){
                this.setQiZiWhite(qiZi);
                downType = 'white';
                this.activeRole = 'black';
            }
            
            // 收集所有应该转换的棋子，开始转换 
            let selectStore = useSelectStore();
            const tranArr = getTranList(x, y, downType, this.qiPanData, selectStore.xCount, selectStore.yCount);
            this.changeQiZiArrType_anim(tranArr);
        },

        // 切换一组棋子类型
        changeQiZiArrType: function (tranArr) {
            tranArr.forEach(item => {
                this.changeQiZiType(item);
            })
        },
        // 切换一组棋子类型（带延迟动画）
        changeQiZiArrType_anim: function (tranArr, i = 0) {
            if(i >= tranArr.length) {
                return;
            }
            setTimeout(() => {
                this.changeQiZiType(tranArr[i]);
                i++;
                this.changeQiZiArrType_anim(tranArr, i);
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
        
        
    
    }
})
