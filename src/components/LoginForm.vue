<template>
<div class="login">
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
            loginFormData: {
                username: '',
                password: '',
            },
            signUpFormData: {
                signUpUsername: '',
                signUpPassword: '',
                signUpPassword2: '',
            },
            signUpFlag: false,
            // trigger: 'blur'为鼠标点击其他地方，trigger: 'change'为检验的字符变化的时候
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

    methods: {
        submitForm(formName) {
            // 校验表单后调用回调函数传入两个参数，校验结果和未通过校验的字段
            this.$refs[formName].validate((valid, fields) => {
                if (valid) {
                    let data = this.$qs.stringify(this.loginFormData)
                    this.$axios({
                        method: 'post',
                        url: 'http://127.0.0.1:8000/login/', 
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
            } else if (data.info == '当前用户不存在') {
                this.$message.error('当前用户不存在')
            } else if (data.info == '密码错误') {
                this.$message.error('密码错误')
            }
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
                    data['password'] = this.signUpFormData.signUpPassword
                    data = this.$qs.stringify(data)
                    this.$axios({
                        method: 'post',
                        url: 'http://127.0.0.1:8000/signup/', 
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        },
                        data
                    })
                    .then(res => {
                        // console.log(res)
                        if (res.data.info == 'success') {
                            this.$message.success('注册用户成功，请登录。')
                            this.handleLogin()
                        }
                        if (res.data.info == '用户已存在') {
                            this.$message.error('用户名已存在，请重新注册')
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
