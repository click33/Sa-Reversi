import { defineStore } from 'pinia'
import {useSelectStore} from "./select";
import {useDictStore} from "./dict";
import {useSettingStore} from "./setting";
import {useMessageStore} from "./message";
import {useComStore} from "./com";
import {createBackChess, createChess, getXyStr} from "../algo/playing-chess/chess-funs";
import {getTranList} from "../algo/playing-chess/tran-funs";
import {getCanDownArray} from "../algo/playing-chess/board-calc";
import {forEachBoardData, getChessByXy, getChessCountInfo} from "../algo/playing-chess/board-funs";

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
            startChessList: [],   // 初始落子数据
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
                this.calcStartChessList();
                this.startChessListToBoardData_withAnim(0, () => {
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
                    const item = createChess(i, j, 'none');
                    yArr.push(item);
                }
                xArr.push(yArr);
            }
            this.boardData = xArr;
        },

        // 计算初始落子数据
        calcStartChessList: function () {
            // 8 x 8 的棋盘，默认落子数据应该长这样 
            // { x: 5, y: 4, type: 'black' },
            // { x: 4, y: 4, type: 'white' },
            // { x: 4, y: 5, type: 'black' },
            // { x: 5, y: 5, type: 'white' },

            const selectStore = useSelectStore();
            const x = parseInt(selectStore.xCount / 2);
            const y = parseInt(selectStore.yCount / 2);

            this.startChessList = [
                { x: x + 1, y: y, type: 'black' },
                { x: x, y: y, type: 'white' },
                { x: x, y: y + 1, type: 'black' },
                { x: x + 1, y: y + 1, type: 'white' },
            ]

        },

        // 将初始落子，更新棋盘数据 (无动画)
        startChessListToBoardData: function () {
            this.startChessList.forEach(item => {
                this.getChess(item.x, item.y).type = item.type;
            })
        },

        // 将初始落子，更新棋盘数据 (带动画，视觉上更流畅)
        startChessListToBoardData_withAnim: function (i, callback) {
            setTimeout(() => {
                if(i >= this.startChessList.length) {
                    callback();
                    return;
                }

                const item = this.startChessList[i];
                this.getChess(item.x, item.y).type = item.type;
                i++;
                this.startChessListToBoardData_withAnim(i, callback);
            }, 400)
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

        
        // ------------------------------ 棋盘操作 ------------------------------ 

        // 获取指定坐标的棋子
        getChess: function (x, y) {
            return getChessByXy(this.boardData, x, y);
        },

        // 遍历棋盘数据
        forEachBoardData: function (callback) {
            forEachBoardData(this.boardData, callback);
        },
        
        // 获取每种棋子的数量
        getChessCountInfo: function () {
            return getChessCountInfo(this.boardData);
        },

        // 在棋盘的指定位置落子，并在翻转所有棋子后回调一个函数 (判断该用哪个手指落子)
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
                        sa.sendMessage(playerTypeName, 'warning', `覆盖落子 ${getXyStr(x, y)}，放弃棋子1枚。`);
                    } else {
                        sa.sendMessage(playerTypeName, 'warning', `覆盖落子 ${getXyStr(x, y)}，回收棋子1枚。`);
                    }
                    
                    // 覆盖原子 
                    this.changeChessType(chess);
                    this.clearCanDownTips();
                    nextTick(() => {
                        this.showCanDownByConfig();
                    });
                } else {
                    sa.sendMessage(playerTypeName, 'error', '这个地方已经有落子了，请更换落子位置！');
                }
                return callback(false);
            }
            
            // 判断该位置是否是可落子的位置
            const mockDownChess = createBackChess(x, y, downType);
            const mockTranArr = getTranList(this.boardData, mockDownChess.x, mockDownChess.y, mockDownChess.type);
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
            this.clearCanDownTips();
            
            // 清除上一次的翻转落子样式 
            this.clearJustTranTips();
            
            // 根据用户选择的执子类型，调用对应的方法
            if(downType === 'black'){
                this.setChessBlack(chess);
            }
            if(downType === 'white'){
                this.setChessWhite(chess);
            }
            
            // 收集所有应该转换的棋子，开始转换 
            const downChess = this.getChess(x, y);
            const tranArr = getTranList(this.boardData, downChess.x, downChess.y, downChess.type);
            
            // 给个提示，回收了多少枚棋子 
            sa.sendMessage(playerTypeName, 'info', `落子 ${getXyStr(x, y)}，回收棋子 ${tranArr.length} 枚。`);
            
            // 开始翻转棋子 
            this.changeChessArrType_withAnim(tranArr, 0, () => {
                this.prevIsPause = false; // 打个标记 
                callback(true);
            });
        },
        
        // 切换一组棋子类型（不带延迟动画）
        changeChessArrType: function (tranArr) {
            tranArr.forEach(item => {
                const chess = this.getChess(tranArr[i].x, tranArr[i].y);
                this.changeChessType(chess);
                item.isJustTran = true;
            })
        },
        
        // 切换一组棋子类型（带翻转延迟动画）
        changeChessArrType_withAnim: function (tranArr, i = 0, callback) {
            setTimeout(() => {
                if(i >= tranArr.length) {
                    return callback();
                }
                const chess = this.getChess(tranArr[i].x, tranArr[i].y);
                this.changeChessType(chess);
                chess.isJustTran = true;
                
                i++;
                this.changeChessArrType_withAnim(tranArr, i, callback);
            }, 200)
        },

        // 计算棋盘所有可落子位置 
        getCanDown: function () {
            return getCanDownArray(this.boardData, this.currentPlayerType);
        },

        // 计算并显示当前玩家的可落子位置 
        showCanDown: function () {
            const chessType = this.currentPlayerType;
            this.getCanDown().forEach(chess => this.getChess(chess.x, chess.y).tipsType = chessType);
        },

        // 计算并显示当前玩家的可落子位置（根据 selectStore 里的配置，智能判断该不该显示） 
        showCanDownByConfig: function () {
            const selectStore = useSelectStore();
            if(selectStore.tipsDown) {
                this.showCanDown();
            }
        },

        // 清除所有可落子提示
        clearCanDownTips: function () {
            this.forEachBoardData(chess => {
                chess.tipsType = 'none';
            })
        },

        // 清除刚刚翻转的棋子样式提示 
        clearJustTranTips: function () {
            this.forEachBoardData(chess => {
                chess.isJustTran = false;
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
        
        // 落子回调函数 
        downChessFunction: function(informDown) {
            this.downChess(informDown.x, informDown.y, this.currentPlayerType, ( isDownSuccess ) => {
                if(isDownSuccess) {
                    this.next();
                }
            });
        },
        
        // 程序走一个落子步骤  
        stepForward: function() {
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

            // 调用 AI 算法落子 
            // 参数：落子回调，当前活动角色，可落子位置数组 
            const downChessFunction = this.downChessFunction;
            const boardData = this.boardData;
            this.getCurrentRole().downChess({ downChessFunction, boardData, currentPlayerType, canDownArr });
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
            const chessCount = this.getChessCountInfo();
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
