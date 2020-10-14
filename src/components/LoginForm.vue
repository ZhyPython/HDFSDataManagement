<template>
<!-- 登录注册表单 -->
<div class="login">
    <!-- 初始化超级管理员表单 -->
    <div v-if="initSuperAdmin">
    <el-card  shadow="hover" style="text-align: center; width: 400px">
        <h2>初始化超级管理员</h2>
        <el-form 
            ref="initSuperAdminForm" 
            :model="initSuperAdminFormData"
            status-icon 
            :rules="initSuperAdminRules">
            <el-form-item label="超级管理员用户名" prop="superAdminName">
                <el-input 
                    v-model="initSuperAdminFormData.superAdminName"
                    :validate-event="false">
                </el-input>
            </el-form-item>
            <el-form-item label="超级管理员用户密码" prop="superAdminPassword">
                <el-input 
                    type="password" 
                    v-model="initSuperAdminFormData.superAdminPassword" 
                    autocomplete="off"
                    :validate-event="false">
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button 
                    type="primary"
                    @click="signUpSuperAdmin">注册超级管理员
                </el-button>
            </el-form-item>
        </el-form>
    </el-card>
    </div>

    <div v-else>
    <el-card v-show="signUpFlag" shadow="hover" style="text-align: center; width: 400px">
        <h2>用户注册</h2>
        <el-form 
            ref="signUpForm" 
            :model="signUpFormData"
            status-icon 
            :rules="signUpRules">
            <el-form-item label="用户名" prop="signUpUsername">
                <el-input 
                    v-model="signUpFormData.signUpUsername"
                    :validate-event="false">
                </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="signUpPassword">
                <el-input 
                    type="password" 
                    v-model="signUpFormData.signUpPassword" 
                    autocomplete="off"
                    :validate-event="false">
                </el-input>
            </el-form-item>
            <el-form-item label="确认密码" prop="signUpPassword2">
                <el-input 
                    type="password"
                    v-model="signUpFormData.signUpPassword2"
                    :validate-event="false"
                    autocomplete="off">
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button 
                    type="text"
                    @click="handleLogin"
                    style="margin-right: 40px; margin-left: -20px">已有用户，登录
                </el-button>
                <el-button type="primary" @click="signUp">注册</el-button>
            </el-form-item>
        </el-form>
    </el-card>

    <el-card v-show="!signUpFlag" shadow="hover" style="text-align: center; width: 400px">
        <h2>HDFS数据存储与管理系统</h2>
        <el-form 
            ref="loginForm" 
            :model="loginFormData"
            status-icon 
            :rules="loginRules">
            <el-form-item label="用户名" prop="username">
                <el-input 
                    v-model="loginFormData.username" 
                    :validate-event="false">
                </el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
                <el-input 
                    type="password" 
                    v-model="loginFormData.password"
                    :validate-event="false"
                    @keyup.enter.native="submitForm('loginForm')"
                    autocomplete="off">
                </el-input>
            </el-form-item>
            <el-form-item>
                <el-button 
                    type="primary" 
                    @click="submitForm('loginForm')"
                    style="margin-right: 40px; margin-left: -20px">登录
                </el-button>
                <el-button type="text" @click="handleSignUp">注册用户</el-button>
            </el-form-item>
        </el-form>
    </el-card>
    </div>
</div>    
</template>

<script>
export default {
    name: 'LoginForm',

    data() {
        var validatePass = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请输入密码'));
                this.$refs.signUpForm.validateField('signUpPassword2');
            } else {
                if (this.signUpFormData.signUpPassword2 !== '') {
                    this.$refs.signUpForm.validateField('signUpPassword2');
                }
                callback();
            }
        };
        var validatePass2 = (rule, value, callback) => {
            if (value === '') {
                callback(new Error('请再次输入密码'));
            } else if (value !== this.signUpFormData.signUpPassword) {
                callback(new Error('两次输入密码不一致!'));
            } else {
                callback();
            }
        };
        return {
            initSuperAdminFormData: {
                superAdminName: '',
                superAdminPassword: ''
            },
            loginFormData: {
                username: '',
                password: '',
            },
            signUpFormData: {
                signUpUsername: '',
                signUpPassword: '',
                signUpPassword2: '',
            },
            initSuperAdmin: false,
            signUpFlag: false,
            // trigger: 'blur'为鼠标点击其他地方，trigger: 'change'为检验的字符变化的时候
            initSuperAdminRules: {
                superAdminName: [
                    {required: true, message: '请输入超级管理员用户名称'}
                ],
                superAdminPassword: [
                    {required: true, message: '请输入超级管理员用户密码'}
                ]
            },
            loginRules: {
                username: [
                    {required: true, message: '请输入用户名'}
                ],
                password: [
                    {required: true, message: '请输入密码'}
                ]
            },
            signUpRules: {
                signUpUsername: [
                    {required: true, message: '请输入用户名'}
                ],
                signUpPassword: [
                    {required:true, validator: validatePass}
                ],
                signUpPassword2: [
                    {required: true, validator: validatePass2}
                ]
            },
        }
    },

    mounted () {
        this.check_has_super_admin();
    },

    methods: {
        check_has_super_admin() {
            this.$axios.get(this.$backend + '/check_has_super_admin/')
            .then(res => {
                // 判断是否有超级管理员用户，没有就显示初始化界面，否则显示登录界面
                if (res.data.flag == false) {
                    this.initSuperAdmin = true;
                } else {
                    this.initSuperAdmin = false;
                }
            })
            .catch(err => {
                console.log(err)
            })
        },

        submitForm(formName) {
            // 校验表单后调用回调函数传入两个参数，校验结果和未通过校验的字段
            this.$refs[formName].validate((valid, fields) => {
                if (valid) {
                    let data = {};
                    data['username'] = this.loginFormData.username;
                    data['password'] = this.$processFunc.hashPwd(this.loginFormData.password);
                    data = this.$qs.stringify(data)
                    this.$axios({
                        method: 'post',
                        url: this.$backend + '/login/', 
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        },
                        data
                    })
                    .then(res => {
                        // console.log(res)
                        this.validResInfo(res.data)
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            })
        },

        validResInfo(data) {
            if (data.info == 'success') {
                // 跳转至目录界面
                this.$router.push({path: 'HostNav'})
            } else {
                // this.$message.error(data.info)
                this.$message({
                    message: data.info,
                    center: true,
                    type: 'error'
                })
            }
        },

        signUpSuperAdmin() {
            this.$refs.initSuperAdminForm.validate((valid, fields) => {
                if (valid) {
                    this.initSuperAdminFormData.superAdminPassword = this.$processFunc.hashPwd(this.initSuperAdminFormData.superAdminPassword);
                    // 传输hdfs超级用户的加密密码
                    this.initSuperAdminFormData['hdfsPasswd'] = this.$processFunc.hashPwd('hdfs');
                    let data = this.$qs.stringify(this.initSuperAdminFormData)
                    this.$axios({
                        method: 'post',
                        url: this.$backend + '/init_super_admin/', 
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        },
                        data
                    })
                    .then(res => {
                        // console.log(res)
                        if (res.data.flag == true) {
                            this.$message({
                                message: '超级管理员初始化成功',
                                center: true,
                                type: 'success'
                            })
                            // 跳转到登录界面
                            this.initSuperAdmin = false;
                        } else {
                            this.$message({
                                message: '超级管理员初始化失败',
                                center: true,
                                type: 'error'
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            })
        },

        handleLogin() {
            // this.$refs.signUpForm.clearValidate()
            this.$refs.signUpForm.resetFields()
            this.signUpFlag = false
        },

        handleSignUp() {
            // this.$refs.loginForm.clearValidate()
            this.$refs.loginForm.resetFields()
            this.signUpFlag = true
        },

        signUp() {
            this.$refs.signUpForm.validate((valid, fields) => {
                // console.log('验证信息', valid, fields)
                if (valid) {
                    // 格式化用户名和密码
                    let data = {}
                    data['username'] = this.signUpFormData.signUpUsername
                    data['password'] = this.$processFunc.hashPwd(this.signUpFormData.signUpPassword);
                    data = this.$qs.stringify(data)
                    this.$axios({
                        method: 'post',
                        url: this.$backend + '/signup/', 
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        },
                        data
                    })
                    .then(res => {
                        // console.log(res)
                        if (res.data.info == 'success') {
                            // this.$message.success('注册成功，请联系管理员审核账号后登录系统')
                            this.$message({
                                message: '注册成功，请联系管理员审核账号后登录系统',
                                center: true,
                                type: 'success'
                            })
                            this.handleLogin()
                        }
                        if (res.data.info == '用户已存在') {
                            // this.$message.error('用户名已存在，请重新注册')
                            this.$message({
                                message: '用户名已存在，请重新注册',
                                center: true,
                                type: 'error'
                            })
                        }
                    })
                    .catch(err => {
                        console.log(err)
                    })
                }
            })
            
        },

    },
}
</script>

<style scoped>
.login {
    position: absolute;
    top: 35%;
    left: 50%;
    transform: translate(-50%, -50%);
}
</style>
