<template>
<!-- 导航栏，头部栏，侧边栏和主内容区域 -->
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
                default-active="0"
                background-color="#545c64"
                text-color="#fff">
                <template v-for="(cluster, index) in clusters">
                    <el-menu-item :index="index.toString()">
                        <i class="el-icon-menu"></i>
                        <span slot="title">{{ cluster.displayName }}</span>
                    </el-menu-item>
                </template>
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

    data() {
        return {
            clusters: [],
        }
    },
    
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

    mounted () {
        this.getClusters();
    },

    methods: {
        quitSys() {
            localStorage.removeItem('username')
            this.$router.push({path: '/'})
            // 调取后台接口，删除session
            this.$axios.get(this.$backend + "/delete_session/")
            .then(res => {
                // console.log(res)
            })
            .catch(err => {
                console.log(err)
            })
        },

        getClusters() {
            this.$axios.get(this.$backend + "/get_clusters/")
            .then(res => {
                // console.log(res.data);
                this.clusters = res.data;
            })
            .catch(err => {
                console.log(err);
            })
        },
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