// 将策略树数据显示在控制台上的相关 
import {useGameStore} from "../../store/game";
import {useComStore} from "../../store/com";
import {__mockDownChess} from "./board-calc";
import {__copyBoardDataToBack, getBoardToString} from "./board-funs";

// 显示翻转棋子数量策略树
export const showTranStrategyTree = (canDownArr, chessType, roleName) => {
    const gameStore = useGameStore();
    if(gameStore.showStrategyTreeWin === false) {
        return;
    }
    
    // 排序 
    canDownArr = canDownArr.sort((a, b) => a.tranCount - b.tranCount);

    // 拿到引用 
    const strategyTreeItem = chessType === 'black' ? gameStore.strategyTree[0] : gameStore.strategyTree[1];
    strategyTreeItem.showType = 'tran'; // 简单模式 
    canDownArr.forEach(item => {
        item.showType = 'tran';
        const { downAfterBoard } = __mockDownChess(gameStore.boardData, item.x, item.y, chessType);
        item.downAfterBoard = downAfterBoard;
    });
    strategyTreeItem.roleName = roleName;

    // 计算子孙策略数量
    strategyTreeItem.subStrategyCount = canDownArr.length;
    
    // 最大值和最小值 
    canDownArr[0].isMin = true;
    canDownArr[canDownArr.length - 1].isMax = true;

    // 子策略最大回收数量 
    strategyTreeItem.maxTranCount = canDownArr[canDownArr.length - 1].tranCount;

    // 子策略树集合 
    strategyTreeItem.nextChessCanArray = canDownArr;

    // 刷新顶级节点，使策略树重新渲染，重新懒加载 
    const comStore = useComStore();
    comStore.strategyTree.refreshFirstNode(chessType);

    // 使顶级节点展开 
    nextTick(function () {
        comStore.strategyTree.expandTree(chessType);
    })

}

// 显示打分策略树
export const showScoreStrategyTree = (canDownArr, chessType, roleName) => {
    const gameStore = useGameStore();
    if(gameStore.showStrategyTreeWin === false) {
        return;
    }

    // 排序 
    canDownArr = canDownArr.sort((a, b) => a.score - b.score);

    // 拿到引用 
    const strategyTreeItem = chessType === 'black' ? gameStore.strategyTree[0] : gameStore.strategyTree[1];
    strategyTreeItem.showType = 'score'; // 一般模式 
    canDownArr.forEach(item => {
        item.showType = 'score';
        item.subjectType = chessType;
        const { downAfterBoard } = __mockDownChess(gameStore.boardData, item.x, item.y, chessType);
        item.downAfterBoard = downAfterBoard;
    });
    strategyTreeItem.roleName = roleName;

    // 计算子孙策略数量
    strategyTreeItem.subStrategyCount = canDownArr.length;

    // 最大值和最小值 
    canDownArr[0].isMin = true;
    canDownArr[canDownArr.length - 1].isMax = true;

    // 子策略最大得分
    strategyTreeItem.subjectMaxScore = canDownArr[canDownArr.length - 1].score;

    // 子策略树集合 
    strategyTreeItem.nextChessCanArray = canDownArr;

    // 刷新顶级节点，使策略树重新渲染，重新懒加载 
    const comStore = useComStore();
    comStore.strategyTree.refreshFirstNode(chessType);

    // 使顶级节点展开 
    nextTick(function () {
        comStore.strategyTree.expandTree(chessType);
    })

}

// 显示深度计算的策略树
export const showDepthStrategyTree = (strategyTree, chessType, roleName) => {
    const gameStore = useGameStore();
    if(gameStore.showStrategyTreeWin === false) {
        return;
    }

    // 拿到引用 
    const strategyTreeItem = chessType === 'black' ? gameStore.strategyTree[0] : gameStore.strategyTree[1];
    strategyTreeItem.showType = 'depth'; // 评分模式 
    strategyTreeItem.roleName = roleName;
    
    // 计算子孙策略数量
    strategyTreeItem.subStrategyCount = 0;
    strategyTree.forEach(item => {
        strategyTreeItem.subStrategyCount += item.subStrategyCount;
    });

    // 子策略最大得分
    strategyTreeItem.subjectMaxScore = strategyTree[strategyTree.length - 1].subjectMaxScore;
    
    // 子策略树集合 
    strategyTreeItem.nextChessCanArray = strategyTree;

    // 刷新顶级节点，使策略树重新渲染，重新懒加载 
    const comStore = useComStore();
    comStore.strategyTree.refreshFirstNode(chessType);
    
    // 使顶级节点展开 
    nextTick(function () {
        comStore.strategyTree.expandTree(chessType);
    })
    
}


// 显示深度计算的策略树 - 的耗时 
export const showDepthStrategyTreeCostTime = (chessType, costTime) => {
    const gameStore = useGameStore();
    if(gameStore.showStrategyTreeWin === false) {
        return;
    }
    const comStore = useComStore();
    const strategyTreeItem = chessType === 'black' ? gameStore.strategyTree[0] : gameStore.strategyTree[1];
    strategyTreeItem.costTime = costTime;
    comStore.strategyTree.showCostTime(chessType, costTime);
}

