import {defineStore} from 'pinia'
import {useSelectStore} from "./select";
import {useDictStore} from "./dict";
import {useSettingStore} from "./setting";
import {useMessageStore} from "./message";
import {useComStore} from "./com";
import {__getChessTypeName, __nextChessType, createChess, getXyStr, hasChessXy} from "../algo/playing-chess/chess-funs";
import {getTranList} from "../algo/playing-chess/tran-funs";
import {getCanDownArray} from "../algo/playing-chess/board-calc";
import {
    __copyBoardData,
    __copyBoardDataToBack,
    forEachBoardData,
    getBoardXyCount,
    getChessByXy,
    getChessCountInfo
} from "../algo/playing-chess/board-funs";
import {createStep} from "../algo/playing-chess/step-funs";
import {chaosArray, copyProperty} from "../algo/playing-chess/common-util";

/**
 * 定义游戏进行时参数信息 
 */
export const useGameStore = defineStore({
    id: 'game',
    state: () => {
        return {
            isInit: false,  // 是否初始化
            currentPlayerType: 'black', // 当前执子玩家类型：black、white
            // 程序状态：notStarted=未开始，startDown 初始落子中，end=已结束，
            // judge=系统判断中，每次落子完毕，系统判断下一步程序流程 
            // blackDown=等待黑棋落子中，whiteDown=等待白棋落子 
            // pause=暂停中 
            status: 'notStarted',
            userDown: false,  // 此时此刻，是否允许用户落子
            stepPlayFrame: false, // 此时刺客是否正在播放“带动画下一步”
            xCount: 8,  // 棋盘行数
            yCount: 8,  // 棋盘列数
            boardData: null,    // 棋盘数据
            startChessList: [],   // 初始落子数据
            stepIndex: -1,   // 目前下到了第几步 
            stepList: [],   // 落子数据 
            // justX: 0,  // 最新落子x坐标
            // justY: 0,  // 最新落子y坐标
            showStrategyTreeWin: false,  // 显示策略树窗口
            // 黑子策略树
            strategyTree: [
                {
                    id: 'black-top',
                    type: 'black',
                    subjectType: 'black',
                    roleName: '',
                    showType: 'tran', // 显示类型：tran=翻转数量，score=打分，depth=深度打分
                    maxTranCount: 0, 
                    subjectMaxScore: 0,
                    subStrategyCount: 0,
                    nextChessCanArray: [],
                    costTime: 0, // 计算耗时
                },
                {
                    id: 'white-top',
                    type: 'white',
                    subjectType: 'white',
                    roleName: '',
                    showType: 'tran',
                    maxTranCount: 0,
                    subjectMaxScore: 0,
                    subStrategyCount: 0,
                    nextChessCanArray: [],
                    costTime: 0, // 计算耗时
                }
            ],  
            blackStrategyTreeInCall: false,  // 黑子策略树是否正在计算... 
            whiteStrategyTreeInCall: false,  // 白子策略树是否正在计算... 
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

                this.stepIndex = -1;
                
                // 显示初始落子
                this.status = 'startDown';
                sa.sendMessage('系统', 'info', '正在进行初始落子...');
                this.calcStartChessList();
                this.startChessListToBoardData_withAnim(0, () => {
                    
                    // 投递个消息，初始落子完毕
                    sa.sendMessage('系统', 'info', '初始落子完毕，对战开始...');
                    
                    // 镜像棋盘数据，用于回溯 
                    this.addStep(-1, -1, 'none', this.currentPlayerType, 'start');

                    // 黑棋开始下棋 
                    this.currentPlayerType = 'black';
                    this.status  = 'judge';
                });

            });
        },

        // 循环执行 
        loop: function () {
            
            const status = this.status;
            // console.log(status)
            
            if(status === 'notStarted') {
                return;
            }
            if(status === 'startDown') {
                return;
            }
            if(status === 'end') {
                return;
            }
            
            // 系统判断中 
            if(status === 'judge') {
                return this.programJudge(this.currentPlayerType);
            }
            
            // 等待黑棋落子  
            if(status === 'blackDown') {
                return ;
            }
            // 等待白棋落子 
            if(status === 'whiteDown') {
                return ;
            }
            // 程序暂停中 
            if(status === 'pause') {
                return ;
            }

            // 未知状态 
            console.log('未知状态：', status);
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
            this.xCount = xCount;
            this.yCount = yCount;
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
            const { xCount, yCount } = getBoardXyCount(this.boardData);
            const xCenter = parseInt(xCount / 2);
            const yCenter = parseInt(yCount / 2);

            // 中间默认落子数据 
            this.startChessList = [
                { x: xCenter + 1, y: yCenter, type: 'black' },
                { x: xCenter, y: yCenter, type: 'white' },
                { x: xCenter, y: yCenter + 1, type: 'black' },
                { x: xCenter + 1, y: yCenter + 1, type: 'white' },
            ];
            
            // 占四边
            const _addEdgeStrong = (chessType) => {
                for (let i = 1; i <= xCount; i++) {
                    this.startChessList.push({x: i, y: 1, type: chessType, startType: 'edge'});
                }
                for (let j = 2; j <= yCount - 1; j++) {
                    this.startChessList.push({x: xCount, y: j, type: chessType, startType: 'edge'});
                }
                for (let i = xCount; i >= 1; i--) {
                    this.startChessList.push({x: i, y: yCount, type: chessType, startType: 'edge'});
                }
                for (let j = xCount - 1; j >= 2; j--) {
                    this.startChessList.push({x: 1, y: j, type: chessType, startType: 'edge'});
                }
            }
            if(selectStore.blackEdgeStrong) {
                _addEdgeStrong('black');
            }
            if(selectStore.whiteEdgeStrong) {
                _addEdgeStrong('white');
            }

            // 占四角
            const _addHornStrong = (chessType) => {
                this.startChessList.push({x: 1, y: 1, type: chessType});
                this.startChessList.push({x: xCount, y: 1, type: chessType});
                this.startChessList.push({x: 1, y: yCount, type: chessType});
                this.startChessList.push({x: xCount, y: yCount, type: chessType});
            }
            if(selectStore.blackHornStrong) {
                _addHornStrong('black');
            }
            if(selectStore.whiteHornStrong) {
                _addHornStrong('white');
            }
            
            // 占一角
            const fourHornArray = [
                {x: 1, y: 1},
                {x: xCount, y: 1},
                {x: 1, y: yCount},
                {x: xCount, y: yCount},
            ]
            chaosArray(fourHornArray);
            if(selectStore.blackOneHornStrong) {
                this.startChessList.push({x: fourHornArray[0].x, y: fourHornArray[0].y, type: 'black'});
            }
            if(selectStore.whiteOneHornStrong) {
                this.startChessList.push({x: fourHornArray[1].x, y: fourHornArray[1].y, type: 'white'});
            }

            // 随机四子
            const _addRandomFourStrong = (chessType) => {
                const arr = [];
                for (let i = 0; i < 4; i++) {
                    const chess = {x: sa.randomNum(1, xCount), y: sa.randomNum(1, yCount), type: chessType};
                    // 防止随机到中间的初始化棋子，导致运气太好直接胜利 
                    if( hasChessXy(arr, chess) || ( (chess.x === xCenter || chess.x === xCenter + 1) && (chess.y === yCenter || chess.y === yCenter + 1) ) ) {
                        i--;
                        continue;
                    }
                    arr.push(chess);
                }
                this.startChessList.push(...arr);
            }
            if(selectStore.blackRandomFourStrong) {
                _addRandomFourStrong('black');
            }
            if(selectStore.whiteRandomFourStrong) {
                _addRandomFourStrong('white');
            }

        },

        // 将初始落子，更新棋盘数据 (无动画)
        startChessListToBoardData: function () {
            this.startChessList.forEach(item => {
                this.getChess(item.x, item.y).type = item.type;
            })
        },

        // 将初始落子，更新棋盘数据 (带动画，视觉上更流畅)
        startChessListToBoardData_withAnim: function (i, callback, sleepTime = 400) {
            setTimeout(() => {
                if(i >= this.startChessList.length) {
                    callback();
                    return;
                }

                const item = this.startChessList[i];
                this.getChess(item.x, item.y).type = item.type;
                i++;
                sleepTime = item.startType === 'edge' ? 150 : 400;
                // sleepTime = sleepTime - 20;
                // sleepTime = sleepTime < 100 ? 100 : sleepTime;
                this.startChessListToBoardData_withAnim(i, callback, sleepTime);
            }, useSelectStore().getSleep(sleepTime) )
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

        // 获取指定执子玩家 对应的角色
        getRole: function (playerType) {
            const dictStore = useDictStore();
            const selectStore = useSelectStore();
            if(playerType === 'black') {
                return dictStore.getRole(selectStore.blackRole);
            } else {
                return dictStore.getRole(selectStore.whiteRole);
            }
        },

        // 获取黑棋执子所属角色 
        getBlackRole: function () {
            return this.getRole('black');
        },

        // 获取白棋执子所属角色 
        getWhiteRole: function () {
            return this.getRole('white');
        },

        // 获取当前执子的所属角色 
        getCurrentRole: function () {
            return this.getRole(this.currentPlayerType);
        },

        // 获取指定id的角色
        getRoleById: function (id) {
            const dictStore = useDictStore();
            return dictStore.getRole(id);
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
        fingerMoveAnim: function (x, y, downType, downAnimType, callback){
            const comStore = useComStore();
            const selectStore = useSelectStore();
            
            // 判断此次应该用哪个手指进行落子 
            
            // 双 user 或 双 AI，必使用手指：黑子用 weFinger，白子用 enemyFinger
            if( (selectStore.blackRole === 'user' && selectStore.whiteRole === 'user') || (selectStore.blackRole !== 'user' && selectStore.whiteRole !== 'user') ){
                if(downType === 'black'){
                    return comStore.weFinger.down(x, y, downType, downAnimType, callback);
                } else {
                    return comStore.enemyFinger.down(x, y, downType, downAnimType, callback);
                }
            }
            
            // 黑子 AI，白子 user，黑手落子时使用 enemyFinger 手指 
            if(selectStore.blackRole !== 'user' && selectStore.whiteRole === 'user'){
                if(downType === 'black'){
                    return comStore.enemyFinger.down(x, y, downType, downAnimType, callback);
                } else {
                    return comStore.weFinger.down(x, y, downType, downAnimType, callback);
                }
            }
            
            // 黑子 user，白子 AI，白手落子时使用 enemyFinger 手指 
            if(selectStore.blackRole === 'user' && selectStore.whiteRole !== 'user'){
                if(downType === 'white'){
                    return comStore.enemyFinger.down(x, y, downType, downAnimType, callback);
                } else {
                    return comStore.weFinger.down(x, y, downType, downAnimType, callback);
                }
            }
        },
        
        // 在棋盘的指定位置落子，并在翻转所有棋子后回调一个函数 
        downChess_noneAnim: function (x, y, downType, callback) {

            const selectStore = useSelectStore();
            const chess = this.getChess(x, y);
            const playerTypeName = this.getPlayerTypeName( downType );

            // 判断该位置是否已经有棋子了，是否为覆盖落子
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
                    // this.showCanDownByConfig();
                    this.addStep(chess.x, chess.y, downType, downType, this.getCurrentRole().id);
                } else {
                    sa.sendMessage(playerTypeName, 'error', '这个地方已经有落子了，请更换落子位置！');
                }
                this.status = 'judge';
                return;
            }
            
            // 判断该位置是否是可落子的位置
            const tranArr = getTranList(this.boardData, chess.x, chess.y, downType);
            if(tranArr.length === 0 && !selectStore.allowForceDown){
                sa.sendMessage(playerTypeName, 'error', '此处不能落子！落子要求必须至少翻转一个对方棋子。');
                this.status = 'judge';
                return;
            }
            
            // 落子运算 
            // this.status = 'tran';
            
            // 清除提示信息：可落子提示、上一次的翻转落子样式、上一次的落子高亮提示 
            this.clearAllTips();
            
            // 打个标记，此棋子为刚刚落下的 
            chess.type = downType;
            chess.isJustDown = true;
            
            // 开始翻转棋子 
            sa.sendMessage(playerTypeName, 'info', `落子 ${getXyStr(x, y)}，回收棋子 ${tranArr.length} 枚。`);
            this.changeChessArrType_withAnim(tranArr, 0, () => {
                callback(true, chess);
            });
        },
        
        // 切换一组棋子类型（不带延迟动画）
        changeChessArrType: function (tranArr) {
            tranArr.forEach(item => {
                const chess = this.getChess(tranArr[i].x, tranArr[i].y);
                this.changeChessType(chess);
                chess.isJustTran = true;
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
            }, useSelectStore().getSleep(200) )
        },

        // 计算棋盘所有可落子位置 
        getCanDown: function () {
            return getCanDownArray(this.boardData, this.currentPlayerType);
        },

        // 计算并显示当前玩家的可落子位置 
        showCanDown: function () {
            // 先清除原来的 
            this.clearCanDownTips();
            nextTick(() => {
                setTimeout(() => {
                    const chessType = this.currentPlayerType;
                    this.getCanDown().forEach(chess => this.getChess(chess.x, chess.y).tipsType = chessType);
                }, 10);
            });
        },

        // 计算并显示当前玩家的可落子位置（根据 selectStore 里的配置，智能判断该不该显示） 
        showCanDownByConfig: function () {
            const selectStore = useSelectStore();
            if(selectStore.tipsDown && this.getCurrentRole().id === 'user') {
                this.showCanDown();
            }
        },

        // 清除所有可落子提示
        clearCanDownTips: function () {
            this.forEachBoardData(chess => {
                chess.tipsType = 'none';
            })
        },

        // 清除刚刚落下的棋子样式提示 
        clearJustDownTips: function () {
            this.forEachBoardData(chess => {
                chess.isJustDown = false;
            })
        },

        // 清除刚刚翻转的棋子样式提示 
        clearJustTranTips: function () {
            this.forEachBoardData(chess => {
                chess.isJustTran = false;
            })
        },

        // 一次性清除棋子所有样式提示 
        clearAllTips: function () {
            this.forEachBoardData(chess => {
                chess.tipsType = 'none';
                chess.isJustDown = false;
                chess.isJustTran = false;
            })
        },


        // ------------------------------ 棋子操作 ------------------------------ 

        // 切换一个棋子类型
        changeChessType: function (chess) {
            chess = this.getChess(chess.x, chess.y);
            if(chess.type === 'black'){
                chess.type = 'white';
            }
            else if(chess.type === 'white'){
                chess.type = 'black';
            }
        },
        
        
        // ------------------------------ 落子步骤记录 ------------------------------ 
        
        // 增加一个落子步骤 
        addStep: function (x, y, type, nextPlayerType, role) {
            this.stepIndex++;
            
            // 镜像一下棋盘数据 
            const boardData = __copyBoardData(this.boardData);
            const step = createStep(this.stepIndex, x, y, type, nextPlayerType, role, boardData);
            this.stepList.push(step);
            
            // 如果后面有着法，则清空后面的着法  
            while (this.stepIndex <  this.stepList.length - 1) {
                this.stepList.splice(this.stepIndex + 1, 1);
            }
            
        },

        // 后退一步
        stepBack: function() {
            if(this.stepIndex <= 0) {
                return sa.msg('已经最前了!');
            }
            if(this.stepPlayFrame) {
                return console.log('正在播放下一帧中，不可操作！');
            }
            this.status = 'pause';
            this.userDown = true;
            
            this.stepIndex--;
            const step = this.stepList[this.stepIndex];

            // sa.sendMessage('系统', 'warning', `后退一步！`);
            const stepNext = this.stepList[this.stepIndex + 1];
            if(stepNext.x === -1 && stepNext.y === -1) {
                sa.sendMessage('系统', 'warning', `后退一步！`);
            } else {
                sa.sendMessage('系统', 'warning', `后退一步：收回${__getChessTypeName(stepNext.type)}落子${getXyStr(stepNext)}`);
            }

            forEachBoardData(step.boardData, chess => {
                copyProperty(chess, this.getChess(chess.x, chess.y));
            })
            this.currentPlayerType = step.nextPlayerType;
            this.showCanDownByConfig();
        },

        // 前进一步
        stepForward: function() {
            if(this.stepIndex >= this.stepList.length - 1) {
                return sa.msg('已经最后了!');
            }
            if(this.stepPlayFrame) {
                return console.log('正在播放下一帧中，不可操作！');
            }
            this.status = 'pause';
            this.userDown = true;
            
            this.stepIndex++;
            const step = this.stepList[this.stepIndex];

            if(step.x === -1 && step.y === -1) {
                sa.sendMessage('系统', 'warning', `前进一步：${__getChessTypeName(step.type)}无处可落，${__getChessTypeName(step.nextPlayerType)}继续落子！`);
            } else {
                sa.sendMessage('系统', 'warning', `前进一步：${__getChessTypeName(step.type)}落子${getXyStr(step)}`);
            }
            
            forEachBoardData(step.boardData, chess => {
                copyProperty(chess, this.getChess(chess.x, chess.y));
            })
            this.currentPlayerType = step.nextPlayerType;
            this.showCanDownByConfig();
        },

        // 带动画前进一步 
        stepForward_withAnim: function() {
            if(this.stepIndex >= this.stepList.length - 1) {
                return sa.msg('已经最后了!');
            }
            if(this.stepPlayFrame) {
                return console.log('正在播放下一帧中，不可操作！');
            }
            this.status = 'pause';
            this.userDown = true;
            this.stepPlayFrame = true;
            
            this.stepIndex++;
            const step = this.stepList[this.stepIndex];
            
            const fn = () => {
                forEachBoardData(step.boardData, chess => {
                    copyProperty(chess, this.getChess(chess.x, chess.y));
                })
                this.currentPlayerType = step.nextPlayerType;
                this.showCanDownByConfig();
                this.stepPlayFrame = false;
            }
            
            if(step.x === -1 && step.y === -1) {
                sa.sendMessage('系统', 'warning', `前进一步：${__getChessTypeName(step.type)}无处可落，${__getChessTypeName(step.nextPlayerType)}继续落子！`);
                fn();
            } else {
                sa.sendMessage('系统', 'warning', `前进一步：${__getChessTypeName(step.type)}落子${getXyStr(step)}`);
                this.fingerMoveAnim(step.x, step.y, step.type, 'default', fn);
            }
        },

        // 判断上一步是否为指定棋子的“无子可落”
        prevIsSkip: function (chessType){
            const index = this.stepIndex - 1;
            if(index < 0) {
                return false;
            }
            const step = this.stepList[index];
            return step.type === chessType && step.x === -1 && step.y === -1;
        },

        // ------------------------------ 程序运转 ------------------------------ 

        // 用户手动落子调用的方法 
        userDownChess: function(x, y) {
            this.userDown = false;
            this.downChessFunction( { x, y }, this.currentPlayerType, 'none', true);
        },
        
        // 点击按钮，调用 AI 走棋
        aiDownChess: function() {
            let role = this.getRole(this.currentPlayerType);
            if(role.id === 'user') {
                role = this.getRoleById('qixian');
                const roleName = useDictStore().getRoleName(role.id, 'help');
                sa.sendMessage(this.getCurrentPlayerTypeName(), 'success', `调用 AI (${roleName}) 帮走棋！`);
            }
            // console.log(role.name + '帮走棋！');
            this.programJudge(this.currentPlayerType, role, true);
        },
        
        // 落子回调函数 
        downChessFunction: function(informDown, downChessType, downAnimType, isUserClick = false) {
            if(this.status === 'pause' && !isUserClick) {
                console.log('暂停中，，');
                return;
            }
            this.fingerMoveAnim(informDown.x, informDown.y, downChessType, downAnimType, () => {
                this.downChess_noneAnim(informDown.x, informDown.y, downChessType, ( isDownSuccess, chess ) => {
                    if(isDownSuccess) {
                        const nextPlayerType = __nextChessType(downChessType);
                        const downChessTypeRole = downChessType === 'black' ? this.getBlackRole() : this.getWhiteRole();
                        this.addStep(chess.x, chess.y, chess.type, nextPlayerType, downChessTypeRole.id);

                        // 延时一下，让用户有个缓冲观察时间 
                        setTimeout( () => {
                            if(this.status === 'pause') {
                                console.log('暂停中，，');
                                return;
                            }
                            this.currentPlayerType = nextPlayerType;
                            this.status = 'judge';
                        }, useSelectStore().getSleep(400));
                    }
                });
            });
        },
        
        // 调用程序行一步棋 
        programJudge: function(chessType, role, isUserClick) {
            // 获取当前玩家类型，和下一个玩家类型
            const chessTypeName = __getChessTypeName(chessType);
            const nextChessType = __nextChessType(chessType);
            const nextChessTypeName = __getChessTypeName(nextChessType);
            
            // 获取所有可落子位置
            const canDownArr = getCanDownArray(this.boardData, chessType);
            if(canDownArr.length === 0){

                // 如果双方均无子可落，则游戏结束 
                const nextCanDownArr = getCanDownArray(this.boardData, nextChessType);
                if(nextCanDownArr.length === 0){
                    sa.sendMessage('系统', 'warning', `双方无子可落，游戏结束！`);
                    this.endGame();
                    return;
                }

                // 加个记录，落子 -1,-1 代表黑子无子可落 
                this.addStep(-1, -1, chessType, nextChessType, this.getBlackRole().id);

                // 发个通知，让用户知道发生了什么 
                sa.sendMessage(chessTypeName, 'warning', `${chessTypeName}无处可落，${nextChessTypeName}继续落子！`);
                this.currentPlayerType = nextChessType;
                this.status = 'judge';
                return;
            }

            // 调用 role 落子 
            const downChessFunction = (informDown, downChessType, downAnimType, isUserDown) => {
                isUserDown = isUserClick ?? isUserDown;
                this.downChessFunction(informDown, downChessType, downAnimType, isUserDown);
            };
            const boardData = __copyBoardDataToBack(this.boardData);
            role = role ?? this.getRole(chessType);
            const downChessType = chessType;
            this.status = chessType === 'black' ? 'blackDown' : 'whiteDown'; // 状态改为等待落子 
            this.userDown = false;
            role.downChess({ downChessFunction, boardData, downChessType, canDownArr });
        },

        // 判断状态是否可自由调度，如果可以则执行一个回调函数，否则在消息打印机输出不可调度的原因
        statusIsFreeCallback: function(callback) {
            if(this.status === 'notStarted') {
                return sa.sendMessage('系统', 'warning', '游戏尚未开始...');
            }
            if(this.status === 'startDown') {
                return sa.sendMessage('系统', 'warning', '请等待初始棋子落子完毕。');
            }
            else if(this.status === 'end') {
                return sa.sendMessage('系统', 'success', '对局已结束！' + this.getEndJsStr());
            }
            else if(this.status === 'judge') {
                return sa.sendMessage('系统', 'warning', '系统判断中，请稍后操作...');
            }
            else if(this.status === 'blackDown' || this.status === 'whiteDown' || this.status === 'pause') {
                if(this.userDown) {
                    callback();
                } else {
                    const currPlayerTypeName = this.getCurrentPlayerTypeName();
                    sa.sendMessage('系统', 'warning', `请等待${currPlayerTypeName}落子完毕...`);
                }
            } else {
                console.log('未知状态,：', this.status);
            }
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
