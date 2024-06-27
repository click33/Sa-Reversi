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
const gameStore = useGameStore();
const selectStore = useSelectStore();
const { proxy } = getCurrentInstance();
const dictStore = useDictStore();


// 点击单元格
const down = (x, y) => {
    if(gameStore.status === 'defDown') {
        return sa.sendMessage('系统', 'warning', '请等待初始棋子落子完毕。');
    }
    else if(gameStore.status === 'userDown') {
        gameStore.userDownChess(x, y);
    }
    else if(gameStore.status === 'end') {
        return sa.sendMessage('系统', 'success', '对局已结束！' + gameStore.getEndJsStr(), true);
    }
    else if(gameStore.status === 'tran') {
        return sa.sendMessage('系统', 'warning', '请等待 AI 运算完毕或棋子翻转完毕。');
    }
}

// 组件加载时触发
onMounted(() => {
    
})

</script>

<style scoped lang="scss">
    .board-box{
        height: 100%;
        position: relative;
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
        background-color: #13ce66;
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
