import {calcCanArrScore2} from "../playing-chess/ai-calc-util2";
import {useSelectStore} from "../../store/select";
import {useGameStore} from "../../store/game";

/**
 * AI：旗仙陪练，行棋算法 
 */
export default {
    id: 'qixian',
    name: '棋仙',
    // 落子
    downChess: function (downChessFunction, currentPlayerType, canDownArr) {
        // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
        canDownArr.sort(() => Math.random() - 0.5);
        
        // 计算每个落子方案下的评分 
        const selectStore = useSelectStore();
        const gameStore = useGameStore();
        canDownArr = calcCanArrScore2(canDownArr, gameStore.boardData, currentPlayerType, selectStore.xCount, selectStore.yCount);

        // 按照 score 评分从小到大升序排列  
        canDownArr.sort((a, b) => a.score - b.score);

        console.log('------------- 策略集合 --------------')
        canDownArr.forEach(item => {
            console.log(item.score, JSON.stringify(item));
        });

        // 棋圣 固定选择最后一个落子方案，得分最高
        downChessFunction(canDownArr[canDownArr.length - 1]);
    }
}
