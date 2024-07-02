<!-- 操作按钮列表 -->
<template>
    <div class="con-box vue-box">
        <el-button type="primary" @click="openStrategyTree">策略树</el-button>
        <el-button type="primary" @click="stepBack" :disabled="gameStore.stepIndex === 0 || gameStore.stepList.length === 0">← 后退</el-button>
        <el-button type="primary" @click="stepForward" :disabled="gameStore.stepIndex === gameStore.stepList.length - 1">前进 →</el-button>
        <el-button type="primary" @click="stepForward_withAnim" :disabled="gameStore.stepIndex === gameStore.stepList.length - 1">带动画前进 →</el-button>

        <!-- 策略树窗口 -->
        <lay-layer v-model="state.showStrategyTree"
                   :title=" '策略树 (棋仙AI)' + (gameStore.inCalcStrategy ? ' 计算中...' : '') "
                   :maxmin="true"
                   :moveOut="true"
                   skin="lay-layer-strategy"
                   :shade="false" :shadeOpacity="0.7" :area="['600px', '500px']"
                   :resize="true"
                   offset="l"
        >
            <com-strategy-tree></com-strategy-tree>
        </lay-layer>
        
    </div>
</template>

<script setup name="com-button-box">
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
import ComStrategyTree from '../game/com-strategy-tree.vue';
import {reactive} from "vue";

let selectStore = useSelectStore();
var dictStore = useDictStore();
var gameStore = useGameStore();


// ------------------ 数据 ------------------
const state = reactive({
    showStrategyTree: false,
});


// 打开策略树 
const openStrategyTree = () => {
    if(document.body.clientWidth < 768) {
        return sa.msg('屏幕太小了，显示不开，来电脑端体验吧');
    }
    state.showStrategyTree = true;
}

// 后退
const stepBack = () => {
    gameStore.stepBack();
}

// 前进 
const stepForward = () => {
    gameStore.stepForward();
}

// 带动画效果前进 
const stepForward_withAnim = () => {
    gameStore.stepForward_withAnim();
}



// ------------------ 生命周期 ------------------
onMounted(() => {
    // openStrategyTree();
});

</script>

<style scoped lang="scss">
    .con-box{
        width: 100%;
        min-height: 10px;
        background-color: transparent;
    }
    
</style>

<style lang="scss">
.lay-layer-strategy{
    border: 1px solid #000;
    max-width: 90vw;
    .layui-layer-title{
        background-color: #272822;
        color: #FFF;
        border-bottom: 1px solid #666;
    }
    .layui-layer-setwin i{color: #FFF;}
    .layui-layer-setwin i:hover{color: #E6A23C;}
    .slot-fragment{
        height: 100%;
    }
}
</style>
