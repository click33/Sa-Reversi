/**
 * AI：菜狗，行棋算法 
 */
export default {
    id: 'caigou',
    name: '菜狗',
    // 落子
    downChess: function (activeRole, canDownArr) {

        console.log(canDownArr)
        
        // 菜狗固定选择第一个落子方案，回收最少的棋子 
        return canDownArr[0];
    }
}
