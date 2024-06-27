<!-- 对战数据 -->
<template>
    <el-card class="card-box zdy-card fade-in-ys"  shadow="never" header="">
        <div class="con-box">
            <div class="role-name-box">
                <div class="role-name role-name-black">
                    <span v-if="selectStore.blackRole === 'user'">【玩家】{{ selectStore.username }}</span>
                    <span v-else>【AI】{{ dictStore.getRole( selectStore.blackRole ).name }}</span>
                </div>
                <div class="role-name role-name-white">
                    <span v-if="selectStore.whiteRole === 'user'">【玩家】{{ selectStore.username }}</span>
                    <span v-else>【AI】{{ dictStore.getRole( selectStore.whiteRole ).name }}</span>
                </div>
                <div style="clear: both;"></div>
            </div>
            <div class="chess-box">
                <div class="item-box item-box-black">
                    <div class="chess-show chess-show-black"></div>
                    <span class="chess-count"> {{ state.chessCount.blackCount }} </span>
                </div>
                <div class="item-box item-box-progress">
                    <b class="vs-text">VS</b>
                    <el-progress :percentage="state.progressValue" :show-text="false" :stroke-width="8" color="#000" />
                </div>
                <div class="item-box item-box-white">
                    <span class="chess-count"> {{ state.chessCount.whiteCount }} </span>
                    <div class="chess-show chess-show-white"></div>
                </div>
            </div>
<!--            <div class="progress-box">-->
<!--                <el-progress :percentage="state.progressValue" :show-text="false" :stroke-width="8" color="#000" />-->
<!--            </div>-->
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
    chessCount: {
        blackCount: 22,
        whiteCount: 22,
        noneCount: 0,
    },
})

// 监听棋盘棋子变动时，更改这边的显示 
watch(gameStore.boardData, () => {
    // 各棋子数量
    state.chessCount = gameStore.getChessCount();
    // 计算进度条 
    const blackCount = state.chessCount.blackCount;
    const allCount = state.chessCount.blackCount + state.chessCount.whiteCount;
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
        border: 1px green solid;
        
        // 标题改为白色
        :deep(.el-card__header){ color: #FFF; }

        .con-box{
            padding: 10px 20px;
        }

        .role-name-box{
            // 角色名称
            .role-name{ color: #faee0d; font-size: 18px; white-space: nowrap; margin-bottom: 20px; font-weight: 700; }
            // 让黑子角色名称在视觉上更靠左对齐 
            .role-name-black{ float: left; position: relative; left: -8px;}
            // 白子靠右对齐
            .role-name-white{ text-align: right; float: right; }
        }
        
        .chess-box{
            //border: 1px #000 solid;
            .item-box{ display: inline-block; width: 130px; vertical-align: bottom;}
            .item-box-vs{text-align: center; flex: 8;}
            .item-box-progress{ width: calc(100% - 260px); text-align: center; margin-bottom: 8px; }
            .item-box-white{text-align: right; color: #FFF;}
            
            // 黑子、白子 展示
            .chess-show{ width: 50px; height: 50px; margin: auto; border-radius: 50%; display: inline-block;}
            .chess-show{  }
            .item-box-black .chess-show{ background-color: #000; margin-right: 16px;}
            .item-box-white .chess-show{ background-color: #FFF; margin-left: 16px;}

            .chess-count{ display: inline-block; font-size: 36px; position: relative; top: -2px;}
            .item-box-white .chess-count{  }

            // vs 文字
            .vs-text{ display: inline-block; font-size: 36px; /*margin-top: 16px;*/ color: #FAC03D; text-shadow: 0 0 3px #ED723F; }
            //.vs-text{ position: relative; top: -5px; }
        }

        // 进度条相关
        .progress-box{ border: 0px #000 solid; padding: 20px 0px 10px; }
        .progress-box :deep(.el-progress-bar__outer){ background-color: #FFF; }

    }
    

</style>
