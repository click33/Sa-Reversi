import {useGameStore} from "../../store/game";
import {calcStrategyTree} from "../playing-chess/depth-strategy";
import {showDepthStrategyTree, showDepthStrategyTreeCostTime} from "../playing-chess/strategy-show-funs";
import {useSelectStore} from "../../store/select";

/**
 * AI：棋仙陪练，行棋算法 
 */
export default {
    id: 'qixian',
    name: '棋仙',
    // 落子
    downChess: function ({ downChessFunction, boardData, downChessType, canDownArr }) {

        const gameStore = useGameStore();
        gameStore[`${downChessType}StrategyTreeInCall`] = true;

        setTimeout(() => {
            const startTime = performance.now();
            // 计算策略树
            const depth = getQxDepth(downChessType);
            const strategyTree = calcStrategyTree(boardData, downChessType, depth);
            
            // const endTime0 = performance.now();
            // console.log('计算耗时：', parseInt(endTime0 - startTime))
            
            // 显示策略树 
            showDepthStrategyTree(strategyTree, downChessType, this.name + '-' + depth);

            setTimeout(() => {
                // 计算耗时数据 
                const endTime = performance.now();
                // console.log('刷新UI耗时：', parseInt(endTime - startTime))
                
                showDepthStrategyTreeCostTime(downChessType, parseInt(endTime - startTime));

                // 选择最高得分方案，作为最终落子方案 
                gameStore[`${downChessType}StrategyTreeInCall`] = false;
                downChessFunction(strategyTree[strategyTree.length - 1], downChessType);
            }, 1);
                    
        }, 300)

    }
}

// 获取应该的计算深度
const getQxDepth = function (downChessType) {
    const selectStore = useSelectStore();
    let depth = selectStore[`${downChessType}QxDepth`];
    if(selectStore[`${downChessType}Role`] === 'user') {
        depth = selectStore.helpQxDepth;
    }
    return depth;
};

