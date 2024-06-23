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
            status: 'defDown',  // 程序状态：defDown 默认棋子落子中，userDown 用户落子中，end 已结束，tran 翻转棋子或AI运算中 
            // 棋盘状态数据
            qiPanData: null,
            // 落子顺序数据 
            downData: [
                { x: 5, y: 4, type: 'black' },
                { x: 4, y: 4, type: 'white' },
                { x: 4, y: 5, type: 'black' },
                { x: 5, y: 5, type: 'white' },
            ],
            justX: 0,  // 最新落子x坐标
            justY: 0,  // 最新落子y坐标
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
                if(selectStore.blackAuto) {
                    this.startAIDown();
                } else {
                    this.startUserDown();
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
                score: 0,  // 此处落子可得评分 
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

            const selectStore = useSelectStore();
            const qiZi = this.getQiZi(x, y);

            // 判断该位置是否已经有棋子了
            if(qiZi.type === 'black' || qiZi.type === 'white'){
                if (selectStore.allowCoverDown) {
                    this.changeQiZiType(qiZi);
                } else {
                    sa.sendMessage('error', '这个地方已经有落子了！');
                }
                return;
            }
            
            // 判断该位置是否是可落子的位置
            const mockDownQiZi = this.createQiZi(x, y, downType, 'none');
            const mockTranArr = getTranList(mockDownQiZi, this.qiPanData, selectStore.xCount, selectStore.yCount);
            if(mockTranArr.length === 0 && !selectStore.allowForceDown){
                sa.sendMessage('error', '此处不能落子！落子要求必须至少翻转一个对方棋子。');
                return;
            }
            
            // 落子运算 
            this.status = 'tran';
            
            // 记录落子坐标
            this.justX = x;
            this.justY = y;
            
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
            const downQiZi = this.getQiZi(x, y);
            const tranArr = getTranList(downQiZi, this.qiPanData, selectStore.xCount, selectStore.yCount);
            this.changeQiZiArrType_anim(tranArr, 0, () => {
                // 切换完了，开始切换活动执子  
                // 延迟一小点时间，减少用户视觉上的紧迫感 
                setTimeout(() => {
                    this.next();
                }, 400);
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
        changeActiveRole: function (isChange = true) {
            const selectStore = useSelectStore();
            
            // 切换活动执子
            if(isChange){
                if(this.activeRole === 'black'){
                    this.activeRole = 'white';
                }
                else if(this.activeRole === 'white'){
                    this.activeRole = 'black';
                }
            }

            // 下一步 
            if(this.activeRole === 'white'){
                if(!selectStore.whiteAuto) {
                    this.startUserDown();
                } else {
                    this.startAIDown();
                }
            }
            else if(this.activeRole === 'black'){
                if(!selectStore.blackAuto) {
                    this.startUserDown();
                } else {
                    this.startAIDown();
                }
            }
        },
        // 计算可落子位置 
        getCanDown: function (qiZiType) {
            qiZiType = qiZiType ?? this.activeRole;
            const canDownArr = [];
            let selectStore = useSelectStore();

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
        // 计算并显示可落子位置 
        showCanDown: function () {
            const qiZiType = this.activeRole;
            this.getCanDown().forEach(qiZi => qiZi.tipsType = qiZiType);
        },
        // 计算并显示可落子位置（智能判断该不该显示） 
        showCanDownByAuto: function () {
            const selectStore = useSelectStore();
            if(this.activeRole === 'black' && !selectStore.blackAuto){
                this.showCanDown();
            }
            if(this.activeRole === 'white' && !selectStore.whiteAuto){
                this.showCanDown();
            }
        },
        // 清楚所有可落子提示
        clearCanDown: function () {
            this.forEachQiPan(qiZi => {
                qiZi.tipsType = 'none';
            })
        },
        
        // 开始 User 落子
        startUserDown: function(){
            this.status = 'userDown';
            this.showCanDown();
            // 等待用户落子，程序无需任何动作 
            // ... 
        },
        // 开始 AI 落子
        startAIDown: function() {
            // console.log('开始AI落子');

            const gameStore = useGameStore();

            // 当前活动角色 
            const activeRole = gameStore.activeRole;

            // 获取所有可落子位置
            const canDownArr = gameStore.getCanDown();
            
            // 这两步应该交给具体的 AI 算法来处理
            // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
            // canDownArr.sort(() => Math.random() - 0.5);
            // 按照 tranCount 从小到大升序排列  
            // canDownArr.sort((a, b) => a.tranCount - b.tranCount);
            
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
    
        // 在程序已结束时，获取棋盘结算数据 str
        getEndJsStr: function () {
            const qiZiCount = this.getQiZiCount();
            let endData = '';
            if(qiZiCount.blackCount > qiZiCount.whiteCount){
                endData = '黑子获胜！';
            }
            if(qiZiCount.blackCount < qiZiCount.whiteCount){
                endData = '白子获胜！';
            }
            if(qiZiCount.blackCount === qiZiCount.whiteCount){
                endData = '平局！';
            }
            return endData;
        },
        
        // 程序进行下一步动作 
        next: function () {
            const gameNextStatus = this.getGameNextStatus();
            if (gameNextStatus === 'change') {
                this.changeActiveRole(true);
            }
            if (gameNextStatus === 'pause') {
                if(this.activeRole === 'black') {
                    sa.sendMessage('warning', '白子无处可落，黑子继续行棋！');
                }
                if(this.activeRole === 'white') {
                    sa.sendMessage('warning', '黑子无处可落，白子继续行棋！');
                }
                // this.showCanDownByAuto();
                this.changeActiveRole(false);
            }
            if (gameNextStatus === 'end') {
                sa.sendMessage('success', '游戏结束！' + this.getEndJsStr(), true);
                this.status = 'end';
            }
        },
        // 获取程序下一步可进行的状态 
        // end=结束，开始结算，
        // change=下一步，正常切换，
        // pause=停顿不切换状态
        getGameNextStatus: function (){
            const selectStore = useSelectStore();
            
            // 判断是否已经下满棋盘
            const qiZiCount = this.getQiZiCount();
            if(qiZiCount >= selectStore.xCount * selectStore.yCount){
                return 'end';
            }
            
            // 没下满棋盘，判断是否可进行下一步切换 
            const currentRole = this.activeRole;
            const nextRole = currentRole === 'black' ? 'white' : 'black';
            
            // 获取 nextRole 的所有可落子位置总数
            //  如果 > 0，代表对方有子可落，可以进行下一步切换
            const nextCanDownArr = this.getCanDown(nextRole);
            if(nextCanDownArr.length > 0){
                return 'change';
            }
            //  如果 = 0，代表对方无子可落，不能进行下一步切换
            //  此时，再判断当前子是否可以继续落子
            //      如果可以，则让当前子继续落子
            //      如果也不可以，则此时直接结束游戏
            const currentCanDownArr = this.getCanDown(currentRole);
            if(currentCanDownArr.length > 0){
                return 'pause';
            }
            return 'end';
        }
        
    }
})
