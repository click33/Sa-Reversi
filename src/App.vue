<template>
    <!-- vue-router -->
    <router-view />

    <!-- 全局 loading 加载图标 -->
    <os-loading></os-loading>

</template>

<script setup>
import OsLoading from './pages-components/com/os-loading.vue';

</script>

<style lang="scss">

body{
    background-image: url('assets/page-bg.jpg');
    //background-size: 100% 100%;
}

</style>
