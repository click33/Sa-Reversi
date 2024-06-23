import {useSelectStore} from "../../store/select";
import {calcCanArrScore} from "../ai-calc-util";

/**
 * AI：菜狗，行棋算法 
 */
export default {
    id: 'caigou',
    name: '菜狗',
    // 落子
    downChess: function (activeRole, canDownArr) {
        // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
        canDownArr.sort(() => Math.random() - 0.5);

        // 计算每个落子方案下的评分 
        const selectStore = useSelectStore();
        canDownArr = calcCanArrScore(canDownArr, selectStore.xCount, selectStore.yCount);

        // 按照 score 评分从小到大升序排列  
        canDownArr.sort((a, b) => a.score - b.score);

        console.log('------------- 策略集合 --------------')
        canDownArr.forEach(item => {
            console.log(item.score, JSON.stringify(item));
        });

        // 菜狗 固定选择第一个落子方案，得分最低 
        return canDownArr[0];
    }
}
