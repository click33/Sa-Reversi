import {calcCanArrScore, printCanDownArray} from "../playing-chess/easy-strategy";
import {chaosArray} from "../playing-chess/common-util";
import {getBoardXyCount} from "../playing-chess/board-funs";

/**
 * AI：菜狗，行棋算法 
 */
export default {
    id: 'caigou',
    name: '菜狗',
    // 落子
    downChess: function ({ downChessFunction, boardData, currentPlayerType, canDownArr }) {
        // 打乱一下数组，让 AI 落子显得更随机一些
        chaosArray(canDownArr);

        // 计算每个落子方案下的评分 
        const { xCount, yCount } = getBoardXyCount(boardData);
        canDownArr = calcCanArrScore(canDownArr, xCount, yCount);

        // 按照 score 评分从小到大升序排列  
        canDownArr.sort((a, b) => a.score - b.score);
        
        // 在 f12 控制台打印一下
        printCanDownArray(canDownArr);

        // 菜狗 固定选择第一个落子方案，得分最低 
        downChessFunction(canDownArr[0]);
    }
}
