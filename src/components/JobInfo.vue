<template>
<!-- 数据导入任务信息查看 -->
<div class="job-info">
    <el-card shadow="hover" style="margin-bottom: 15px">
        <div slot="header">
            <span>正在执行的任务</span>
        </div>
        <el-collapse>
            <el-collapse-item>
                <template slot="title">
                    <p style="font-size: 15px; width: 80%; text-align: center">
                        <span style="float: left"><b>任务ID：</b>{{ name }}</span>
                        <span><b>状态：</b><span class="RUNNING">112</span></span>
                        <span style="float: right"><b>任务启动时间：</b></span>
                    </p>
                </template>
                <div style="float: left">
                    <p>任务名称：</p>
                    <p>用户：</p>
                    <p>池：</p>
                    <p>CPU执行时间（ms）：</p>
                </div>
                <div style="float: right;margin-right: 300px">
                    <p>消耗的物理内存（Bytes）：</p>
                    <p>消耗的虚拟内存（Bytes）：</p>
                    <p>聚合内存（MB-seconds）：</p>
                    <p>聚合虚拟核心（vcore-seconds）：</p>
                </div>
            </el-collapse-item>
        </el-collapse>
    </el-card>

    <el-card shadow="hover">
        <div slot="header">
            <span>历史任务</span>
        </div>
        <el-collapse v-model="activeNames">
            <el-collapse-item v-for="jobMetric in jobMetrics">
                <template slot="title">
                    <p style="font-size: 15px; width: 80%; text-align: center">
                        <span style="float: left"><b>任务ID：</b>{{ Object.keys(jobMetric)[0] }}</span>
                        <span>
                            <b>状态：</b>
                            <span :class="Object.values(jobMetric)[0].state">
                                {{ Object.values(jobMetric)[0].state }}
                            </span>
                        </span>
                        <span style="float: right"><b>任务启动时间：</b>{{ Object.values(jobMetric)[0].launchTime }}</span>
                    </p>
                </template>
                <div style="float: left">
                    <p>任务名称：{{ Object.values(jobMetric)[0].taskName }}</p>
                    <p>用户：{{ Object.values(jobMetric)[0].user }}</p>
                    <p>池：{{ Object.values(jobMetric)[0].queue }}</p>
                    <p>CPU执行时间：{{ Object.values(jobMetric)[0].cpuMilliSeconds }} ms</p>
                </div>
                <div style="float: right;margin-right: 300px">
                    <p>消耗的物理内存：{{ Object.values(jobMetric)[0].physicalMemory }}</p>
                    <p>消耗的虚拟内存：{{ Object.values(jobMetric)[0].virtualMemory }}</p>
                    <p>聚合内存：{{ Object.values(jobMetric)[0].aggregateMemory }} MB-seconds</p>
                    <p>聚合虚拟核心：{{ Object.values(jobMetric)[0].aggregateVcore }} vcore-seconds</p>
                </div>
            </el-collapse-item>
        </el-collapse>
    </el-card>
</div>
</template>

<script>
export default {
    name: 'JobInfo',

    data() {
        return {
            activeNames: ['1'],
            name: 'sqoop',
            jobMetrics: []
        }
    },

    mounted () {
        this.getHistoryJob();
    },

    methods: {
        getHistoryJob() {
            this.$axios.get(this.$backend + '/get_history_job_metrics',{
                params: {
                    'clusterName': this.$clusterInfo.cluster
                }
            })
            .then(res => {
                // console.log(res.data)
                this.jobMetrics = res.data;
                // 格式化时间戳和内存
                for(let i = 0; i < this.jobMetrics.length; i++) {
                    // 获取当前对象的键
                    let key = Object.keys(this.jobMetrics[i])[0];
                    this.jobMetrics[i][key].launchTime = this.$processFunc.dateToString(this.jobMetrics[i][key].launchTime);
                    this.jobMetrics[i][key].physicalMemory = this.$processFunc.formatBytes(this.jobMetrics[i][key].physicalMemory);
                    this.jobMetrics[i][key].virtualMemory = this.$processFunc.formatBytes(this.jobMetrics[i][key].virtualMemory);
                }
            })
            .catch(err => {
                console.log(err)
                this.$notify.error({
                    title: "失败",
                    message: "无法获取历史任务信息",
                    duration: 3000,
                });
            })
        }
    }

}
</script>

<style scoped>
.RUNNING {
    color: #409EFF;
}

.SUCCEEDED {
    color: #67C23A;
}

.FAILED {
    color: #F56C6C;
}

.KILLED {
    color: #909399;
}
</style>>