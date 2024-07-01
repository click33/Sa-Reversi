import {calcCanArrScore2} from "../playing-chess/easy-strategy";
import {getBoardXyCount} from "../playing-chess/board-funs";
import {chaosArray} from "../playing-chess/common-util";
import {printCanDownArray} from "../playing-chess/easy-strategy";
import {getXyStr} from "../playing-chess/chess-funs";

/**
 * AI：棋皇，行棋算法
 */
export default {
    id: 'qihuang',
    name: '棋皇',
    // 落子
    downChess: function ({ downChessFunction, boardData, currentPlayerType, canDownArr }) {
        // 打乱一下数组，让 AI 落子显得更随机一些
        chaosArray(canDownArr);

        // 计算每个落子方案下的评分 
        canDownArr = calcCanArrScore2(canDownArr, boardData, currentPlayerType);

        // 按照 score 评分从小到大升序排列  
        canDownArr.sort((a, b) => a.score - b.score);

        // 在 f12 控制台打印一下
        console.log('------------- 策略集合 --------------')
        canDownArr.forEach(item => {
            console.log(`${getXyStr(item)}，回收棋子${item.tranCount}枚，落子得分：${item.downChessScore}，翻转子得分：${item.tranChessScore}，总得分：${item.score}`, item);
        });

        // 棋圣 固定选择最后一个落子方案，得分最高
        downChessFunction(canDownArr[canDownArr.length - 1]);
    }
}
