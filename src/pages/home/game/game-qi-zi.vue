<!-- 棋子 -->
<template>
    <div class="qi-zi" :class=" 'qi-zi-' + state.type ">
<!--        <span style="color: #666; line-height: 50px;">{{x}}, {{y}}</span>-->
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
const state = reactive({
    type: gameStore.getQiZi(prop.x, prop.y).type,  // 棋子类型：black=黑，white=白，none=空 
    x: prop.x,  // 棋子所属横坐标
    y: prop.y,  // 棋子所属纵坐标
})

// 监听棋盘数据变化，更新棋子 UI 展现
watch(gameStore.getQiZi(prop.x, prop.y), (item) => {
    state.type = item.type;
})



// ------------------ 方法 ------------------






defineExpose({
    
})

// 组件加载时触发
onMounted(() => {
    
})

</script>

<style scoped lang="scss">
    .qi-zi{
        width: 75%;
        height: 75%;
        margin: auto;
        border-radius: 50%;
        transition: all 0.5s;
    }
    .qi-zi-black{
        background-color: #000;
    }
    .qi-zi-white{
        background-color: #FFF;
    }
    .qi-zi-none{

    }
</style>
