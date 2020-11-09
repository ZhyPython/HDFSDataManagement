<template>
<!-- 导航栏，头部栏，侧边栏和主内容区域 -->
<div class="host-nav">
<el-container style="height: 100%;min-height:100vh">
    <el-header class="sys-header" height=60px>
        <span style="float: left">数据存储与管理系统</span>
        <el-dropdown>
            <span class="el-dropdown-link"><i class="el-icon-user-solid"/> {{ user }} <i class="el-icon-caret-bottom"/></span>
            <el-dropdown-menu slot="dropdown">
                <el-dropdown-item @click.native="handleModifyPasswd">更改密码</el-dropdown-item>
                <el-dropdown-item v-show="!isAdmin" @click.native="cancelAccount">注销账号</el-dropdown-item>
                <el-dropdown-item @click.native="quitSys">退出系统</el-dropdown-item>
            </el-dropdown-menu>
        </el-dropdown>
    </el-header>
    <el-container>
        <el-aside width="220px" class="sys-aside">
            <el-menu
                class="host-menu"
                default-active="0"
                background-color="#545c64"
                text-color="#fff"
                @select="handleSelect">
                <el-menu-item :index="usermanage" v-if="isAdmin">
                    <i class="el-icon-s-custom"></i>
                    <span slot="title">用户管理</span>
                </el-menu-item>
                <el-submenu index="cluster">
                    <template slot="title">
                        <i class="el-icon-s-data"></i>
                        <span>集群信息</span>
                    </template>
                    <el-menu-item-group>
                        <template v-for="(cluster, index) in clusters">
                            <el-menu-item :index="index.toString()">
                                <i class="el-icon-s-platform"></i>
                                <span slot="title">{{ cluster.displayName }}</span>
                            </el-menu-item>
                        </template>
                    </el-menu-item-group>
                </el-submenu>
            </el-menu>
        </el-aside>
        <el-main class="sys-main">
            <HDFSTab v-show="!showUsers" ref="hdfsTab"></HDFSTab>
            <el-card v-show="showUsers" class="box-card">
                <h3 style="text-align: center; margin-top: 10px; margin-bottom: 0px">用户管理列表</h3>
                <el-divider></el-divider>
                <UserManager></UserManager>
            </el-card>
        </el-main>
    </el-container>
</el-container>

<el-dialog
    title="更改密码"
    :lock-scroll=false
    width="40%"
    :visible.sync="passwdDialogVisible">
    <el-form 
        ref="passwdForm" 
        :model="passwdForm"
        status-icon
        :rules="passwdRules">
        <el-form-item label="新的密码" prop="newPasswd">
            <el-input v-model="passwdForm.newPasswd" type="password" :validate-event="false"></el-input>
        </el-form-item>
        <el-form-item label="确认密码" prop="checkNewPasswd">
            <el-input v-model="passwdForm.checkNewPasswd" type="password" :validate-event="false"></el-input>
        </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
        <el-button size="medium" @click="handleClosePasswdDialog">取 消</el-button>
        <el-button size="medium" 
                type="primary" 
                @click="modifyPasswd">确 定
        </el-button>
    </span>
</el-dialog>
</div>
</template>

<script>
import HDFSTab from './HDFSTab'
import UserManager from './UserManager.vue'

export default {
    name: 'HostNav',

    data() {
        var validateNewPass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
                this.$refs.passwdForm.validateField('checkNewPasswd');
            } else {
                if (this.passwdForm.checkNewPasswd !== '') {
                    this.$refs.passwdForm.validateField('checkNewPasswd');
                }
                callback();
            }
        };
        var validateCheckPass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请确认密码'));
            } else if (value !== this.passwdForm.newPasswd) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            usermanage: 'usermanage',
            showUsers: false,
            clusters: [],
            isAdmin: null,      // 判断是否显示用户管理界面
            passwdDialogVisible: false,
            passwdForm: {
                newPasswd: '',
                checkNewPasswd: ''
            },
            passwdRules: {
                newPasswd: [
                    {required:true, validator: validateNewPass}
                ],
                checkNewPasswd: [
                    {required: true, validator: validateCheckPass}
                ]
            },
        }
    },
    
    components: {
        HDFSTab,
        UserManager,
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
        this.checkAdminUser();
    },

    methods: {
        checkAdminUser() {
            this.$axios.get(this.$backend + '/check_admin_user/', {
                params: {
                    'username': localStorage.getItem('username')
                }
            })
            .then(res => {
                // console.log(res.data.flag)
                if (res.data.flag === 0) {
                    this.isAdmin = true;
                } else {
                    this.isAdmin = false;
                }
            })
            .catch(err => {
                console.log('获取用户信息失败：' + err)
            })
        },

        handleModifyPasswd() {
            this.passwdDialogVisible = true;
        },

        modifyPasswd() {
            // 校验表单后调用回调函数传入两个参数，校验结果和未通过校验的字段
            this.$refs.passwdForm.validate((valid, fields) => {
                if (valid) {
                    let data = {
                        'username': localStorage.getItem('username'),
                        'passwd': this.$processFunc.hashPwd(this.passwdForm.newPasswd)
                    }
                    this.$axios.post(this.$backend + '/modify_passwd/', data)
                    .then(res => {
                        this.quitSys();
                        this.$message({
                                message: '密码修改成功，请重新登录系统',
                                center: true,
                                type: 'success'
                            })
                    })
                    .catch(err => {
                        this.$notify.error({
                            title: "失败",
                            message: "无法更改密码",
                            duration: 3000,
                        });
                    })
                }
            })
        },

        handleClosePasswdDialog() {
            this.passwdDialogVisible = false;
            this.$refs.passwdForm.resetFields();
            this.passwdForm.newPasswd = '';
            this.passwdForm.checkNewPasswd = '';
        },

        cancelAccount() {
            this.$confirm('确认注销该账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                // 注销账号，采用禁用账号的接口，默认currentUser为admin，将当前用户加入users列表
                let users = new Array();
                users[0] = {'username': localStorage.getItem('username')};
                let data = {
                    'currentUser': 'admin',
                    'users': users
                };
                // 调用接口处理
                this.$axios.post(this.$backend + '/disable_user/', data)
                .then(res => {
                    this.quitSys();
                })
                .catch(err => {
                    this.$notify.error({
                        title: "失败",
                        message: "无法注销账号",
                        duration: 3000,
                    });
                })
            })
            .catch((err) => {
                console.log(err);
            })
        },

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
                // 增加一个集群
                // this.clusters.push({'displayName': '集群2', 'name': 'Cluster 2'})
            })
            .catch(err => {
                console.log(err);
            })
        },

        handleSelect(key, keyPath) {
            if (key === 'usermanage') {
                this.showUsers = true;
                return;
            }
            this.showUsers = false;
            // 将this.$clusterInfo赋给局部变量，否则ajax回调函数无法赋值
            let clusterInfo = this.$clusterInfo
            // 获取选中的集群name
            let clusterName = this.clusters[key].name
            this.$clusterInfo.cluster = clusterName
            // 获取active状态的namenode,请求成功返回主机名称和IP，失败则置activeNN为{}
            let url = this.$backend
                      + "/get_active_namenode/?clusterName="
                      + clusterName
            jQuery.ajax({
                type: 'GET',
                url: url,
                dataType: 'json',
                async: false,
                success: function(res) {
                    // console.log(res)
                    clusterInfo.activeNN = res
                },
                error: function(err){
                    clusterInfo.activeNN = {}
                }
            })
            // console.log(this.$clusterInfo)
            // 获取HDFSDirectory组件的实例，重新渲染目录数据
            let hdfsDirIns = this.$refs.hdfsTab.$refs.hdfsDirectory
            hdfsDirIns.initDir()
            // 获取HDFSMonitor组件的实例，重新渲染监控数据
            let hdfsMonIns = this.$refs.hdfsTab.$refs.hdfsMonitor
            hdfsMonIns.handleMetrics()
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

.el-dropdown-link {
    cursor: pointer;
    color: #409EFF;
    font-size: 15px;
    margin-right: 20px
  }
</style>