import {useSelectStore} from "../../store/select";
import {calcCanArrScore} from "../ai-calc-util";

/**
 * 角色：玩家手动落子
 */
export default {
    id: 'user',
    name: '玩家',
    // 落子
    downChess: function (downFunction, activeRole, canDownArr) {
       
        // 玩家选择落子方案
        console.log('等待玩家落子...');
        
        

        // 菜狗 固定选择第一个落子方案，得分最低 
        return canDownArr[0];
    }
}
