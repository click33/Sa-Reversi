import { defineStore } from 'pinia'
import {useSelectStore} from "./select";
import {getCanDownArray, getTranList} from "../algo/playing-chess/ai-calc-coomon";
import {useDictStore} from "./dict";
import {useSettingStore} from "./setting";
import {useMessageStore} from "./message";
import {useComStore} from "./com";
import {getXyStr} from "../algo/playing-chess/ai-calc-coomon";

/**
 * 定义游戏进行时参数信息 
 */
export const useGameStore = defineStore({
    id: 'game',
    state: () => {
        return {
            isInit: false,  // 是否初始化
            currentPlayerType: 'black', // 当前执子玩家类型：black、white
            status: 'defDown',  // 程序状态：defDown 默认棋子落子中，userDown 用户落子中，end 已结束，tran 翻转棋子或AI运算中 
            prevIsPause: false,  // 上一个玩家状态是否为无子可落的跳过 
            boardData: null,    // 棋盘数据
            initialChessList: [],   // 初始落子数据
            justX: 0,  // 最新落子x坐标
            justY: 0,  // 最新落子y坐标
            strategyTree: [],  // 策略树
            strategyChessType: 'none',  // 策略树对应的棋子类型
            inCalcStrategy: false,  // 是否在计算策略中... 
            defaultExpandedKeys: [],  // 默认展开的节点
        }
    },
    actions: {

        // ------------------------------ 初始化相关 ------------------------------ 

        // 初始化
        init: function () {

            // 打印版本信息 
            const settingStore = useSettingStore();
            var str = `${settingStore.title} ${settingStore.version} (${settingStore.updateTime})`;
            console.log('%c%s', 'color: green; font-size: 13px; font-weight: 700; margin-top: 2px; margin-bottom: 2px;', str);

            // 初始化棋盘数据
            const {xCount, yCount} = useSelectStore();
            this.initBoardData(xCount, yCount);

            // 初始化成功 
            this.isInit = true;

            nextTick(() => {

                // 投递个消息，开始初始化了 
                useMessageStore().index = 0;
                sa.sendMessage('系统', 'success', '游戏开始...');

                // 显示初始落子
                sa.sendMessage('系统', 'info', '正在进行初始落子...');
                this.initInitialChessList();
                this.initialChessListToBoardData_withAnim(0, () => {
                    sa.sendMessage('系统', 'info', '初始落子完毕，对战开始...');
                    this.setCurrentPlayerType('black');
                    this.stepForward();
                });

            });
        },
        
        // 卸载游戏运算：从游戏界面离开时，需要停止后台的游戏运算
        destroy: function () {
            this.isInit = false;
        },

        // 初始化棋盘 
        initBoardData: function (xCount, yCount) {
            const xArr = [{ type: 'fill' }];
            for (let j = 1; j <= yCount; j++) {
                const yArr = [{ type: 'fill' }];
                for (let i = 1; i <= xCount; i++) {
                    const item = this.createChess(i, j, 'none', 'none');
                    yArr.push(item)
                }
                xArr.push(yArr);
            }
            this.boardData = xArr;
        },

        // 计算初始落子数据
        initInitialChessList: function () {
            // 8 x 8 的棋盘，默认落子数据应该长这样 
            // { x: 5, y: 4, type: 'black' },
            // { x: 4, y: 4, type: 'white' },
            // { x: 4, y: 5, type: 'black' },
            // { x: 5, y: 5, type: 'white' },

            const selectStore = useSelectStore();
            const x = parseInt(selectStore.xCount / 2);
            const y = parseInt(selectStore.yCount / 2);

            this.initialChessList = [
                { x: x + 1, y: y, type: 'black' },
                { x: x, y: y, type: 'white' },
                { x: x, y: y + 1, type: 'black' },
                { x: x + 1, y: y + 1, type: 'white' },
            ]

        },

        // 将初始落子，更新棋盘数据 (无动画)
        initialChessListToBoardData: function () {
            this.initialChessList.forEach(item => {
                this.getChess(item.x, item.y).type = item.type;
            })
        },

        // 将初始落子，更新棋盘数据 (带动画，视觉上更流畅)
        initialChessListToBoardData_withAnim: function (i, callback) {
            setTimeout(() => {
                if(i >= this.initialChessList.length) {
                    callback();
                    return;
                }

                const item = this.initialChessList[i];
                this.getChess(item.x, item.y).type = item.type;
                i++;
                this.initialChessListToBoardData_withAnim(i, callback);
            }, 500)
        },

        // 创建一个棋子数据
        createChess: function (x, y, type, tipsType) {
            return {
                x,   // x轴坐标 
                y,  // y轴坐标 
                type,  // 棋子类型 
                tipsType,  // 提示类型
                tranCount: 0,  // 此处落子可翻转的棋子数量
                score: 0,  // 此处落子可得评分 
            }
        },

        // ------------------------------ 一些基础信息获取 ------------------------------ 
        
        // 设置当前执子玩家类型
        setCurrentPlayerType: function (playerType) {
            this.currentPlayerType = playerType;
        },

        // 切换当前执子玩家 
        changeCurrentPlayerType: function () {
            // 切换活动执子
            if(this.currentPlayerType === 'black'){
                this.setCurrentPlayerType('white');
            }
            else if(this.currentPlayerType === 'white'){
                this.setCurrentPlayerType('black');
            }
        },

        // 获取当前执子玩家类型 - 对应的棋子名称
        getCurrentPlayerTypeName: function () {
            return this.currentPlayerType === 'black' ? '黑子' : '白子';
        },
        
        // 获取下一个执子玩家类型
        getNextPlayerType: function () {
            return this.currentPlayerType === 'black' ? 'white' : 'black';
        },
       
        // 获取下一个执子玩家类型 - 对应的棋子名称
        getNextPlayerTypeName: function () {
            return this.currentPlayerType === 'black' ? '白子' : '黑子';
        },
        
        // 获取指定执子玩家 对应的棋子名称
        getPlayerTypeName: function (playerType) {
            return playerType === 'black' ? '黑子' : '白子';
        },

        // 获取当前执子的所属角色 
        getCurrentRole: function () {
            const dictStore = useDictStore();
            const selectStore = useSelectStore();
            if(this.currentPlayerType === 'black') {
                return dictStore.getRole(selectStore.blackRole);
            } else {
                return dictStore.getRole(selectStore.whiteRole);
            }
        },

        // 获取坐标的字符串描写形式 
        getXyStr: function (x, y) {
            return getXyStr(x, y);
        },

        // ------------------------------ 棋盘操作 ------------------------------ 

        // 遍历棋盘所有格子 (只遍历棋盘数据，不包括填充格)
        forEachBoardData: function(callback){
            this.boardData.forEach(tr => {
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

        // 获取指定坐标的棋子
        getChess: function (x, y) {
            return this.boardData[y][x];
        },

        // 获取指定棋盘，指定坐标的棋子 
        getBoardChess: function (boardData, x, y) {
            return boardData[y][x];
        },
    
        // 获取每种棋子的数量
        getChessCount: function () {
            let blackCount = 0;  // 黑棋数量
            let whiteCount = 0;  // 白棋数量
            let noneCount = 0;  // 空格数量 
            this.boardData.forEach(x => {
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

        // 在棋盘的指定位置落子，并在翻转所有棋子后回调一个函数 
        downChess: function (x, y, downType, callback){
            const comStore = useComStore();
            const selectStore = useSelectStore();
            
            // 判断此次应该用哪个手指进行落子 
            
            // 双 user，不使用手指 
            if(selectStore.blackRole === 'user' && selectStore.whiteRole === 'user'){
                return this.downChess_Method(x, y, downType, callback);
            }
            
            // 双 AI，必使用手指：黑子用 weFinger，白子用 enemyFinger
            if(selectStore.blackRole !== 'user' && selectStore.whiteRole !== 'user'){
                if(downType === 'black'){
                    return comStore.weFinger.down(x, y, () => this.downChess_Method(x, y, downType, callback));
                } else {
                    return comStore.enemyFinger.down(x, y, () => this.downChess_Method(x, y, downType, callback));
                }
            }
            
            // 黑子 AI，白子 user，黑手落子时使用 enemyFinger 手指 
            if(selectStore.blackRole !== 'user' && selectStore.whiteRole === 'user'){
                if(downType === 'black'){
                    return comStore.enemyFinger.down(x, y, () => this.downChess_Method(x, y, downType, callback));
                } else {
                    return this.downChess_Method(x, y, downType, callback);
                }
            }
            
            // 黑子 user，白子 AI，白手落子时使用 enemyFinger 手指 
            if(selectStore.blackRole === 'user' && selectStore.whiteRole !== 'user'){
                if(downType === 'white'){
                    return comStore.enemyFinger.down(x, y, () => this.downChess_Method(x, y, downType, callback));
                } else {
                    return this.downChess_Method(x, y, downType, callback);
                }
            }
        },
        
        // 在棋盘的指定位置落子，并在翻转所有棋子后回调一个函数 
        downChess_Method: function (x, y, downType, callback) {

            const selectStore = useSelectStore();
            const chess = this.getChess(x, y);
            const playerTypeName = this.getPlayerTypeName( downType );

            // 判断该位置是否已经有棋子了
            if(chess.type === 'black' || chess.type === 'white'){
                if (selectStore.allowCoverDown) {
                    // 给个消息提示 
                    if(chess.type === downType) {
                        sa.sendMessage(playerTypeName, 'warning', `覆盖落子 ${this.getXyStr(x, y)}，放弃棋子1枚。`);
                    } else {
                        sa.sendMessage(playerTypeName, 'warning', `覆盖落子 ${this.getXyStr(x, y)}，回收棋子1枚。`);
                    }
                    
                    // 覆盖原子 
                    this.changeChessType(chess);
                    this.clearCanDown();
                    nextTick(() => {
                        this.showCanDownByConfig();
                    });
                } else {
                    sa.sendMessage(playerTypeName, 'error', '这个地方已经有落子了，请更换落子位置！');
                }
                return callback(false);
            }
            
            // 判断该位置是否是可落子的位置
            const mockDownChess = this.createChess(x, y, downType, 'none');
            const mockTranArr = getTranList(mockDownChess.x, mockDownChess.y, mockDownChess.type, this.boardData, selectStore.xCount, selectStore.yCount);
            if(mockTranArr.length === 0 && !selectStore.allowForceDown){
                sa.sendMessage(playerTypeName, 'error', '此处不能落子！落子要求必须至少翻转一个对方棋子。');
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
                this.setChessBlack(chess);
            }
            if(downType === 'white'){
                this.setChessWhite(chess);
            }
            
            // 收集所有应该转换的棋子，开始转换 
            const downChess = this.getChess(x, y);
            const tranArr = getTranList(downChess.x, downChess.y, downChess.type, this.boardData, selectStore.xCount, selectStore.yCount);
            
            // 给个提示，回收了多少枚棋子 
            sa.sendMessage(playerTypeName, 'info', `落子 ${this.getXyStr(x, y)}，回收棋子 ${tranArr.length} 枚。`);
            
            this.changeChessArrType_withAnim(tranArr, 0, () => {
                this.prevIsPause = false; // 打个标记 
                callback(true);
            });
        },
        
        // 切换一组棋子类型（不带延迟动画）
        changeChessArrType: function (tranArr) {
            tranArr.forEach(item => {
                this.changeChessType(item);
            })
        },
        
        // 切换一组棋子类型（带延迟动画）
        changeChessArrType_withAnim: function (tranArr, i = 0, callback) {
            setTimeout(() => {
                if(i >= tranArr.length) {
                    return callback();
                }
                this.changeChessType(tranArr[i]);
                i++;
                this.changeChessArrType_withAnim(tranArr, i, callback);
            }, 200)
        },

        // 计算棋盘所有可落子位置 
        getCanDown: function (playerType) {
            playerType = playerType ?? this.currentPlayerType;
            const canDownArr = [];
            let selectStore = useSelectStore();

            // 遍历所有棋子，计算每个格子是否可以落子
            this.forEachBoardData(chess => {
                if(chess.type !== 'none'){
                    return;
                }
                // 假设在此处落子，有超过1个棋子是可以转换的，则代表此处可以落子
                const mockDownChess = this.createChess(chess.x, chess.y, playerType, 'none');
                const mockTranArr = getTranList(mockDownChess.x, mockDownChess.y, mockDownChess.type, this.boardData, selectStore.xCount, selectStore.yCount);
                if(mockTranArr.length > 0){
                    chess.tranCount = mockTranArr.length;
                    canDownArr.push(chess);
                }
            })

            // 
            return canDownArr;
        },

        // 计算并显示当前玩家的可落子位置 
        showCanDown: function () {
            const chessType = this.currentPlayerType;
            this.getCanDown().forEach(chess => chess.tipsType = chessType);
        },

        // 计算并显示当前玩家的可落子位置（根据 selectStore 里的配置，智能判断该不该显示） 
        showCanDownByConfig: function () {
            const selectStore = useSelectStore();
            if(selectStore.tipsDown) {
                this.showCanDown();
            }
        },

        // 清楚所有可落子提示
        clearCanDown: function () {
            this.forEachBoardData(chess => {
                chess.tipsType = 'none';
            })
        },


        // ------------------------------ 棋子操作 ------------------------------ 

        // 切换一个棋子类型
        changeChessType: function (chess) {
            chess = this.getChess(chess.x, chess.y);
            if(chess.type === 'black'){
                this.setChessWhite(chess);
            }
            else if(chess.type === 'white'){
                this.setChessBlack(chess);
            }
        },
        
        // 设定一个棋子类型为黑子
        setChessBlack: function (chess) {
            chess.type = 'black';
        },
        
        // 设定一个棋子类型为白子
        setChessWhite: function (chess) {
            chess.type = 'white';
        },

        
        // ------------------------------ 程序运转 ------------------------------ 

        // 用户手动落子调用的方法 
        userDownChess: function(x, y) {
            this.downChess(x, y, this.currentPlayerType, ( isDownSuccess ) => {
                if(isDownSuccess) {
                    this.next();
                }
            });
        },
        
        // 程序走一个落子步骤  
        stepForward: function() {
            this.stepForwardMethod();
        },

        // 程序走一个落子步骤  
        stepForwardMethod: function() {
            // console.log('开始AI落子');

            // 当前执子玩家 
            const currentPlayerType = this.currentPlayerType;

            // 获取所有可落子位置
            const canDownArr = getCanDownArray(this.boardData, currentPlayerType);
            if(canDownArr.length === 0){
                // 无法落子，切换活动角色 
                const currentPlayerTypeName = this.getCurrentPlayerTypeName();
                const nextPlayerTypeName = this.getNextPlayerTypeName();

                // 如果是连着两方都是无子可落，则游戏结束 
                if(this.prevIsPause) {
                    sa.sendMessage(currentPlayerTypeName, 'warning', `${currentPlayerTypeName}无处可落，双方均无子可落！`);
                    return this.endGame();
                }

                // 发个通知，让用户知道发生了什么 
                sa.sendMessage(currentPlayerTypeName, 'warning', `${currentPlayerTypeName}无处可落，${nextPlayerTypeName}继续落子！`);

                // 打个标记 
                this.prevIsPause = true;
                this.next();
                return;
            }

            // AI 落子回调函数 
            const downChessFunction = informDown => {
                this.downChess(informDown.x, informDown.y, currentPlayerType, ( isDownSuccess ) => {
                    if(isDownSuccess) {
                        this.next();
                    }
                });
            }

            // 调用 AI 算法落子 
            // 参数：落子回调，当前活动角色，可落子位置数组 
            // const aiRole = '';

            const aiRole = this.getCurrentRole();
            aiRole.downChess(downChessFunction, currentPlayerType, canDownArr);
        },
        
        // 程序进行下一步动作 
        next: function () {
            // 停顿 500ms 再下一步，让用户视觉上更容易看到落子过程  
            setTimeout(() => {
                // 如果尚未初始化，则不进行下一步了 
                if(this.isInit === false) {
                    return;
                }

                // 切换执子玩家 
                this.changeCurrentPlayerType();

                // 下一步
                this.stepForward();
            }, 500);
        },

        // ------------------------------ 对局结束 ------------------------------ 

        // 结束游戏，输出结算信息 
        endGame: function () {
            sa.sendMessage('系统', 'success', '游戏结束！' + this.getEndJsStr(), true);
            this.status = 'end';
        },
        
        // 在程序已结束时，获取棋盘结算数据 str
        getEndJsStr: function () {
            const chessCount = this.getChessCount();
            let endData = '';
            if(chessCount.blackCount > chessCount.whiteCount){
                endData = '黑子获胜！';
            }
            if(chessCount.blackCount < chessCount.whiteCount){
                endData = '白子获胜！';
            }
            if(chessCount.blackCount === chessCount.whiteCount){
                endData = '平局！';
            }
            return endData;
        },

    }
})
