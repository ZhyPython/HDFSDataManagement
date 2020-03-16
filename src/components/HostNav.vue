<template>
<div class="host-nav">
<el-container style="height: 100%;min-height:100vh">
    <el-header class="sys-header" height=60px>
        <span style="float: left">数据存储与管理系统</span>
        <span style="font-size: 15px">当前用户: {{ user }}</span>
        <el-button type="text" @click="quitSys" style="font-size: 15px; margin-left: 10px">退出</el-button>
    </el-header>
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
    },

    computed: {
        user: {
            get() {
                return localStorage.getItem('username');
            }
        }
    },

    methods: {
        quitSys() {
            localStorage.removeItem('username')
            this.$router.push({path: '/login'})
            // 调取后台接口，删除session
            this.$axios.get("http://127.0.0.1:8000/delete/")
            .then(res => {
                // console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
        }
    },
}
</script>

<style scoped>
.sys-header{
    background-color: #545c64;
    color: #fff;
    text-align: right;
    line-height: 60px;
    font-size: 20px
}

.sys-aside {
    background-color: #545c64;
    text-align: left;
   
}

.host-menu {
    border:5px solid transparent;
}
</style>