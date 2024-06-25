<!-- 对战数据 -->
<template>
    <el-card class="card-box zdy-card fade-in-ys"  shadow="never" header="">
        <div class="con-box">
            <div class="qi-zi-box">
                <div class="item-box item-box-black">
                    <div class="role-name">
                        <span v-if="selectStore.blackRole === 'user'">【玩家】{{ selectStore.playerName }}</span>
                        <span v-else>【AI】{{ dictStore.getAIRole( selectStore.blackRole ).name }}</span>
                    </div>
                    <div class="qi-zi-show qi-zi-show-black"></div>
                    <span class="qi-zi-count"> {{ state.qiZiCount.blackCount }} </span>
                </div>
                <div class="item-box item-box-vs">
                    <b class="vs-text">VS</b>
                </div>
                <div class="item-box item-box-white">
                    <div class="role-name">
                        <span v-if="selectStore.whiteRole === 'user'">【玩家】{{ selectStore.playerName }}</span>
                        <span v-else>【AI】{{ dictStore.getAIRole( selectStore.whiteRole ).name }}</span>
                    </div>
                    <span class="qi-zi-count"> {{ state.qiZiCount.whiteCount }} </span>
                    <div class="qi-zi-show qi-zi-show-white"></div>
                </div>
            </div>
            <div class="progress-box">
                <el-progress :percentage="state.progressValue" :show-text="false" :stroke-width="8" color="#000" />
            </div>
        </div>
    </el-card>
</template>

<script setup name="com-battle-data">
import {useSelectStore} from "../../../store/select";
import {useGameStore} from "../../../store/game";
import {useDictStore} from "../../../store/dict"; 
let selectStore = useSelectStore();
var gameStore = useGameStore();
var dictStore = useDictStore();

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
            padding: 10px 20px;
        }

        .qi-zi-box{
            display: flex;
            .item-box{ flex: 3; }
            .item-box-vs{text-align: center; flex: 1;}
            .item-box-white{ text-align: right; color: #FFF;}
            
            // 角色名称
            .role-name{ color: #faee0d; font-size: 18px; white-space: nowrap; margin-bottom: 20px; font-weight: 700; }
            // 让黑子角色名称在视觉上更靠左对齐 
            .item-box-black .role-name{position: relative; left: -8px;}
            
            // 黑子、白子 展示
            .qi-zi-show{ width: 50px; height: 50px; margin: auto; border-radius: 50%; display: inline-block;}
            .qi-zi-show{  }
            .item-box-black .qi-zi-show{ background-color: #000; margin-right: 16px;}
            .item-box-white .qi-zi-show{ background-color: #FFF; margin-left: 16px;}

            .qi-zi-count{ display: inline-block; font-size: 36px; }
            .item-box-white .qi-zi-count{  }

            // vs 文字
            .vs-text{ display: inline-block; font-size: 36px; margin-top: 56px; color: #FAC03D; text-shadow: 0 0 3px #ED723F }
        }

        // 进度条相关
        .progress-box{ border: 0px #000 solid; padding: 20px 0px 10px; }
        .progress-box :deep(.el-progress-bar__outer){ background-color: #FFF; }

    }
    

</style>
