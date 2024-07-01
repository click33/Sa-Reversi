import {calcCanArrScore2} from "../playing-chess/ai-calc-util2";
import {useSelectStore} from "../../store/select";
import {useGameStore} from "../../store/game";
import {
    getXyStr,
    calcStrategyTree, printStrategyTree
} from "../playing-chess/ai-calc-coomon";
import {calcCanArrScore} from "../playing-chess/ai-calc-util";
import {getCanDownArray} from "../playing-chess/ai-calc-coomon";

/**
 * AI：旗仙陪练，行棋算法 
 */
export default {
    id: 'qixian',
    name: '棋仙',
    // 落子
    downChess: function ({ downChessFunction, boardData, currentPlayerType, canDownArr }) {

        const gameStore = useGameStore();
        // gameStore.strategyTree = [];
        gameStore.inCalcStrategy = true;
        
        
        nextTick(function () {
            setTimeout(function () {
                const strategyTree = calcStrategyTree(gameStore.boardData, currentPlayerType, 3);

                // 子孙策略数量
                let subStrategyCount = 0;
                strategyTree.forEach(item => {
                    subStrategyCount += item.subStrategyCount ?? 1;
                })
                
                // printStrategyTree(strategyTree);
                gameStore.inCalcStrategy = false;
                gameStore.strategyTree = [
                    {
                        id: 'top',
                        type: currentPlayerType,
                        subStrategyCount: subStrategyCount,
                        finalScore: strategyTree[strategyTree.length - 1].finalScore,
                        nextChessCanArray: strategyTree,
                    }
                ];
                gameStore.strategyChessType = currentPlayerType;
                nextTick(function () {
                    // 使顶级节点展开 
                    const dom = document.querySelector('.tree-content-item-top');
                    if(dom) {
                        dom.click();
                    }
                })
                // console.log(strategyTree)

                // 选择最高得分方案，作为最终落子方案 
                downChessFunction(strategyTree[strategyTree.length - 1]);
            }, 100);
        })

        // 打开手动落子 
        // gameStore.status = 'userDown';
        // gameStore.showCanDownByConfig();
    }
}
