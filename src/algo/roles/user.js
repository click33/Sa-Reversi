import {useGameStore} from "../../store/game";
import {showTranStrategyTree} from "../playing-chess/strategy-show-funs";

/**
 * 角色：玩家手动落子
 */
export default {
    id: 'user',
    name: '玩家',
    // 落子
    downChess: function ({ downChessFunction, boardData, downChessType, canDownArr }) {
        // 玩家选择落子方案
        // console.log('等待玩家落子...');

        // 提示落子位置 
        const gameStore = useGameStore();
        gameStore.showCanDownByConfig();
        gameStore.userDown = true;
        
        // 显示策略树
        // showTranStrategyTree(canDownArr, downChessType, this.name);
        
    }
}
