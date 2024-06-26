import {useGameStore} from "../../store/game";

/**
 * 角色：玩家手动落子
 */
export default {
    id: 'user',
    name: '玩家',
    // 落子
    downChess: function (downChessFunction, currentPlayerType, canDownArr) {
        // 玩家选择落子方案
        console.log('等待玩家落子...');

        const gameStore = useGameStore();
        
        // 打开手动落子 
        gameStore.status = 'userDown';
        
        // 提示落子位置 
        gameStore.showCanDownByAuto();
        
    }
}
