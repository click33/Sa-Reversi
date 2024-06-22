<!-- 错误页 403 -->
<template>
    <div class="con-box" style="background-color: #fafeff">
        <div class="con-box2">
            <el-row>
                <el-col :span="6"></el-col>
                <el-col :span="6" class="nr-img-box">
                    <img class="nr-img ele-an-0" src="../../assets/err-icon.png" alt="404">
                </el-col>
                <el-col :span="1"></el-col>
                <el-col :span="6" class="nr-fox">
                    <h2 class="nr-title ele-an-1">403 Forbidden !</h2>
                    <p class="nr-sub-title ele-an-2">你没有权限打开这个页面...</p>
                    <p class="nr-info ele-an-3">请检查您输入的URL是否正确，或单击下面按钮返回主页。</p>
                    <p class="nr-btn-box ele-an-4">
                        <router-link to="/">
                            <el-button type="primary" size="large" round>回到首页</el-button>
                        </router-link>
                    </p>
                </el-col>
                <el-col :span="5"></el-col>
            </el-row>
            <div style="height: 15vh;"></div>
        </div>
    </div>
</template>

<script setup name="404">

</script>

<style lang="scss" scoped>
.con-box{
    width: 100%; height: 100vh; display: flex; align-items: center; text-align: center;
}
.con-box2{
    flex: 1;
}

.nr-img-box{text-align: left;}
.nr-img{width: 100%;}
.nr-fox{text-align: left;}
.nr-title{ padding-top: 8vh; font-size: 36px; color: #1582f0;}
.nr-sub-title{margin-top: 22px; font-size: 20px; color: #333; font-weight: bold;}
.nr-info{margin-top: 15px; font-size: 14px; color: #666;}
.nr-btn-box{margin-top: 40px;}

// 动画
@for $i from 0 through 4 {
    .ele-an-#{$i} {
        opacity: 0;
        animation-name: bottom-to-top;
        animation-duration: 0.5s;
        animation-fill-mode: forwards;
        animation-delay: calc(($i + 2) / 10) + s;
    }
}

</style>
