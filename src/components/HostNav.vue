<template>
<div class="host-nav">
<el-container style="height: 100%;min-height:100vh">
    <el-header class="sys-header">数据存储与管理系统</el-header>
    <el-container>
        <el-aside width="180px" class="sys-aside">
            <el-menu
                class="host-menu"
                default-active="1"
                background-color="#545c64"
                text-color="#fff">
                <el-menu-item index="1">
                    <i class="el-icon-menu"></i>
                    <span slot="title">主机一</span>
                </el-menu-item> 
                <el-menu-item index="2">
                    <i class="el-icon-menu"></i>
                    <span slot="title">主机二</span>
                </el-menu-item>
            </el-menu>
        </el-aside>
        <el-main class="sys-main">
            <HDFSTab></HDFSTab>
        </el-main>
    </el-container>
</el-container>
</div>
</template>

<script>
import HDFSTab from './HDFSTab'

export default {
    name: 'HostNav',
    
    components: {
        HDFSTab,
    }
}
</script>

<style scoped>
.sys-header{
    background-color: #545c64;
    color: #fff;
    /* text-align: left; */
    line-height: 60px;
    /* position:fixed;
    width: 100%; */
}

.sys-aside {
    background-color: #545c64;
    text-align: left;
    /* position: fixed;
    z-index: 1; */
}

/* .sys-main {
    position:relative;
} */

.host-menu {
    border:5px solid transparent;
}
</style>