/**
 * AI：中级陪练，行棋算法 
 */
export default {
    id: 'zhongji',
    name: '中级陪练',
    // 落子函数
    downChess: function (downChessFunction, currentPlayerType, canDownArr) {
        // 打乱顺序（如果不打乱一下，AI落子会有向上落子的倾向）
        canDownArr.sort(() => Math.random() - 0.5);
        // 按照 tranCount 从小到大升序排列  
        canDownArr.sort((a, b) => a.tranCount - b.tranCount);

        console.log('------------- 策略集合 --------------')
        canDownArr.forEach(item => {
            console.log(item.tranCount, JSON.stringify(item));
        });
        
        // 中级陪练 固定选择最中间一个落子方案，回收一半的棋子 
        const index = parseInt(canDownArr.length / 2);
        downChessFunction(canDownArr[index]);
    }
}
