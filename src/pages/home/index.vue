<!-- 首页 -->
<template>
    <div>
        <!-- 顶层导航栏 -->
        <nav-top></nav-top>

        <div class="con-panel z-width vue-box nav-content">

            <div class="con-panel-2">
                <h1>黑白棋小游戏</h1>
                
                <router-link to="/select">
                    <el-button type="primary" color="#337be2" size="large" class="play-btn">开始游戏</el-button>
                </router-link>
            </div>

        </div>

        <!-- 底部版权栏 -->
        <nav-bottom></nav-bottom>

    </div>
</template>

<script setup name="home-index">
import NavTop from '/@/pages-components/nav/nav-top.vue';
import NavBottom from '/@/pages-components/nav/nav-bottom.vue';
// import UserPanelLeft from './user-panel-left.vue';
import router from "../../router";

onMounted(() => {
   
    
    
})
</script>

<style scoped lang="scss">
// 整体面板
.con-panel{
    //border: 1px solid #000;
    min-height: 200px;
    margin: 14px auto;
    background-color: transparent;
}
.con-panel-2{
    text-align: center; 
    h1{ font-size: 36px; padding-top: 15vh;}
}
.play-btn{ width: 150px; margin-top: 10vh; }
    
</style>
