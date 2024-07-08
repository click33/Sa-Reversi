<template>
    <div :class=" 'app-theme app-theme-' + selectStore.theme" >
        <!-- vue-router -->
        <router-view/>

        <!-- 全局 loading 加载图标 -->
        <os-loading></os-loading>
    </div>
</template>

<script setup>
import OsLoading from './pages-components/com/os-loading.vue';
import {useSelectStore} from "./store/select";
const selectStore = useSelectStore();

// 监听 gameStore，用户改动时，缓存下来
watch(selectStore, () => {
    selectStore.setSelectStoreToLocal();
})

</script>

<style lang="scss">
.app-theme{ overflow: auto;}
html,body,#app,.app-theme{height: 100%;}

.app-theme-light{
    background-image: url('assets/page-bg.jpg');
    background-size: auto 30%;
}
.app-theme-dark{
    background-image: url('assets/page-bg-dark.png');
    background-size: auto 36%;
    
    .nav-top{
        background-color: transparent !important;
        border-bottom: 1px solid #444 !important;
        box-shadow: 0 0 5px #444 !important;
    }
    .nav-bottom{background-color: transparent !important;}
    .small--index-page{.con-panel-2 h1{color: #FFF;}}
    .small--select-page .con-panel-scroll{background-color: #DCDEE6}
    
    .small--game-page{
        .board-box{ background: rgba(0, 219, 118, 0.8); }
        .small-com-battle-data{ background: rgba(0, 219, 118, 0.7); }
        .small-com-room-info{ background: rgba(39, 40, 34, 0.8)}
        .small-message-box{ background: rgba(39, 40, 34, 0.8)}
    }
    
}

.app-theme{animation: bg-move 60s 0.2s linear infinite normal;} 
@keyframes bg-move {
    from {background-position: 0 0%;}
    to {background-position: -40vw 0%;}
}


</style>
