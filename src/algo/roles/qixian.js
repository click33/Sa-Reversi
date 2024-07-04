import {useGameStore} from "../../store/game";
import {calcStrategyTree} from "../playing-chess/depth-strategy";
import {showDepthStrategyTree, showDepthStrategyTreeCostTime} from "../playing-chess/strategy-show-funs";

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
            const strategyTree = calcStrategyTree(boardData, downChessType, 3);
            // 显示到策略树上 
            showDepthStrategyTree(strategyTree, downChessType, this.name);

            setTimeout(() => {
                // 显示耗时 
                const endTime = performance.now();
                showDepthStrategyTreeCostTime(downChessType, parseInt(endTime - startTime));
                console.log(parseInt(endTime - startTime))

                // 选择最高得分方案，作为最终落子方案 
                gameStore[`${downChessType}StrategyTreeInCall`] = false;
                downChessFunction(strategyTree[strategyTree.length - 1], downChessType);
            }, 10);
                    
        }, 300)

    }
}
