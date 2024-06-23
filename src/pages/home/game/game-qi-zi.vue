<!-- 棋子 -->
<template>
    <div class="qi-zi" :class=" [('qi-zi-' + state.type), (gameStore.justX === state.x && gameStore.justY === state.y ? 'qi-zi-just' : '')] ">
        <div class="qi-zi-tip" :class=" 'qi-zi-tip-' + state.tipsType "></div>
    </div>
</template>

<script setup name="game-qi-zi">
import {onMounted, reactive, defineExpose} from "vue";
import {useGameStore} from "../../../store/game";
let gameStore = useGameStore();


// 组件形参 
const prop = defineProps({
    x: { type: Number },
    y: { type: Number }
})

// ------------------ 数据 ------------------
let qiZi = gameStore.getQiZi(prop.x, prop.y);
const state = reactive({
    type: qiZi.type,  // 棋子类型：black=黑，white=白，none=空 
    tipsType: qiZi.tipsType,  // 棋子提示类型：black=
    tranCount: 0,  // 如果在此处落子，可翻转棋子数量 
    x: prop.x,  // 棋子所属横坐标
    y: prop.y,  // 棋子所属纵坐标
})

// 监听棋子数据变化，更新棋子 UI 展现
watch(qiZi, (item) => {
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
    .qi-zi{
        width: 75%;
        height: 75%;
        margin: auto;
        border-radius: 50%;
        transition: all 0.5s;
        position: relative;
    }
    .qi-zi-black{ background-color: #000; }
    .qi-zi-white{ background-color: #FFF; }
    .qi-zi-none{ }

    // 最新落子的样式 
    .qi-zi-white.qi-zi-just{ box-shadow: 0 0 15px #000; }
    .qi-zi-black.qi-zi-just{ box-shadow: 0 0 15px yellow; }
    
    // 棋子提示 
    .qi-zi-tip{
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
    .qi-zi-tip-black{ animation: big 3s ease-out infinite; background-color: #444; }
    .qi-zi-tip-white{ animation: big 3s ease-out infinite; background-color: #FFF; }
    
    
</style>
