<!-- 对战数据 -->
<template>
    <el-card class="card-box zdy-card fade-in-ys"  shadow="never" header="对战数据">
        <div class="con-box">
            <div class="item-box">
                <div class="qi-zi-show qi-zi-show-black"></div>
                <span class="qi-zi-count"> {{ state.qiZiCount.blackCount }} </span>
            </div>
            <div class="item-box">
                <b class="vs-text">VS</b>
            </div>
            <div class="item-box">
                <div class="qi-zi-show qi-zi-show-white"></div>
                <span class="qi-zi-count"> {{ state.qiZiCount.whiteCount }} </span>
            </div>
        </div>
        <div class="progress-box">
            <el-progress :percentage="state.progressValue" :show-text="false" color="#000" />
        </div>
    </el-card>
</template>

<script setup name="com-battle-data">
import {useSelectStore} from "../../../store/select";
import {useGameStore} from "../../../store/game"; 
let selectStore = useSelectStore();
var gameStore = useGameStore();

const state = reactive({
    progressValue: 0,
    // 棋子数量
    qiZiCount: {
        blackCount: 0,
        whiteCount: 0,
        noneCount: 0,
    },
})

// 监听棋盘棋子变动时，更改这边的显示 
watch(gameStore.qiPanData, () => {
    // 各棋子数量
    state.qiZiCount = gameStore.getQiZiCount();
    // 计算进度条 
    const blackCount = state.qiZiCount.blackCount;
    const allCount = state.qiZiCount.blackCount + state.qiZiCount.whiteCount;
    if(allCount === 0) {
        return state.progressValue = 0;
    }
    state.progressValue = blackCount / allCount * 100;
})

</script>

<style scoped lang="scss">
    .card-box{
        width: 100%;
        min-height: 100px;
        background-color: #13CE66;
        
        // 标题改为白色
        :deep(.el-card__header){ color: #FFF; }
        
        .con-box{
            display: flex;
            .item-box{ flex: 1; text-align: center;}
            
            // 黑子、白子 展示
            .qi-zi-show{ width: 40px; height: 40px; margin: auto; border-radius: 50%;   }
            .qi-zi-show-black{ background-color: #000; }
            .qi-zi-show-white{ background-color: #FFF; }

            .qi-zi-count{ display: inline-block; margin-top: 10px; font-size: 28px; }
            .qi-zi-show-white + .qi-zi-count{ color: #FFF; }
        }
    }
    
    // vs 文字
    .vs-text{ display: inline-block; font-size: 36px; margin-top: 16px; color: #FAC03D; text-shadow: 0 0 3px #ED723F }

    // 进度条相关
    .progress-box{ border: 0px #000 solid; padding: 20px 20px 10px; }
    .progress-box :deep(.el-progress-bar__outer){ background-color: #FFF; }
    
</style>
