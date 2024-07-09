<!-- 操作按钮列表 -->
<template>
    <div class="con-box vue-box">
        <div class="btn-group">
            <el-button type="primary" @click="stepBack" :disabled="gameStore.stepIndex === 0 || gameStore.stepList.length === 0">← 后退</el-button>
            <el-button type="primary" @click="stepForward" :disabled="gameStore.stepIndex === gameStore.stepList.length - 1">前进 →</el-button>
            <el-button type="primary" @click="stepForward_withAnim" :disabled="gameStore.stepIndex === gameStore.stepList.length - 1">带动画前进 →</el-button>
            <el-button type="primary" @click="aiDownChess">AI 走棋</el-button>
            <el-button type="primary" @click="openStrategyTree">策略树</el-button>
            <el-button type="primary" @click="openSelectWin">对局设置</el-button>
        </div>

        <!-- 策略树窗口 -->
        <lay-layer v-model="selectStore.showStrategyTreeWin"
                   :title=" '策略树' + (gameStore.blackStrategyTreeInCall || gameStore.whiteStrategyTreeInCall ? ' 计算中...' : '') "
                   :maxmin="true"
                   :moveOut="true"
                   skin="lay-layer-strategy"
                   :shade="false" :shadeOpacity="0.7" :area="['600px', '500px']"
                   :resize="true"
                   offset="l"
        >
            <com-strategy-tree ref="strategyTree"></com-strategy-tree>
        </lay-layer>


        <!-- 抽屉打开配置界面 -->
        <el-drawer
            v-model="state.isOpenSelectWin"
            :size="state.selectWinSize"
            :with-header="false"
        >
            <div class="select-drawer-box small--select-page none-anim">
                <com-select mode="drawer"></com-select>
            </div>
            <template #footer>
                <div style="text-align: left;">
                    <el-button type="primary" color="#337be2" @click="state.isOpenSelectWin = false">保存设置</el-button>
                    <el-button type="primary" plain @click="newGame">开始新游戏</el-button>
                    <el-button type="primary" plain @click="reset">恢复默认</el-button>
                </div>
            </template>
        </el-drawer>
        
    </div>
</template>

<script setup name="com-button-box">
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
import ComStrategyTree from '../strategy/com-strategy-tree.vue';
import {reactive} from "vue";
import {useComStore} from "../../../store/com";
import ComSelect from "../select/com-select";
const { proxy } = getCurrentInstance();

const selectStore = useSelectStore();
const dictStore = useDictStore();
const gameStore = useGameStore();
const comStore = useComStore();


// ------------------ 数据 ------------------
const state = reactive({
    // showStrategyTree: false,
    isOpenSelectWin: false, // 是否打开配置抽屉 
    selectWinSize: 800, // 窗口大小 
});


// 打开策略树 
const openStrategyTree = () => {
    if(document.body.clientWidth < 768) {
        return sa.msg('屏幕太小了，显示不开，来电脑端体验吧');
    }
    selectStore.showStrategyTreeWin = ! selectStore.showStrategyTreeWin;
    isSaveStrategyTreeCom();
}

// 判断是否应该保存全局组件句柄
const isSaveStrategyTreeCom = () => {
    if(selectStore.showStrategyTreeWin) {
        nextTick(() => {
            comStore.strategyTree = proxy.$refs['strategyTree'];
        })
    } else {
        comStore.strategyTree = null;
    }
}


// 打开配置窗口  
const openSelectWin = () => {
    state.selectWinSize = 800;
    if(document.body.clientWidth < 850) {
        state.selectWinSize = document.body.clientWidth - 50;
    }
    state.isOpenSelectWin = true;
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
    gameStore.statusIsFreeCallback(() => {
        gameStore.stepForward_withAnim();
    })
}

// AI 走棋
const aiDownChess = () => {
    gameStore.statusIsFreeCallback(() => {
        // 计算是否需要给出相应的提示 
        const isLatestStep = gameStore.stepIndex + 1 >= gameStore.stepList.length - 1; // 是否是最后一步，或全新步 
        if(isLatestStep) {
            gameStore.aiDownChess();
        }
        else if(!isLatestStep) {
            sa.confirm(`当前步骤调用 AI 走棋，将清空后续已有回合记录，是否继续？`, () => gameStore.aiDownChess() );
        }
    })
}

// 以此配置打开新游戏
const newGame = () => {
    location.reload(true);
}

// 恢复默认
const reset = () => {
    selectStore.resetSelectStore();
}


// ------------------ 生命周期 ------------------
onMounted(() => {
    // gameStore.showStrategyTreeWin = true;

    isSaveStrategyTreeCom();
    
});



</script>

<style scoped lang="scss">
    .con-box{
        width: 100%;
        min-height: 10px;
        background-color: transparent;
    }
    .btn-group{
        :deep(.el-button) {
            margin-right: 10px;
            margin-bottom: 10px;
            margin-left: 0px;
        }
    }

    :deep(.el-drawer__body){padding: 0px;background-color: #DDDEE5;}
    :deep(.el-drawer__footer){ padding: 20px;background-color: #f5f5f5;}
    
    .select-drawer-box{
        width: 100%;
        padding: 2em;
        overflow: hidden;
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
