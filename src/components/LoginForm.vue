<template>
<div class="login">
<el-row>
    <h2 align="center">HDFS数据存储与管理系统</h2>
    <el-col :span="6" :offset="9">
    <el-form 
        ref="form" 
        :model="formData" 
        status-icon 
        label-width="80px"
        :rules="rules">
        <el-form-item label="用户名" prop="username">
            <el-input v-model="formData.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
            <el-input type="password" v-model="formData.password" autocomplete="off"></el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" @click="submitForm('form')">登录</el-button>
            <el-button >注册</el-button>
        </el-form-item>
    </el-form>
    </el-col>
</el-row>
</div>    
</template>

<script>
export default {
    name: 'LoginForm',

    data() {
        return {
            formData: {
                username: '',
                password: ''
            },
            // trigger: 'blur'为鼠标点击其他地方，trigger: 'change'为检验的字符变化的时候
            rules: {
                username: [
                    {required: true, message: '请输入用户名', trigger: 'blur'}
                ],
                password: [
                    {required: true, message: '请输入密码', trigger: 'blur'}
                ]
            }
        }
    },

    methods: {
        submitForm(formName) {
            // 校验表单后调用回调函数传入两个参数，校验结果和未通过校验的字段
            this.$refs[formName].validate((valid, fields) => {
                if (valid) {
                    this.$axios.get('http://127.0.0.1:8000')
                    .then(res => {
                        console.log(res.data)
                    })
                    .catch(err => {
                        console.log(err)
                    })
                } else {
                    window.alert('用户名或密码错误')
                }
            })
        }
    },
}
</script>
