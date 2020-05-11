<template>
<!-- 通过sqoop将数据从数据库导入到hdfs -->
<div class="data-import">
    <el-form 
        ref="sqoopConf" 
        :model="sqoopForm" 
        :rules="rules"
        status-icon
        label-width="100px">
        <el-form-item label="数据库类型" prop="dbType">
            <el-select 
                v-model="sqoopForm.dbType" 
                :validate-event="false" 
                placeholder="请选择数据库类型" 
                style="width: 400px">
                <el-option label="MySQL" value="mysql"></el-option>
                <el-option label="SQL Server" value="sqlserver"></el-option>
            </el-select>
        </el-form-item>
        <el-form-item label="数据库名" prop="dbName">
            <el-input 
                v-model="sqoopForm.dbName" 
                :validate-event="false" 
                placeholder="要导入的数据库名称" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="数据表名" prop="tableName">
            <el-input 
                v-model="sqoopForm.tableName" 
                :validate-event="false" 
                placeholder="要导入的数据表名称" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="username">
            <el-input 
                v-model="sqoopForm.username" 
                :validate-event="false" 
                placeholder="连接数据库的用户名" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
            <el-input 
                v-model="sqoopForm.password" 
                :validate-event="false" 
                placeholder="连接数据库的密码" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="任务名称" prop="jobName">
            <el-input 
                v-model="sqoopForm.jobName" 
                :validate-event="false" 
                placeholder="提交的mapreduce任务名" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="输出目录" prop="targetDir">
            <el-input 
                v-model="sqoopForm.targetDir" 
                :validate-event="false" 
                placeholder="输出文件在HDFS上的目录，必须为不存在的目录" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item label="任务数量" prop="mapNums">
            <el-input 
                v-model.number="sqoopForm.mapNums" 
                :validate-event="false" 
                placeholder="Map的任务数量，决定着输出文件part-m-*的数量，最小为1" 
                style="width: 400px">
            </el-input>
        </el-form-item>
        <el-form-item>
            <el-button type="primary" size="medium" :disabled="disabled" @click="submitForm">{{ btnText }}</el-button>
            <el-button type="info" @click="resetForm" size="medium" plain>重置配置</el-button>
        </el-form-item>
    </el-form>
</div>
</template>

<script>
import eventBus from '../assets/js/eventBus.js'

export default {
    name: 'SqoopImp',

    data() {
        var validateTargetDir = (rule, value, callback) => {
            // 处理targetDir的首字符是否为'/'
            this.sqoopForm.targetDir = this.sqoopForm.targetDir[0] == '/'
                                        ? this.sqoopForm.targetDir
                                        : '/' + this.sqoopForm.targetDir
            this.$axios.get(this.$backend + '/validate_target_dir/', {
                params: {
                'activeNN': this.$clusterInfo.activeNN.hostIP,
                'targetDir': this.sqoopForm.targetDir
            }
            })
            .then(res => {
                if (res.data.flag == false) {
                    callback(new Error('该目录在HDFS中已存在'));
                } else {
                    callback();
                }
            })
            .catch(err => {
                // console.log(err);
                callback();
                this.$notify.error({
                    title: "失败",
                    message: "无法验证输出目录是否有效",
                    duration: 3000,
                });
            })
        };
        return {
            btnText: '导入数据',
            disabled: false,    // 按钮是否禁用，防止多次点击提交重复任务
            sqoopForm: {
                dbType: '',     //数据库类型
                dbName: '',     //数据库名
                tableName: '',  //表名
                username: '',   //用户名
                password: '',   //密码
                jobName: '',    //mapreduce任务名
                targetDir: '',  //输出目录
                mapNums: ''    //map数量
            },
            rules: {
                dbType: [
                    {required: true, message: '请选择数据库'}
                ],
                dbName: [
                    {required: true, message: '请填写数据库名称'}
                ],
                tableName: [
                    {required: true, message: '请填写数据表名'}
                ],
                username: [
                    {required: true, message: '请填写用户名'}
                ],
                password: [
                    {required: true, message: '请填写密码'}
                ],
                jobName: [
                    {required: true, message: '请填写任务名称'}
                ],
                targetDir: [
                    {required: true, validator: validateTargetDir}
                ],
                mapNums: [
                    {required: true, message: '请输入Map数量'},
                    {type: 'number', message: 'Map数量必须为数字值'}
                ],
            }
        }
    },

    methods: {
        submitForm() {
            this.$refs.sqoopConf.validate((valid, fields) => {
                if (valid) {
                    // 将按钮的文字更改为正在执行，并禁用按钮
                    this.btnText = '执行中...';
                    this.disabled = true;
                    // 设置mapNums默认为1
                    if (this.sqoopForm.mapNums == '') {
                        this.sqoopForm.mapNums = 1;
                    }
                    // 将activeNN添加到表单数据中
                    this.sqoopForm.hostIP = this.$clusterInfo.activeNN.hostIP;
                    // 将系统的当前用户添加到表单数据中
                    this.sqoopForm.sysUser = localStorage.getItem('username');
                    // 将当前集群名称添加到表单数据中
                    this.sqoopForm.clusterName = this.$clusterInfo.cluster;
                    // 定义post请求的数据的格式
                    let data = this.$qs.stringify(this.sqoopForm)
                    this.$axios({
                        method: 'post',
                        url: this.$backend + '/sqoop_import/', 
                        headers: {
                            'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
                        },
                        data
                    })
                    .then(res => {
                        if (res.data.error == "") {
                            this.$notify.success({
                                title: "成功",
                                message: "任务已提交，改任务编号为：" + res.data.jobId,
                                duration: 3000,
                            });
                            // 将jobId传到监控组件中
                            eventBus.$emit("jobSubmitted", res.data.jobId);
                            // 按钮文字更改回导入数据,解除禁用状态
                            this.btnText = '导入数据';
                            this.disabled = false;
                            // 将界面切换至数据导入任务界面
                            this.$emit('switchTab');
                        }
                    })
                    .catch(err => {
                        // console.log(err);
                        // 按钮文字更改回导入数据,解除禁用状态
                        this.btnText = '导入数据';
                        this.disabled = false;
                        this.$notify.error({
                            title: "失败",
                            message: "无法进行数据导入",
                            duration: 3000,
                        });
                    })
                }
            })
        },

        resetForm()　{
            this.$refs.sqoopConf.resetFields();
        }
    }
}
</script>

<style scoped>
.data-import{
    margin-left: 25%;
    margin-right: 25%;
    width: 50%;
}
</style>