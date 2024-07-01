// 简单行棋策略计算相关函数 

import {createBackChess, getXyStr, hasChessXy} from "./chess-funs";
import {getTranList} from "./tran-funs";
import {getBoardXyCount} from "./board-funs";

const scoreMap = {
    'jiao': 15,  // 四角，15分 
    'jiaoPang': 0,  // 四角旁边，0分 
    'bian': 6, // 边，5分 
    'ciBian': -2, // 次边  
    'ciJiao': -10, // 次角，角的斜对位置
    'normal': 1, // 普通位置，1分 
}

// 计算数组中每个落子方案的得分 
export const calcCanArrScore = function (canArr, xCount, yCount) {

    canArr.forEach(item => {
        item.score = item.tranCount + calcXyScore(item, xCount, yCount);
    })
    
    return canArr;
}

// 计算数组中每个落子方案的得分（连带着翻转的棋子一起计算）
export const calcCanArrScore2 = function (canArr, boardData, chessType) {

    const { xCount, yCount } = getBoardXyCount(boardData);
    
    canArr.forEach(downChess => {
        // 落子位置所得分 
        const downChessScore = calcXyScore(downChess, xCount, yCount);

        // 翻转棋子所有位置总得分 
        const mockDownChess = createBackChess(downChess.x, downChess.y, chessType);
        const mockTranArr = getTranList(boardData, mockDownChess.x, mockDownChess.y, mockDownChess.type);
        let tranChessScore = 0;
        mockTranArr.forEach(item => {
            tranChessScore += calcXyScore(item, xCount, yCount);
        })

        // 总得分 = 落子所得分 + 翻转棋子总所得分
        downChess.downChessScore = downChessScore;
        downChess.tranChessScore = tranChessScore;
        downChess.score = downChessScore + tranChessScore;
        // downChess.score = downChess.tranCount + downChessScore + tranChessScore;
        // console.log(downChess.x, downChess.y, '落子得分：' + downChessScore, '翻转子得分：' + tranChessScore, '总得分：' + downChess.score);
    })

    return canArr;
}

// 计算指定坐标位置棋子的所属符位
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
    if( hasChessXy(jiaoArr, item) ){
        return 'jiao';
    }

    // 是否在四角旁边
    const jiaoPangArr = [
        {x: 1, y: 2}, {x: 2, y: 1},
        {x: xCount - 1, y: 1}, {x: xCount, y: 2},
        {x: 2, y: yCount}, {x: 1, y: yCount - 1},
        {x: xCount - 1, y: yCount}, {x: xCount, y: yCount - 1},
    ];
    if( hasChessXy(jiaoPangArr, item) ){
        return 'jiaoPang';
    }
    
    // 是否在次角 
    const ciJiaoArr = [
        {x: 2, y: 2},
        {x: xCount - 1, y: 2},
        {x: 2, y: yCount - 1},
        {x: xCount - 1, y: yCount - 1}
    ];
    if( hasChessXy(ciJiaoArr, item) ){
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

// 在 f12 控制台打印 canDownArr
export const printCanDownArray = function (canDownArr) {
    console.log('------------- 策略集合 --------------')
    canDownArr.forEach(item => {
        console.log(`${getXyStr(item)}，回收棋子${item.tranCount}枚，落子评分：${item.score}`, item);
    });
}
