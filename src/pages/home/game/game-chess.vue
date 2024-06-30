<!-- 棋子 -->
<template>
    <div ref="chessRef" 
         class="chess" :class=" [('chess-' + state.type), (gameStore.justX === state.x && gameStore.justY === state.y ? 'chess-just' : ''), (state.animClass)] "
        >
        <div class="chess-tip" :class=" 'chess-tip-' + state.tipsType "></div>
        <div class="chess-point" v-if="selectStore.showChessPoint">{{ getXySimpleStr(state.x, state.y) }}</div>
    </div>
</template>

<script setup name="game-chess">
import {onMounted, reactive, defineExpose} from "vue";
import {useGameStore} from "../../../store/game";
import audioManager from "../../../algo/audio-manager";
import { getXySimpleStr } from "../../../algo/playing-chess/ai-calc-coomon";
import {useSelectStore} from "../../../store/select";
let gameStore = useGameStore();
const { proxy } = getCurrentInstance();
const selectStore = useSelectStore();


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
    animClass: '', // 动画类名  
})

// 监听棋子数据变化，更新棋子 UI 展现
watch(chess, (item) => {
    // 播放音效 
    if(state.type === 'none' && item.type !== 'none') {
        audioManager.playDownChess({
            error: () => {
                console.log('用户未交互文档，无法播放音频...');
            }
        });
    }
    
    // 动画与数据 
    state.animClass = `${state.type}-to-${item.type}`;
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
        //transition: all 0.5s;
        position: relative;
    }
    .chess-black{ background-color: #000; }
    .chess-white{ background-color: #FFF; /*animation: small-to-big--white 3s ease-out 1;*/}
    .chess-none{ }

    // 无子变黑子 动画 
    .none-to-black{ animation: none-to-black 0.3s ease-out 1; }
    @keyframes none-to-black {
        0%{ width: 0; height: 0; }
        100%{ width: 85%; height: 85%; background-color: #000;}
    }
    // 无子变白子 动画 
    .none-to-white{ animation: none-to-white 0.3s ease-out 1; }
    @keyframes none-to-white {
        0%{ width: 0; height: 0; }
        100%{ width: 85%; height: 85%; background-color: #FFF;}
    }
    // 黑子变白子 动画 
    .black-to-white{ animation: black-to-white 0.3s ease-out 1; }
    @keyframes black-to-white {
        0%{ width: 85%; height: 85%; background-color: #000;}
        49%{ width: 15%; height: 85%; background-color: #000;}
        51%{ width: 15%; height: 85%; background-color: #FFF;}
        100%{ width: 85%; height: 85%;}
    }
    // 白子变黑子 动画 
    .white-to-black{ animation: white-to-black 0.3s ease-out 1; }
    @keyframes white-to-black {
        0%{ width: 85%; height: 85%; background-color: #FFF;}
        49%{ width: 15%; height: 85%; background-color: #FFF;}
        51%{ width: 15%; height: 85%; background-color: #000;}
        100%{ width: 85%; height: 85%;}
    }
    

    // 最新落子的样式 
    .chess-white.chess-just{ box-shadow: 0 0 20px #000; }
    .chess-black.chess-just{ box-shadow: 0 0 25px yellow; }
    
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
    
    // 坐标
    .chess-point{
        white-space: nowrap;
        font-size: 12px;
        display: inline-block;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #666;
    }
    
</style>
