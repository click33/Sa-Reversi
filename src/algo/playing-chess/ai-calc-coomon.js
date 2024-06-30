// AI 计算相关工具函数 2.0 版本 

import {useGameStore} from "../../store/game";
import {useDictStore} from "../../store/dict";

const scoreMap = {
    'jiao': 30,  // 四角，30分 
    'jiaoPang': 10,  // 四角旁边，10分 
    'bian': 15, // 边，15分 
    'ciBian': -5, // 次边  
    'ciJiao': -15, // 次角，角的斜对位置
    'normal': 1, // 普通位置，1分 
}

/**
 * 计算策略树种每种策略的最终得分
 * @param boardData 棋盘数据
 * @param calcChessType 要计算的落子类型
 * @param iterationDepth 迭代深度 
 */
export const calcStrategyTree = function (boardData, calcChessType, iterationDepth) {
    
    // 1、获取允许落哪些子
    let canDownArray = getCanDownArray(boardData, calcChessType);
    __randomChaosChessArray(canDownArray);
    
    // 2、为每个落子策略，开始深度迭代 
    canDownArray = __mockDownChessAndCalcScore(canDownArray, boardData, calcChessType, 1, iterationDepth);
    
    // 3、为迭代好的策略树，计算最终得分 
    __calcTreeFinalScore_Method(canDownArray, calcChessType);

    // 4、最后，按照第一层的策略 finalScore 分数排序，从小到大 
    canDownArray.sort((a, b) => a.finalScore - b.finalScore);
    const minItem = canDownArray[0];
    const maxItem = canDownArray[canDownArray.length - 1];
    minItem.isMin = true;
    maxItem.isMax = true;
    
    // 5、返回最终排序好的策略树 
    return canDownArray;
}

// 计算策略树种每种策略的最终得分 
export const __calcTreeFinalScore_Method = function (canDownArray, chessType) {
    
    canDownArray.forEach(canDownChess => {
        // nextChessCanArray 不存在，或者为空数组，则说明已经遍历到了叶子节点，直接计算最终得分 
        if(!canDownChess.nextChessCanArray || canDownChess.nextChessCanArray.length === 0) {
            const enemyChessType = __nextChessType(chessType);
            canDownChess.blackFinalScore = canDownChess.blackLeadScore;  // 黑子最终得分 
            canDownChess.whiteFinalScore = canDownChess.whiteLeadScore;  // 白子最终得分 
            // 最终得分 
            canDownChess.finalScore = canDownChess[`${chessType}FinalScore`];  
        } else {
            // 否则，继续向下迭代 
            __calcTreeFinalScore_Method(canDownChess.nextChessCanArray, chessType);
            
            // 按照 finalScore 值排序，从小到大 
            canDownChess.nextChessCanArray.sort((a, b) => a.finalScore - b.finalScore);
            
            // 比较：要求的 chessType 类型，和子策略组的 nextChessType 类型是否一致，
            //      如果一致：   代表子策略是己方行棋，取 weFinalScore 最高分 
            //      如果不一致： 代表子策略是对方行棋，取 weFinalScore 最低分（即：假设对手选择最优落子法）
            const nextChessType = canDownChess.nextChessCanArray[0].type;
            // 最低分和最高分
            const minItem = canDownChess.nextChessCanArray[0];
            const maxItem = canDownChess.nextChessCanArray[canDownChess.nextChessCanArray.length - 1];
            minItem.isMin = true;
            maxItem.isMax = true;
            if(chessType === nextChessType) {
                canDownChess.finalScore = maxItem.finalScore;
            } else {
                canDownChess.finalScore = minItem.finalScore;
            }
            // 子孙策略数量
            canDownChess.subStrategyCount = 0;
            canDownChess.nextChessCanArray.forEach(item => {
                canDownChess.subStrategyCount += item.subStrategyCount ?? 1;
            })

        }
        
    })
    
}

// canDownChess.blackFinalScore = canDownChess.nextChessCanArray[canDownChess.nextChessCanArray.length - 1].blackFinalScore;

// 计算数组中每个落子方案的得分 （会克隆新数组，不影响原来数据）
// currentDepth = 当前深度，iterationDepth = 迭代深度 
export const __mockDownChessAndCalcScore = function (canDownArray, boardData, downChessType, currentDepth, iterationDepth) {

    canDownArray = __copyChessArray(canDownArray);
    canDownArray.forEach(canDownChess => {
        // 模拟落子 
        canDownChess.id = getXySimpleStr(canDownChess) + '__' + sa.randomString(16);
        canDownChess.type = downChessType;
        canDownChess.downAfterBoard = __mockDownChess(boardData, canDownChess.x, canDownChess.y, canDownChess.type); // 模拟落子后的棋盘样子
        canDownChess.tranCount = canDownChess.downAfterBoard.tranArr.length; // 回收棋子数量
        canDownChess.blackFullScore = calcScoreByFullChess(canDownChess.downAfterBoard, 'black');  // 此时的黑子盘面得分 
        canDownChess.whiteFullScore = calcScoreByFullChess(canDownChess.downAfterBoard, 'white');  // 此时的白子盘面得分 
        canDownChess.blackLeadScore = canDownChess.blackFullScore - canDownChess.whiteFullScore;  // 黑子领先得分 
        canDownChess.whiteLeadScore = canDownChess.whiteFullScore - canDownChess.blackFullScore;  // 白子领先得分 
        canDownChess.currentDepth = canDownChess.currentDepth ?? currentDepth ?? 1;  // 当前迭代深度 
        
        // 计算迭代深度是否已完成 
        // currentDepth = currentDepth ?? 1;
        // currentDepth ++;
        if(canDownChess.currentDepth >= iterationDepth) {
            return;
        }

        // 向更深层迭代 
        // 此时对手应该的应对策略，继续向深层迭代
        const nextChessType = __nextChessType(canDownChess.type);
        const nextChessCanArray = getCanDownArray(canDownChess.downAfterBoard, nextChessType);
        __randomChaosChessArray(nextChessCanArray);
        canDownChess.nextChessCanArray = __mockDownChessAndCalcScore(nextChessCanArray, canDownChess.downAfterBoard, nextChessType, canDownChess.currentDepth + 1, iterationDepth);
    })
    
    return canDownArray;
}

// 在控制台格式化打印策略树 
export const printStrategyTree = function (strategyTree, tStr = '') {
    strategyTree.forEach(item => {
        console.log(tStr + getXyStr(item) + ' ' + item.type, item.finalScore, item);
        if(item.nextChessCanArray) {
            printStrategyTree(item.nextChessCanArray, tStr + '\t');
        }
    })
};




// 计算整个棋盘指定类型棋子的总得分 
export const calcScoreByFullChess = function (boardData, chessType) {
    const { xCount, yCount } = getBoardXyCount(boardData);
    let score = 0;
    forEachBoardData(boardData, chess => {
        if(chess.type === chessType) {
            score += calcXyScore(chess, xCount, yCount);
        }
    })
    return score;
}






// 计算棋盘宽高数量
export const getBoardXyCount = function (boardData) {
    const xCount = boardData.length - 1;
    const yCount = boardData[1].length - 1;
    return { xCount, yCount };
}

// 获取指定坐标的棋子
export const getChessByXy = function (boardData, x, y) {
    return boardData[y][x];
};

// 设置指定坐标的棋子
export const setChessByXy = function (boardData, x, y, chess) {
    return boardData[y][x] = chess;
};

// 遍历棋盘所有格子 (只遍历棋盘数据，不包括填充格)
export const forEachBoardData = function(boardData, callback){
    boardData.forEach(tr => {
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
};

// 模拟落子，返回落子后翻转应有旗子后的棋盘数据（会copy一份棋盘数据，不会变动原棋盘数据）
export const __mockDownChess = function(boardData, x, y, downType){
    const copyBoardData = __copyBoardData(boardData);
    
    // 获取棋盘宽高等数据 
    const chess = createChess(x, y, downType);
    const { xCount, yCount } = getBoardXyCount(copyBoardData);

    // 计算落子后棋子翻转所有位置
    const tranArr = getTranList(chess.x, chess.y, downType, copyBoardData, xCount, yCount);
    
    // 模拟落子，将棋子移动到指定位置
    setChessByXy(copyBoardData, x, y, chess);
    tranArr.forEach(item => {
        item.type = downType;
        setChessByXy(copyBoardData, item.x, item.y, item);
    });

    copyBoardData.tranArr = tranArr; // 回收棋子数量给 return 出去 
    return copyBoardData;
};

// 拷贝棋盘所有格子 (只拷贝棋盘数据，不包括填充格)
export const __copyBoardData = function(boardData){
    const copyBoardData = [];
    boardData.forEach(tr => {
        if(tr.type === 'fill') {
            const copyTr = JSON.parse(JSON.stringify(tr));
            copyBoardData.push(copyTr);
            return;
        }
        const copyTr = [];
        tr.forEach(td => {
            const copyTd = JSON.parse(JSON.stringify(td));
            copyTr.push(copyTd);
        })
        copyBoardData.push(copyTr);
    });
    return copyBoardData;
};

// 拷贝一组棋子
export const __copyChessArray = function(chessArray){
    const newChessArray = [];
    chessArray.forEach(item => {
        const copyItem = JSON.parse(JSON.stringify(item));
        newChessArray.push(copyItem);
    });
    return newChessArray;
};

// 随机打乱一组棋子
export const __randomChaosChessArray = function(chessArray){
    chessArray.sort((a, b) => Math.random() - 0.5);
};

// 拷贝一个棋子
export const __copyChess = function(chess){
    return JSON.parse(JSON.stringify(chess));
};


// 计算指定坐标位置棋子得分 
export const calcXyScore = function (item, xCount, yCount) {
    const xyFuWeiName = calcXyFuWeiName(item, xCount, yCount);
    return scoreMap[xyFuWeiName];
}

// 计算指定坐标位置棋子的所属符位名称 
export const calcXyFuWeiName = function (item, xCount, yCount) {
    
    // 是否在四个角
    const jiaoArr = [ 
        {x: 1, y: 1}, 
        {x: xCount, y: 1}, 
        {x: 1, y: yCount}, 
        {x: xCount, y: yCount} 
    ];
    if( hasXy(jiaoArr, item) ){
        return 'jiao';
    }

    // 是否在四角旁边
    const jiaoPangArr = [
        {x: 1, y: 2}, {x: 2, y: 1},
        {x: xCount - 1, y: 1}, {x: xCount, y: 2},
        {x: 2, y: yCount}, {x: 1, y: yCount - 1},
        {x: xCount - 1, y: yCount}, {x: xCount, y: yCount - 1},
    ];
    if( hasXy(jiaoPangArr, item) ){
        return 'jiaoPang';
    }
    
    // 是否在次角 
    const ciJiaoArr = [
        {x: 2, y: 2},
        {x: xCount - 1, y: 2},
        {x: 2, y: yCount - 1},
        {x: xCount - 1, y: yCount - 1}
    ];
    if( hasXy(ciJiaoArr, item) ){
        return 'ciJiao';
    }

    const x = item.x;
    const y = item.y;
    
    // 是否在边 
    if( x === 1 || x === xCount || y === 1 || y === yCount ) {
        return 'bian';
    }
    // 是否在次边 
    if( x === 2 || x === xCount - 1 || y === 2 || y === yCount - 1 ) {
        return 'ciBian';
    }
    
    // 都不是，那就只能是普通位置了 
    return 'normal';
}

// arr 中是否包含 item 
const hasXy = function (arr, item2) {
    for (const item of arr) {
        if(equalsXy(item, item2)) {
            return true;
        }
    }
    return false;
}
// 两个item坐标是否相同
const equalsXy = function (item, item2) {
    return item.x === item2.x && item.y === item2.y;
}

// 获取坐标的字符串描写形式 
export const getXyStr = function (x, y) {
    const dictStore = useDictStore();
    if(x && x.x) {
        return '(' + dictStore.xName[x.x] + ', ' + x.y + ')';
    }
    return '(' + dictStore.xName[x] + ', ' + y + ')';
};

// 获取坐标的字符串描写形式 
export const getXySimpleStr = function (x, y) {
    const dictStore = useDictStore();
    if(x && x.x) {
        return dictStore.xName[x.x] + ',' + x.y;
    }
    return dictStore.xName[x] + ',' + y;
};

// 获取一个棋盘的字符串描写形式 
export const getBoardToString = function (boardData) {
    let fullStr = '';
    boardData.forEach(tr => {
        if(tr.type === 'fill') {
            return;
        }
        let trStr = '';
        tr.forEach(td => {
            if(td.type === 'fill') {
                return;
            }
            trStr += getXySimpleStr(td) + '' + chessTypeToChar(td.type) + '\t';
        })
        fullStr += trStr + '\n';
    });
    return fullStr;
};

// 棋子类型，单个字符描述 
export const chessTypeToChar = function (chessType){
    if(chessType === 'black') {
        return '●';
    }
    if(chessType === 'white') {
        return '○';
    }
    return '  ';
}

// 计算下一个棋子类型 
export const __nextChessType = function (type) {
    if(type === 'black') {
        return 'white';
    }
    return 'black';
}

// 创建一个棋子数据
export const createChess = function (x, y, type, tipsType) {
    tipsType = tipsType ?? 'none';
    return {
        x,   // x轴坐标 
        y,  // y轴坐标 
        type,  // 棋子类型 
        tipsType,  // 提示类型
        tranCount: 0,  // 此处落子可翻转的棋子数量
        score: 0,  // 此处落子可得评分 
    }
};




// ------- 从 tran 复制过来的 

// 计算一个棋盘中，指定棋子类型，所有可落子位置，返回的是棋子副本对象列表，非棋盘原数据
export const getCanDownArray = function (boardData, chessType) {
    const { xCount, yCount } = getBoardXyCount(boardData);
    const canDownArr = [];

    // 遍历所有棋子，计算每个格子是否可以落子
    forEachBoardData(boardData, chess => {
        if(chess.type !== 'none'){
            return;
        }
        // 假设在此处落子，有超过1个棋子是可以转换的，则代表此处可以落子
        const mockDownChess = __copyChess(chess);
        const mockTranArr = getTranList(chess.x, chess.y, chessType, boardData, xCount, yCount);
        if(mockTranArr.length > 0){
            mockDownChess.tranCount = mockTranArr.length;
            canDownArr.push(mockDownChess);
        }
    })

    // 
    return canDownArr;
};

// 指定坐标落子后，计算需要翻转的棋子坐标列表 
export const getTranList = (downX, downY, downType, boardData, xCount, yCount) => {

    // 
    const mockDownChess = createChess(downX, downY, downType);

    // 上 
    let topArr = [mockDownChess];
    for (let y = downY - 1; y >= 1; y--) {
        const item = getChessByXy(boardData, downX, y);
        if(isDownChess(item))
            topArr.push(item)
        else
            break;
    }
    // 下
    let bottomArr = [mockDownChess];
    for (let y = downY + 1; y <= yCount; y++) {
        const item = getChessByXy(boardData, downX, y);
        if(isDownChess(item))
            bottomArr.push(item)
        else
            break;
    }
    // 左 
    let leftArr = [mockDownChess];
    for (let x = downX - 1; x >= 1; x--) {
        const item = getChessByXy(boardData, x, downY);
        if(isDownChess(item))
            leftArr.push(item)
        else
            break;
    }
    // 右
    let rightArr = [mockDownChess];
    for (let x = downX + 1; x <= xCount; x++) {
        const item = getChessByXy(boardData, x, downY);
        if(isDownChess(item))
            rightArr.push(item)
        else
            break;
    }
    // 左上
    let topLeftArr = [mockDownChess];
    for (let x = downX - 1, y = downY - 1; x >= 1 && y >= 1; x--, y--) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            topLeftArr.push(item)
        else
            break;
    }
    // 右上 
    let topRightArr = [mockDownChess];
    for (let x = downX + 1, y = downY - 1; x <= xCount && y >= 1; x++, y--) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            topRightArr.push(item)
        else
            break;
    }
    // 左下
    let bottomLeftArr = [mockDownChess];
    for (let x = downX - 1, y = downY + 1; x >= 1 && y <= yCount; x--, y++) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            bottomLeftArr.push(item)
        else
            break;
    }
    // 右下
    let bottomRightArr = [mockDownChess];
    for (let x = downX + 1, y = downY + 1; x <= xCount && y <= yCount; x++, y++) {
        const item = getChessByXy(boardData, x, y);
        if(isDownChess(item))
            bottomRightArr.push(item)
        else
            break;
    }

    // 返回所有需要转换的落子坐标列表 
    const topTranArr = getShouldTran(topArr);
    const bottomTranArr = getShouldTran(bottomArr);
    const leftTranArr = getShouldTran(leftArr);
    const rightTranArr = getShouldTran(rightArr);
    const topLeftTranArr = getShouldTran(topLeftArr);
    const topRightTranArr = getShouldTran(topRightArr);
    const bottomLeftTranArr = getShouldTran(bottomLeftArr);
    const bottomRightTranArr = getShouldTran(bottomRightArr);

    const tranArr = [...topTranArr, ...bottomTranArr, ...leftTranArr, ...rightTranArr, ...topLeftTranArr, ...topRightTranArr, ...bottomLeftTranArr, ...bottomRightTranArr];
    return __copyChessArray(tranArr);
}

/**
 * 判断一个格子是否已经落子
 */
export const isDownChess = chess => {
    if ( chess &&  (chess.type === 'black' || chess.type === 'white') ) {
        return true;
    }
    return false;
}

/**
 * 返回一组落子中，应该发生转换的落子
 */
export const getShouldTran = arr => {
    // 数组长度小于3时，肯定不会发生转换 
    if(arr.length < 3) {
        return [];
    }

    // 
    const firstType = arr[0].type;
    const tranArr = [];
    for (let i = 1; i < arr.length; i++) {
        const item = arr[i];
        // 状态不一样，应该发生转换
        if(item.type !== firstType) {
            tranArr.push(item);
        }
        // 状态一样了，应该停止遍历了，把已经收集到的坐标数据返回 
        if(item.type === firstType) {
            return tranArr;
        }
    }

    // 如果 for 循环走完，说明截止到数组末尾，都没有遇到 firstType 状态的棋子，此时不应该发生转换，返回空数组
    return [];
}
