<!--
    顶层导航栏 
-->
<template>
    <div class="nav-top">
        <div class="z-width">
            <!-- 左边 logo -->
            <nav-top-logo></nav-top-logo>

            <!-- 右边用户信息 -->
            <div class="nav-top-right">
                <router-link to="/select">新对局</router-link>
            </div>
        </div>
    </div>
    <div class="nav-top-zhan-wei"></div>
</template>

<script setup name="nav-top">
import NavTopLogo from './nav-top-logo.vue';


</script>

<style scoped lang="scss">
    .nav-top-zhan-wei{
        height: 60px;
    }
    .nav-top{
        position: fixed;
        top: 0;
        z-index: 1000;
        width: 100%;
        height: 60px;
        line-height: 60px;
        //background-color: #1672d2
        //background-color: #FFF;
        background-color: #00CF70;
        color: #faee0d;
        border-bottom: 1px solid #00AF50;
        box-shadow: 0 0 5px #00CF70;
    }
    .nav-top-right{
        float: right;
        font-weight: 700;
        a { color: #faee0d; }
    }
</style>
