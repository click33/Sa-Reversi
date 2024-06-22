<!--
    底部版权栏
-->
<template>
    <div class="nav-bottom-zhan-wei"></div>
    <div class="nav-bottom">
        <div class="z-width">
            Copyright ©2024 xxx-xxx 平台中心 | xx 市 xx 网络科技有限公司 - 提供技术支持 | 备案号：xxxxx
        </div>
    </div>
</template>

<script setup name="nav-bottom">

</script>

<style scoped lang="scss">
    .nav-bottom-zhan-wei{
        clear: both;
        height: 60px;
        padding-top: 20px;
        //background-color: green;
    }
    .nav-bottom{
        position: fixed;
        bottom: 0px;
        z-index: 1000;
        width: 100%;
        height: 60px;
        line-height: 60px;
        text-align: center;
        //background-color: #1672d2
        background-color: #EEE;
        border-top: 1px solid #ddd;
        color: #888;
    }
</style>
