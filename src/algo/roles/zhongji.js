import {chaosArray} from "../playing-chess/common-util";
import {showTranStrategyTree} from "../playing-chess/strategy-show-funs";

/**
 * AI：中级陪练，行棋算法 
 */
export default {
    id: 'zhongji',
    name: '中级陪练',
    // 落子函数
    downChess: function ({ downChessFunction, boardData, downChessType, canDownArr }) {
        // 打乱一下数组，让 AI 落子显得更随机一些
        chaosArray(canDownArr);
        
        // 按照 tranCount 从小到大升序排列  
        canDownArr.sort((a, b) => a.tranCount - b.tranCount);

        // 显示策略树
        showTranStrategyTree(canDownArr, downChessType, this.name);

        // 中级陪练 固定选择最中间一个落子方案，回收一半的棋子 
        downChessFunction(canDownArr[ parseInt((canDownArr.length - 1) / 2) ], downChessType);
    }
}
