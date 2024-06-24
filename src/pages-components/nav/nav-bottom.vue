<!--
    底部版权栏
-->
<template>
    <div class="nav-bottom-zhan-wei"></div>
    <div class="nav-bottom">
        <div class="z-width">
            Copyright ©2024 {{ settingStore.title }} (在线演示站) | 开源仓库：
            <a class="a-link" href="https://gitee.com/click33/Sa-Reversi" target="_blank">Gitee</a>
            <a class="a-link" href="https://github.com/click33/Sa-Reversi" target="_blank">GitHub</a>
            <a class="a-link" href="https://gitcode.com/click33/Sa-Reversi" target="_blank">GitCode</a>
             | 备案号：
            <a class="a-link" href="https://beian.miit.gov.cn/" target="_blank">鲁ICP备18046274号-1</a>
        </div>
    </div>
</template>

<script setup name="nav-bottom">
import { useSettingStore } from "../../store/setting";
const settingStore = useSettingStore();

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
    .a-link{
        margin-right: 8px;
        color: #888;
        &:hover{
            color: #44f;
            text-decoration: underline;
        }
    }
</style>
