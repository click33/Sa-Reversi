<!-- 棋盘 -->
<template>
    <div class="board-box fade-in-ys">
        <!-- 横向坐标轴 -->
        <div class="axis-x">
            <div v-for="x in selectStore.xCount" :key="x">{{ dictStore.xName[x] }}</div>
        </div>
        <!-- 纵向坐标轴 -->
        <div class="axis-y">
            <div v-for="y in selectStore.yCount" :key="y">
                <span>{{ y }}</span>
            </div>
        </div>
        <!-- 棋盘本身 -->
        <table class="board-table">
            <tr v-for="y in selectStore.yCount" :key="y">
                <td v-for="x in selectStore.xCount" :key="x" @click="down(x, y)">
                    <game-chess :class=" `chess-${x}-${y}` " :x="x" :y="y"></game-chess>
                </td>
            </tr>
        </table>
        
    </div>
</template>

<script setup name="game-board">

// ------------------ 数据 ------------------
import {onMounted} from "vue";
import GameChess from "./game-chess.vue";
import {useGameStore} from "../../../store/game";
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {getXyStr} from "../../../algo/playing-chess/chess-funs";
const gameStore = useGameStore();
const selectStore = useSelectStore();
const { proxy } = getCurrentInstance();
const dictStore = useDictStore();


// 点击单元格
const down = (x, y) => {
    gameStore.statusIsFreeCallback(() => {
        // 计算是否需要给出相应的提示 
        const isLatestStep = gameStore.stepIndex + 1 >= gameStore.stepList.length - 1; // 是否是最后一步，或全新步
        const role = gameStore.getRole(gameStore.currentPlayerType);
        if(role.id === 'user' && isLatestStep) {
            gameStore.userDownChess(x, y);
        }
        else if(role.id === 'user' && !isLatestStep) {
            sa.confirm(`落子${getXyStr(x, y)}，将清空后续已有回合记录，是否继续？`, () => gameStore.userDownChess(x, y) );
        }
        else if(role.id !== 'user' && isLatestStep) {
            sa.confirm(`代替AI落子${getXyStr(x, y)}，是否继续？`, () => gameStore.userDownChess(x, y) );
        }
        else if(role.id !== 'user' && !isLatestStep) {
            sa.confirm(`代替AI落子${getXyStr(x, y)}，并清空后续已有回合记录，是否继续？`, () => gameStore.userDownChess(x, y) );
        }
    });
}

// 组件加载时触发
onMounted(() => {
    
})

</script>

<style scoped lang="scss">
    .board-box{
        height: 100%;
        position: relative;
        background-image: url("../../../assets/board-bg.png");
        background-size: 34% 34%;
    }
    // 横向坐标轴
    .axis-x{
        width: 90%;
        height: 5%;
        position: absolute;
        right: 5%;
        display: flex;
        align-items: center;
        text-align: center;
        div{ flex: 1; }
    }
    // 纵向坐标轴
    .axis-y{
        width: 5%;
        height: 90%;
        position: absolute;
        bottom: 5%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
        div{
            flex: 1;
            position: relative;
            span{
                position: absolute;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
            }
        }
    }
    
    // 棋盘本身
    .board-table{
        width: 90%;
        height: 90%;
        //background-color: #13ce66;
        //background-color: green;
        position: absolute;
        right: 5%;
        bottom: 5%;
        text-align: center;
        border-collapse: collapse;
    }
    // 棋盘边框线 
    .board-table,.board-table tr, .board-table td{ border: 2.5px solid #000; }
    .board-table td:hover{ cursor: pointer; }
    
    // 消息提示栏
    .message-box{
        position: absolute;
        width: 100%;
        text-align: center;
        bottom: 0;
    }
    
</style>
