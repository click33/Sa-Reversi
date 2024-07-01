<!-- 棋子 -->
<template>
    <div ref="chessRef" 
         class="chess" :class=" [
             ('chess-' + state.type), 
             (gameStore.justX === state.x && gameStore.justY === state.y ? 'chess-just-down' : ''), 
             (state.animClass),
             (state.isJustTran ? 'chess-just-tran' : ''),
             ] "
        >
        <div class="chess-tip" :class=" 'chess-tip-' + state.tipsType "></div>
        <div class="chess-point" v-if="selectStore.showChessPoint">{{ getXySimpleStr(state.x, state.y) }}</div>
    </div>
</template>

<script setup name="game-chess">
import {onMounted, reactive, defineExpose} from "vue";
import {useGameStore} from "../../../store/game";
import audioManager from "../../../algo/audio-manager";
import {useSelectStore} from "../../../store/select";
import {getXySimpleStr} from "../../../algo/playing-chess/chess-funs";
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
    x: chess.x,  // 棋子所属横坐标
    y: chess.y,  // 棋子所属纵坐标
    type: chess.type,  // 棋子类型：black=黑，white=白，none=空 
    tipsType: chess.tipsType,  // 棋子提示类型 
    tranCount: chess.tranCount,  // 如果在此处落子，可翻转棋子数量 
    isJustTran: chess.isJustTran,  // 是否为刚刚翻转的棋子 
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
    state.isJustTran = item.isJustTran;
    // console.log('item---', item)
    // console.log('gameStore.getChess(prop.x, prop.y)', gameStore.getChess(prop.x, prop.y))

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
        border: 1px solid transparent;
    }
    .chess-black{ background-color: #000; }
    .chess-white{ background-color: #FFF; /*animation: small-to-big--white 3s ease-out 1;*/}
    .chess-none{ }

    // 最新落子的样式 
    .chess-white.chess-just-down{ box-shadow: 0 0 30px red; border: 1px solid red; }
    .chess-black.chess-just-down{ box-shadow: 0 0 20px yellow; border: 1px solid yellow; }

    // 刚刚被翻转的棋子的样式 
    .chess-white.chess-just-tran{
        box-shadow: 0 0 20px red;
    }
    .chess-black.chess-just-tran{
        box-shadow: 0 0 20px yellow;
    }
    @keyframes chess-just-down {
        0%{ transform: scale(1);}
        50%{ transform: scale(0.9);}
        50%{ transform: scale(1);}
        50%{ transform: scale(1.1);}
        100%{ transform: scale(1);}
    }
    
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
    @keyframes small-to-big {
        0%{ width: 10%; height: 10%; opacity: 0.5;}
        100%{ width: 70%; height: 70%; opacity: 0.2;}
    }
    // 把 animation 属性写下面，是为了只在有落子提示时才真正的显示动画，防止浏览器做无用动画，节省性能 
    .chess-tip-black{ animation: small-to-big 3s ease-out infinite; background-color: #444; }
    .chess-tip-white{ animation: small-to-big 3s ease-out infinite; background-color: #FFF; }
    
    // 格子坐标样式 
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
    
    
    // -------------- 棋子翻转动画 -----------------

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



</style>
