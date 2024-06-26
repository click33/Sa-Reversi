<!-- 黑棋玩家信息 -->
<template>
    <el-card class="user-info-box zdy-card fade-in-ys"
             :class=" gameStore.currentPlayerType === 'black' ? 'active-zhi-zi' : '' " shadow="never">
        <template #header>
            <span>黑棋玩家信息</span>
            <b class="user-zhi-zi">（当前执子）</b>
        </template>
        <template #default>
            <div class="chess-show-box">
                <div class="chess-show chess-show-black"></div>
            </div>
            
            <!-- user 模式 -->
            <template v-if="selectStore.blackRole === 'user' ">
                <span class="user-name">{{ selectStore.username }}</span>
                <span class="user-sub-info">（玩家）</span>
            </template>
            <!-- AI 模式 -->
            <template v-else>
                <span class="user-name">{{ dictStore.getRole( selectStore.blackRole ).name }}</span>
                <span class="user-sub-info">（AI）</span>
            </template>
        </template>
    </el-card>
</template>

<script setup name="com-black-player-info">
import {useSelectStore} from "../../../store/select";
import {useDictStore} from "../../../store/dict";
import {useGameStore} from "../../../store/game";
let selectStore = useSelectStore();
var dictStore = useDictStore();
var gameStore = useGameStore();

</script>

<style scoped lang="scss">
    .user-info-box{
        width: 100%;
        min-height: 100px;
        background-color: #fff;
    }
    
    .chess-show-box{ width: 60px; height: 60px; display: inline-block; margin-right: 14px; border-radius: 3px;
        vertical-align: middle; text-align: center; background-color: #13ce66;  }
    .chess-show{ width: 40px; height: 40px; border-radius: 50%; margin: 10px;  }
    .chess-show-black{ background-color: #000; }
    .chess-show-white{ background-color: #FFF; }
    
    .user-avatar{width: 50px; height: 50px; margin-right: 10px; border-radius: 50%; vertical-align: middle;}
    .user-name{position: relative; top: 1px; font-size: 18px;}
    
    .user-sub-info{ margin-left: 0; color: blue; }
    
    // 当前执子时的样式
    .user-zhi-zi{ display: none; color: green; }
    .active-zhi-zi{
        border: 1px solid #09bb07 !important;
        box-shadow: 0 0 10px #c9ebc7;
        .user-zhi-zi { display: inline; }
    }

</style>
