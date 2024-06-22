<!-- 用户 信息 -->
<template>
    <el-card class="user-info-box zdy-card fade-in-ys" 
             :class=" gameStore.activeRole === selectStore.role ? 'active-zhi-zi' : '' " shadow="never">
        <template #header>
            <span>我的信息</span>
            <b class="user-zhi-zi">（当前执子）</b>
        </template>
        <template #default>
            <div class="qi-zi-show-box">
                <div class="qi-zi-show" :class=" 'qi-zi-show-' + (selectStore.role === 'black' ? 'black' : 'white') "></div>
            </div>
            <span class="user-name">{{ selectStore.playerName }}</span>
        </template>
    </el-card>
</template>

<script setup name="com-user-info">
import {useSelectStore} from "../../../store/select";
import {useGameStore} from "../../../store/game";
let selectStore = useSelectStore();
var gameStore = useGameStore();


// console.log(selectStore.level)

</script>

<style scoped lang="scss">
    .user-info-box{
        width: 100%;
        min-height: 100px;
        background-color: #fff;
    }
    
    .qi-zi-show-box{ width: 60px; height: 60px; display: inline-block; margin-right: 14px; border-radius: 3px;
        vertical-align: middle; text-align: center; background-color: #13ce66;  }
    .qi-zi-show{ width: 40px; height: 40px; border-radius: 50%; margin: 10px;  }
    .qi-zi-show-black{ background-color: #000; }
    .qi-zi-show-white{ background-color: #FFF; }
    
    .user-avatar{width: 50px; height: 50px; margin-right: 10px; border-radius: 50%; vertical-align: middle;}
    .user-name{position: relative; top: 1px; font-size: 18px;}
    
    .user-sub-info{ margin-left: 0; color: #777; }
    
    // 当前执子时的样式
    .user-zhi-zi{ display: none; color: green; }
    .active-zhi-zi{
        border: 1px solid #09bb07 !important;
        box-shadow: 0 0 10px #c9ebc7;
        .user-zhi-zi { display: inline; }
    }

</style>
