<!-- 左上：logo部分 -->
<template>
    <router-link to="/">
        <div class="com-logo-box" :title="settingStore.title">
            <img :src="settingStore.logo" class="nav-logo" alt="logo">
            <span class="nav-title">{{ settingStore.title }} </span>
        </div>
    </router-link>
</template>

<script setup name="nav-top-logo">
import { useSettingStore } from "../../store/setting";
const settingStore = useSettingStore();

</script>

<style scoped>
.com-logo-box {
    cursor: pointer;
    overflow: hidden;
    display: inline-block;
    white-space: nowrap;
    height: 60px;
    /*border: 1px solid #000;*/
}

.nav-logo {
    width: 40px;
    height: 40px;
    /*border-radius: 5px;*/
    vertical-align: middle;
    margin-right: 14px;
    /*border: 1.5px solid green;*/
}

.nav-title{font-size: 1.2em; color: #faee0d; text-shadow: 0 0 1px #faee0d; font-weight: 700; vertical-align: middle;}

</style>
