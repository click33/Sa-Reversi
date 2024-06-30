// AI 计算相关工具函数 2.0 版本 

import {getTranList} from "./ai-calc-coomon";
import {useGameStore} from "../../store/game";

const scoreMap = {
    'jiao': 15,  // 四角，15分 
    'jiaoPang': 0,  // 四角旁边，0分 
    'bian': 6, // 边，5分 
    'ciBian': -2, // 次边  
    'ciJiao': -10, // 次角，角的斜对位置
    'normal': 1, // 普通位置，1分 
}

// 计算数组中每个落子方案的得分 
export const calcCanArrScore2 = function (canArr, boardData, chessType, xCount, yCount) {

    const gameStore = useGameStore();
    console.log('canArr ', canArr)

    canArr.forEach(downChess => {
        // 落子位置所得分 
        const downChessScore = calcXyScore(downChess, xCount, yCount);
        
        // 翻转棋子所有位置总得分 
        const mockDownChess = gameStore.createChess(downChess.x, downChess.y, chessType, 'none');
        const mockTranArr = getTranList(mockDownChess.x, mockDownChess.y, mockDownChess.type, boardData, xCount, yCount);
        let tranChessScore = 0;
        mockTranArr.forEach(item => {
            tranChessScore += calcXyScore(item, xCount, yCount);
        })
        
        // 总得分 = 翻转棋子数量 + 落子所得分 + 翻转棋子总所得分
        downChess.score = downChessScore + tranChessScore;
        // downChess.score = downChess.tranCount + downChessScore + tranChessScore;
        console.log(downChess.x, downChess.y, '落子得分：' + downChessScore, '翻转子得分：' + tranChessScore, '总得分：' + downChess.score);
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
