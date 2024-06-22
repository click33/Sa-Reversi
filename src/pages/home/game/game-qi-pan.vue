<!-- 棋盘 -->
<template>
    <div class="qi-pan-box fade-in-ys">
        <!-- 横向坐标轴 -->
        <div class="axis-x">
            <div v-for="x in selectStore.xCount" :key="x">{{ state.xName[x] }}</div>
        </div>
        <!-- 纵向坐标轴 -->
        <div class="axis-y">
            <div v-for="y in selectStore.yCount" :key="y">
                <span>{{ y }}</span>
            </div>
        </div>
        <!-- 棋盘本身 -->
        <table class="qi-pan-table">
            <tr v-for="y in selectStore.yCount" :key="y">
                <td v-for="x in selectStore.xCount" :key="x" @click="down(x, y)">
                    <game-qi-zi :x="x" :y="y"></game-qi-zi>
                </td>
            </tr>
        </table>
    </div>
</template>

<script setup name="game-qi-pan">

// ------------------ 数据 ------------------
import {onMounted, reactive} from "vue";
import GameQiZi from "./game-qi-zi.vue";
import {useGameStore} from "../../../store/game";
import {useSelectStore} from "../../../store/select";
const gameStore = useGameStore();
const selectStore = useSelectStore();
const { proxy } = getCurrentInstance();

const state = reactive({
    xName: ['', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],  // x坐标轴字母 
})

// 点击单元格
const down = (x, y) => {
    gameStore.downQiZi(x, y);
    // proxy.$refs[getRefName(x, y)][0].down();
}

// 获取 ref 名称 
const getRefName = (x, y) => {
    return `qi-zi-${x}-${y}`;
}


// 组件加载时触发
onMounted(() => {
    
})

</script>

<style scoped lang="scss">
    .qi-pan-box{
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
    .qi-pan-table{
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
    .qi-pan-table,.qi-pan-table tr, .qi-pan-table td{ border: 2px solid #000; }
    .qi-pan-table td:hover{ cursor: pointer; }
    
</style>
