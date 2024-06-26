<!-- 棋子 -->
<template>
    <div class="chess" :class=" [('chess-' + state.type), (gameStore.justX === state.x && gameStore.justY === state.y ? 'chess-just' : '')] ">
        <div class="chess-tip" :class=" 'chess-tip-' + state.tipsType "></div>
    </div>
</template>

<script setup name="game-chess">
import {onMounted, reactive, defineExpose} from "vue";
import {useGameStore} from "../../../store/game";
let gameStore = useGameStore();


// 组件形参 
const prop = defineProps({
    x: { type: Number },
    y: { type: Number }
})

// ------------------ 数据 ------------------
let chess = gameStore.getChess(prop.x, prop.y);
const state = reactive({
    type: chess.type,  // 棋子类型：black=黑，white=白，none=空 
    tipsType: chess.tipsType,  // 棋子提示类型：black=
    tranCount: 0,  // 如果在此处落子，可翻转棋子数量 
    x: prop.x,  // 棋子所属横坐标
    y: prop.y,  // 棋子所属纵坐标
})

// 监听棋子数据变化，更新棋子 UI 展现
watch(chess, (item) => {
    state.type = item.type;
    state.tipsType = item.tipsType;
    state.tranCount = item.tranCount;
})



// ------------------ 方法 ------------------






defineExpose({
    
})

// 组件加载时触发
onMounted(() => {
    
})

</script>

<style scoped lang="scss">
    // 棋子
    .chess{
        width: 85%;
        height: 85%;
        margin: auto;
        border-radius: 50%;
        transition: all 0.5s;
        position: relative;
    }
    .chess-black{ background-color: #000; }
    .chess-white{ background-color: #FFF; }
    .chess-none{ }

    // 最新落子的样式 
    .chess-white.chess-just{ box-shadow: 0 0 15px #000; }
    .chess-black.chess-just{ box-shadow: 0 0 15px yellow; }
    
    // 棋子提示 
    .chess-tip{
        width: 30%;
        height: 30%;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border-radius: 50%;
    }
    @keyframes big {
        0%{ width: 10%; height: 10%; opacity: 0.8;}
        100%{ width: 70%; height: 70%; opacity: 0.2;}
    }
    // 把 animation 属性写下面，是为了只在有落子提示时才真正的显示动画，防止浏览器做无用动画，节省性能 
    .chess-tip-black{ animation: big 3s ease-out infinite; background-color: #444; }
    .chess-tip-white{ animation: big 3s ease-out infinite; background-color: #FFF; }
    
    
</style>
