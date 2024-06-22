<!-- 全局 loading 图标 -->
<template>
    <div>
        <transition name="loading">
            <div 
                v-if="appStore.isOsLoading" 
                style="width: 100vw; height: 100vh; display: flex; align-items: center; position: fixed; z-index: 10000000; pointer-events: none; top: 0;">
                <div style="flex: 1; text-align: center">
                    <div style="padding-bottom: 10px;">
                        <svg class="loading-svg" viewBox="0 0 1024 1024" width="60" height="60" xmlns="http://www.w3.org/2000/svg" data-v-ba633cb8="">
                            <path fill="#2d8cf0" d="M512 64a32 32 0 0 1 32 32v192a32 32 0 0 1-64 0V96a32 32 0 0 1 32-32zm0 640a32 32 0 0 1 32 32v192a32 32 0 1 1-64 0V736a32 32 0 0 1 32-32zm448-192a32 32 0 0 1-32 32H736a32 32 0 1 1 0-64h192a32 32 0 0 1 32 32zm-640 0a32 32 0 0 1-32 32H96a32 32 0 0 1 0-64h192a32 32 0 0 1 32 32zM195.2 195.2a32 32 0 0 1 45.248 0L376.32 331.008a32 32 0 0 1-45.248 45.248L195.2 240.448a32 32 0 0 1 0-45.248zm452.544 452.544a32 32 0 0 1 45.248 0L828.8 783.552a32 32 0 0 1-45.248 45.248L647.744 692.992a32 32 0 0 1 0-45.248zM828.8 195.264a32 32 0 0 1 0 45.184L692.992 376.32a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0zm-452.544 452.48a32 32 0 0 1 0 45.248L240.448 828.8a32 32 0 0 1-45.248-45.248l135.808-135.808a32 32 0 0 1 45.248 0z"></path>
                        </svg>
                    </div>
                    <div style="color: #2d8cf0; height: 30px; padding-bottom: 10px;">
                        <span v-if="appStore.osLoadingMsg">
                            &nbsp;&nbsp; {{ appStore.osLoadingMsg }}
                        </span>
                    </div>
                </div>
            </div>
        </transition>
    </div>
</template>

<script setup name="os-loading">
import {useAppStore} from "../../store/app";

const appStore = useAppStore();
</script>

<style scoped lang="scss">
    /* --- opacity 渐变 --- */
    .loading-enter-active,
    .loading-leave-active {
        transition: all 0.3s ease;
    }
    .loading-enter-from,
    .loading-leave-to {
        opacity: 0;
    }
</style>
