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
        background-color: #FFF;
        border-bottom: 1px solid #e6e6e6;
        box-shadow: 0px 0px 5px #e6e6e6;
    }
    .nav-top-right{
        float: right;
    }
</style>
