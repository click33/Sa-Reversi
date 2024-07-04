// 深度迭代策略树，相关算法

import {__nextChessType, getXySimpleStr, getXyStr} from "./chess-funs";
import { __mockDownChess, calcStaticScore, getCanDownArray} from "./board-calc"; 
import {chaosArray, copyArray} from "./common-util";


/**
 * 计算策略树种每种策略的最终得分
 * @param boardData 棋盘数据
 * @param calcChessType 要计算的落子类型
 * @param iterationDepth 迭代深度（一般主UI线程填个3就顶天了，超过了容易直接卡死）
 */
export const calcStrategyTree = function (boardData, calcChessType, iterationDepth) {

    // 1、获取允许落哪些子
    let canDownArray = getCanDownArray(boardData, calcChessType);
    chaosArray(canDownArray);

    // 2、为每个落子策略，开始深度迭代 
    canDownArray = __mockDownChessAndCalcScore(canDownArray, boardData, calcChessType, 1, iterationDepth);

    // 3、为迭代好的策略树，计算最终得分 
    __calcTreeFinalScore_Method(canDownArray, calcChessType);

    // 4、最后，按照第一层的策略 subjectMaxScore 分数排序，从小到大 
    canDownArray.sort((a, b) => a.subjectMaxScore - b.subjectMaxScore);
    const minItem = canDownArray[0];
    const maxItem = canDownArray[canDownArray.length - 1];
    minItem.isMin = true;
    maxItem.isMax = true;

    // 5、返回最终排序好的策略树 
    return canDownArray;
}

/**
 * 计算数组中每个落子方案的得分 （会克隆新数组，不影响原来数据）
 * @param canDownArray 落子方案数组
 * @param boardData 棋盘数据
 * @param downChessType 要落子的棋子类型
 * @param currentDepth 当前深度
 * @param iterationDepth 总迭代深度
 * @returns {[]} 所有策略（但不包括得分） 
 */
export const __mockDownChessAndCalcScore = function (canDownArray, boardData, downChessType, currentDepth, iterationDepth) {

    canDownArray = copyArray(canDownArray);
    canDownArray.forEach(canDownChess => {

        const { downAfterBoard, tranArr } = __mockDownChess(boardData, canDownChess.x, canDownChess.y, downChessType);
        
        // 模拟落子 
        canDownChess.id = getXySimpleStr(canDownChess) + '__' + sa.randomString(16); // 策略树节点唯一标识符
        canDownChess.type = downChessType;  // 棋子类型 
        canDownChess.showType = 'depth';  // 策略树显示模式
        canDownChess.downAfterBoard = downAfterBoard;// 模拟落子后的棋盘样子
        canDownChess.tranCount = tranArr.length; // 回收棋子数量
        
        canDownChess.blackStaticScore = calcStaticScore(canDownChess.downAfterBoard, 'black');  // 此时的黑子盘面得分 
        canDownChess.whiteStaticScore = calcStaticScore(canDownChess.downAfterBoard, 'white');  // 此时的白子盘面得分 
        canDownChess.weStaticScore = canDownChess[`${canDownChess.type}StaticScore`];  // 此时落子方的盘面得分 
        // canDownChess.enemyStaticScore = canDownChess[`${__nextChessType(canDownChess.type)}StaticScore`];  // 此时落子方敌对方的盘面得分 
        
        canDownChess.blackLeadScore = canDownChess.blackStaticScore - canDownChess.whiteStaticScore;  // 黑子领先得分 
        canDownChess.whiteLeadScore = canDownChess.whiteStaticScore - canDownChess.blackStaticScore;  // 白子领先得分 
        canDownChess.weLeadScore = canDownChess[`${canDownChess.type}LeadScore`];  // 此时落子方的领先得分 
        // canDownChess.enemyLeadScore = canDownChess[`${__nextChessType(canDownChess.type)}LeadScore`];  // 此时落子方敌对方的领先得分 
        
        canDownChess.currentDepth = canDownChess.currentDepth ?? currentDepth ?? 1;  // 当前迭代深度 

        // 计算迭代深度是否已完成 
        // currentDepth = currentDepth ?? 1;
        // currentDepth ++;
        if (canDownChess.currentDepth >= iterationDepth) {
            return;
        }

        // 向更深层迭代 
        // 此时对手应该的应对策略，继续向深层迭代
        const nextChessType = __nextChessType(canDownChess.type);
        const nextChessCanArray = getCanDownArray(canDownChess.downAfterBoard, nextChessType);
        // 如果没有落子方案，说明对手无子可落，塞个 x=-1, y=-1 的特殊对象进去 
        if(nextChessCanArray.length === 0) {
            const notDownChess = {
                x: -1, 
                y: -1, 
                type: nextChessType,
                tranCount: 0,
            }
            nextChessCanArray.push(notDownChess);
        }
        chaosArray(nextChessCanArray);
        canDownChess.nextChessCanArray = __mockDownChessAndCalcScore(nextChessCanArray, canDownChess.downAfterBoard, nextChessType, canDownChess.currentDepth + 1, iterationDepth);
    })

    return canDownArray;
}

/**
 * 为策略树中，每种策略计算最终得分（操作原数组，无需接受返回值）
 * @param canDownArray 策略树方案
 * @param chessType 棋子类型，指定是在为谁计算 
 */
export const __calcTreeFinalScore_Method = function (canDownArray, chessType) {

    canDownArray.forEach(canDownChess => {
        // nextChessCanArray 不存在，或者为空数组，则说明已经遍历到了叶子节点，直接计算最终得分 
        if (!canDownChess.nextChessCanArray || canDownChess.nextChessCanArray.length === 0) {
            
            canDownChess.subjectType = chessType;  // 计算主体 棋子类型 
            canDownChess.subjectMaxScore = canDownChess[`${chessType}LeadScore`];  // 计算主体 最大得分
            canDownChess.subStrategyCount = 1; // 子孙策略数量
            
        } else {
            // 否则，继续向下迭代 
            __calcTreeFinalScore_Method(canDownChess.nextChessCanArray, chessType);

            // 按照 subjectMaxScore 值排序，从小到大 
            canDownChess.nextChessCanArray.sort((a, b) => a.subjectMaxScore - b.subjectMaxScore);

            // 比较：要求的 chessType 类型，和子策略组的 type 类型是否一致，
            //      如果一致：   代表子策略是己方行棋，取 subjectMaxScore 最高分 
            //      如果不一致： 代表子策略是对方行棋，取 subjectMaxScore 最低分（即：假设对手选择最优落子法）
            const childChessType = canDownChess.nextChessCanArray[0].type;
            canDownChess.subjectType = chessType;  // 计算主体 棋子类型 
            
            // 最低分和最高分
            const minItem = canDownChess.nextChessCanArray[0];
            const maxItem = canDownChess.nextChessCanArray[canDownChess.nextChessCanArray.length - 1];
            minItem.isMin = true;
            maxItem.isMax = true;
            if (chessType === childChessType) {
                canDownChess.subjectMaxScore = maxItem.subjectMaxScore;
            } else {
                canDownChess.subjectMaxScore = minItem.subjectMaxScore;
            }
            
            // 子孙策略数量
            canDownChess.subStrategyCount = 0;
            canDownChess.nextChessCanArray.forEach(item => {
                canDownChess.subStrategyCount += item.subStrategyCount;
            })

        }

    })

}

// 在控制台格式化打印策略树 （树深度超过3层时会非常费劲，打印半天打不完，还容易卡死，谨慎调用）
export const printStrategyTree = function (strategyTree, tStr = '') {
    strategyTree.forEach(item => {
        console.log(tStr + getXyStr(item) + ' ' + item.type, item.subjectMaxScore, item);
        if (item.nextChessCanArray) {
            printStrategyTree(item.nextChessCanArray, tStr + '\t');
        }
    })
};
