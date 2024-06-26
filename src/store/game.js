import { defineStore } from 'pinia'
import {useSelectStore} from "./select";
import {getTranList} from "../algo/qi-zi-tran";
import {useDictStore} from "./dict";
import {useSettingStore} from "./setting";
import {useMessageStore} from "./message";

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
            prevIsPause: false,  // 上一个玩家状态是否为无字可落的跳过 
            // 棋盘状态数据
            qiPanData: null,
            // 默认落子数据
            downData: [
                
            ],
            justX: 0,  // 最新落子x坐标
            justY: 0,  // 最新落子y坐标
        }
    },
    actions: {
        // 初始化
        init: function () {

            // 打印版本信息 
            const settingStore = useSettingStore();
            var str = `${settingStore.title} ${settingStore.version} (${settingStore.updateTime})`;
            console.log('%c%s', 'color: green; font-size: 13px; font-weight: 700; margin-top: 2px; margin-bottom: 2px;', str);

            // 初始化棋盘数据
            const {xCount, yCount} = useSelectStore();
            this.initQiPanData(xCount, yCount);

            // 初始化成功 
            this.isInit = true;

            nextTick(() => {

                // 投递个消息，开始初始化了 
                useMessageStore().index = 0;
                sa.sendMessage('系统', 'success', '游戏开始...');

                // 显示初始落子
                sa.sendMessage('系统', 'info', '正在进行初始落子...');
                this.initDefaultDown();
                this.downDataToQiPanData2(0, () => {
                    sa.sendMessage('系统', 'info', '初始落子完毕...');
                    this.activeRole = 'black';
                    this.startAIDown();
                });

            });
        },

        // 获取当前活动角色 
        getActiveRole: function () {
            return this.activeRole;
        },
        // 获取当前活动角色对应的棋子名称
        getActiveRoleName: function () {
            return this.activeRole === 'black' ? '黑子' : '白子';
        },
        // 获取下一个角色
        getNextRole: function () {
            return this.activeRole === 'black' ? 'white' : 'black';
        },
        // 获取下一个角色对应的棋子名称
        getNextRoleName: function () {
            return this.activeRole === 'black' ? '白子' : '黑子';
        },
        // 获取指定角色对应的棋子名称
        getRoleName: function (role) {
            return role === 'black' ? '黑子' : '白子';
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
            for (let j = 1; j <= yCount; j++) {
                const yArr = [{ type: 'fill' }];
                for (let i = 1; i <= xCount; i++) {
                    const item = this.createQiZi(i, j, 'none', 'none');
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

        // 初始化默认落子数据
        initDefaultDown: function () {
            // 8 x 8 的棋盘，默认落子数据应该长这样 
            // { x: 5, y: 4, type: 'black' },
            // { x: 4, y: 4, type: 'white' },
            // { x: 4, y: 5, type: 'black' },
            // { x: 5, y: 5, type: 'white' },

            const selectStore = useSelectStore();
            const x = parseInt(selectStore.xCount / 2);
            const y = parseInt(selectStore.yCount / 2);

            this.downData = [
                { x: x + 1, y: y, type: 'black' },
                { x: x, y: y, type: 'white' },
                { x: x, y: y + 1, type: 'black' },
                { x: x + 1, y: y + 1, type: 'white' },
            ]
            
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
        downQiZi: function (x, y, downType, callback) {
            // this.qiPanData[x][y].type = type;

            const selectStore = useSelectStore();
            const qiZi = this.getQiZi(x, y);
            const roleName = this.getRoleName( downType );

            // 判断该位置是否已经有棋子了
            if(qiZi.type === 'black' || qiZi.type === 'white'){
                if (selectStore.allowCoverDown) {
                    // 给个消息提示 
                    if(qiZi.type === downType) {
                        sa.sendMessage(roleName, 'warning', `覆盖落子 ${this.getXyStr(x, y)}，放弃棋子1枚。`);
                    } else {
                        sa.sendMessage(roleName, 'warning', `覆盖落子 ${this.getXyStr(x, y)}，回收棋子1枚。`);
                    }
                    
                    // 覆盖原子 
                    this.changeQiZiType(qiZi);
                    this.clearCanDown();
                    nextTick(() => {
                        this.showCanDownByAuto();
                    });
                } else {
                    sa.sendMessage(roleName, 'error', '这个地方已经有落子了，请更换落子位置！');
                }
                return callback(false);
            }
            
            // 判断该位置是否是可落子的位置
            const mockDownQiZi = this.createQiZi(x, y, downType, 'none');
            const mockTranArr = getTranList(mockDownQiZi, this.qiPanData, selectStore.xCount, selectStore.yCount);
            if(mockTranArr.length === 0 && !selectStore.allowForceDown){
                sa.sendMessage(roleName, 'error', '此处不能落子！落子要求必须至少翻转一个对方棋子。');
                return callback(false);
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
            
            // 给个提示，回收了多少枚棋子 
            sa.sendMessage(roleName, 'info', `落子 ${this.getXyStr(x, y)}，回收棋子 ${tranArr.length} 枚。`);
            
            this.changeQiZiArrType_anim(tranArr, 0, () => {
                this.prevIsPause = false; // 打个标记 
                callback(true);
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
            // 切换活动执子
            if(this.activeRole === 'black'){
                this.activeRole = 'white';
            }
            else if(this.activeRole === 'white'){
                this.activeRole = 'black';
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
            if(selectStore.tipsDown) {
                this.showCanDown();
            }
        },
        // 清楚所有可落子提示
        clearCanDown: function () {
            this.forEachQiPan(qiZi => {
                qiZi.tipsType = 'none';
            })
        },

        // 用户手动落子了 
        userDown: function(x, y) {
            this.downQiZi(x, y, this.activeRole, ( isDownSuccess ) => {
                if(isDownSuccess) {
                    this.next();
                }
            });
        },
        
        // 开始自动落子
        startAIDown: function() {
            // console.log('开始AI落子');

            // 当前活动角色 
            const activeRole = this.activeRole;

            // 获取所有可落子位置
            const canDownArr = this.getCanDown();
            if(canDownArr.length === 0){
                // 无法落子，切换活动角色 
                const activeRoleName = this.getActiveRoleName();
                const nextRoleName = this.getNextRoleName();
                
                // 如果是连着两方都是无子可落，则游戏结束 
                if(this.prevIsPause) {
                    sa.sendMessage(activeRoleName, 'warning', `${activeRoleName}也无处可落，游戏结束！`);
                    return this.endGame();
                } else {
                    sa.sendMessage(activeRoleName, 'warning', `${activeRoleName}无处可落，${nextRoleName}继续落子！`);
                }

                // 打个标记 
                this.prevIsPause = true; 
                this.next();
                return;
            }
            
            // AI 落子回调函数 
            const downChessFunction = informDown => {
                this.downQiZi(informDown.x, informDown.y, activeRole, ( isDownSuccess ) => {
                    if(isDownSuccess) {
                        this.next();
                    }
                });
            }
            
            // 调用 AI 算法落子 
            // 参数：落子回调，当前活动角色，可落子位置数组 
            // const aiRole = '';
            
            const aiRole = this.getCurrentAIRole();
            aiRole.downChess(downChessFunction, activeRole, canDownArr);
        },
        // 获取当前 AI 角色 
        getCurrentAIRole: function () {
            const dictStore = useDictStore();
            const selectStore = useSelectStore();
            if(this.activeRole === 'black') {
                return dictStore.getAIRole(selectStore.blackRole);
            } else {
                return dictStore.getAIRole(selectStore.whiteRole);
            }
        },
    
        // 程序进行下一步动作 
        next: function () {
            // 停顿 400ms 再下一步，让用户视觉上更容易看到落子过程  
            setTimeout(() => {
                // 切换活动角色 
                this.changeActiveRole();

                // 下一步
                this.startAIDown();
            }, 400);
        },
        // 结束游戏，输出结算信息 
        endGame: function () {
            sa.sendMessage('系统', 'success', '游戏结束！' + this.getEndJsStr(), true);
            this.status = 'end';
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

        // 获取坐标的字符串描写形式 
        getXyStr: function (x, y) {
            const dictStore = useDictStore();
            return '(' + dictStore.xName[x] + ',' + y + ')';
        },
        
        
    }
})
