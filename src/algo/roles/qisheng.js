import {calcCanArrScore} from "../playing-chess/easy-strategy";
import {chaosArray} from "../playing-chess/common-util";
import {getBoardXyCount} from "../playing-chess/board-funs";
import {showScoreStrategyTree} from "../playing-chess/strategy-show-funs";

/**
 * AI：棋圣陪练，行棋算法 
 */
export default {
    id: 'qisheng',
    name: '棋圣',
    // 落子
    downChess: function ({ downChessFunction, boardData, downChessType, canDownArr }) {
        // 打乱一下数组，让 AI 落子显得更随机一些
        chaosArray(canDownArr);
        
        // 计算每个落子方案下的评分 
        const { xCount, yCount } = getBoardXyCount(boardData);
        canDownArr = calcCanArrScore(canDownArr, xCount, yCount);

        // 按照 score 评分从小到大升序排列  
        canDownArr.sort((a, b) => a.score - b.score);

        // 显示策略树
        showScoreStrategyTree(canDownArr, downChessType, this.name);
        
        // 棋圣 固定选择最后一个落子方案，得分最高
        downChessFunction(canDownArr[canDownArr.length - 1], downChessType);
    }
}
