<template>
<!-- 数据导入任务信息查看 -->
<div class="job-info">
    <el-card shadow="hover" style="margin-bottom: 15px">
        <div slot="header">
            <span>正在执行的任务</span>
        </div>
        <el-collapse>
            <el-collapse-item v-for="jobMetric in currentJobMetrics">
                <template slot="title">
                    <el-row :gutter="20" style="font-size: 15px; width: 100%">
                        <el-col :span="8">
                            <span><b>任务ID：</b>{{ Object.keys(jobMetric)[0] }}</span>
                        </el-col>
                        <el-col :span="4">
                            <span><b>状态：</b><span :class="Object.values(jobMetric)[0].state">{{ Object.values(jobMetric)[0].state }}</span></span>
                        </el-col>
                        <el-col :span="6">
                            <span><b>任务启动时间：{{ Object.values(jobMetric)[0].launchTime }}</b></span>
                        </el-col>
                        <el-col :span="6">
                            <span><b>任务进度：</b></span>
                            <el-progress :text-inside="true" :stroke-width="15" :percentage="Object.values(jobMetric)[0].progress" style="width: 130px; display:inline-block"></el-progress>
                        </el-col>
                    </el-row>
                </template>
                <div style="float: left">
                    <p>任务名称：{{ Object.values(jobMetric)[0].taskName }}</p>
                    <p>用户：{{ Object.values(jobMetric)[0].user }}</p>
                    <p>池：{{ Object.values(jobMetric)[0].queue }}</p>
                    <p>资源池利用率：{{ Object.values(jobMetric)[0].queueUsage }} %</p>
                </div>
                <div style="float: right;margin-right: 300px">
                    <p>分配的内存：{{ Object.values(jobMetric)[0].allocatedMB }} MB</p>
                    <p>分配的虚拟核心：{{ Object.values(jobMetric)[0].allocatedVCores }} vcores</p>
                    <p>聚合内存：{{ Object.values(jobMetric)[0].aggregateMemory }} MB-seconds</p>
                    <p>聚合虚拟核心：{{ Object.values(jobMetric)[0].aggregateVcore }} vcore-seconds</p>
                </div>
            </el-collapse-item>
        </el-collapse>
    </el-card>

    <el-card shadow="hover">
        <div slot="header">
            <span>历史任务</span>
        </div>
        <el-collapse>
            <el-collapse-item v-for="jobMetric in historyJobMetrics">
                <template slot="title">
                    <el-row :gutter="20" style="font-size: 15px; width: 100%">
                        <el-col :span="8">
                            <span><b>任务ID：</b>{{ Object.keys(jobMetric)[0] }}</span>
                        </el-col>
                        <el-col :span="4">
                            <span>
                                <b>状态：</b>
                                <span :class="Object.values(jobMetric)[0].state">
                                    {{ Object.values(jobMetric)[0].state }}
                                </span>
                            </span>
                        </el-col>
                        <el-col :span="8">
                            <span><b>任务启动时间：</b>{{ Object.values(jobMetric)[0].launchTime }}</span>
                        </el-col>
                    </el-row>
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
import eventBus from '../assets/js/eventBus.js'

export default {
    name: 'JobInfo',

    data() {
        return {
            currentJobMetrics: [],
            historyJobMetrics: [],
            // 定时器
            timer: '',
        }
    },

    mounted () {
        this.getHistoryJob();
        // 监听事件
        eventBus.$on("jobSubmitted", (jobID) => {
            // console.log(jobID);
            this.getSubmittedJob(jobID);
        });
        // 定时任务：调用函数遍历currentJobMetrics是否有数据，有数据则访问接口获取指标值
        this.timer = setInterval(this.checkJobProgress, 500);
    },

    beforeDestroy () {
        //取消监听事件
        eventBus.$off('jobSubmitted');
        // 清除定时器
        clearInterval(this.timer);
    },

    methods: {
        getSubmittedJob(jobID) {
            this.$axios.get(this.$backend + '/get_current_job_metrics/', {
                params: {
                    'clusterName': this.$clusterInfo.cluster,
                    'jobID': jobID
                }
            })
            .then(res => {
                // 格式化时间戳
                let key = Object.keys(res.data)[0];
                res.data[key].launchTime = this.$processFunc.dateToString(res.data[key].launchTime);
                // 将对象放入currentJobMetrics中
                this.currentJobMetrics.unshift(res.data)
                // console.log(this.currentJobMetrics)
            })
            .catch(err => {
                // console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "无法获取当前任务信息",
                    duration: 3000,
                });
            })
        },

        checkJobProgress() {
            // 检查currentJobMetrics是否有数据,更新每个任务的状态
            if (this.currentJobMetrics.length > 0) {
                for(let i = 0; i < this.currentJobMetrics.length; i++) {
                    // 获取当前对象的jobID
                    let key = Object.keys(this.currentJobMetrics[i])[0];
                    // 更新指标数据
                    this.updateJobProgress(key, i);
                }
            }
        },

        updateJobProgress(jobID, index) {
            this.$axios.get(this.$backend + '/get_current_job_metrics/', {
                params: {
                    'clusterName': this.$clusterInfo.cluster,
                    'jobID': jobID
                }
            })
            .then(res => {
                // 更新进度、状态、内存等信息
                this.currentJobMetrics[index][jobID].state = res.data[jobID].state;
                this.currentJobMetrics[index][jobID].progress = res.data[jobID].progress;
                this.currentJobMetrics[index][jobID].allocatedMB = res.data[jobID].allocatedMB;
                this.currentJobMetrics[index][jobID].allocatedVCores = res.data[jobID].allocatedVCores;
                this.currentJobMetrics[index][jobID].aggregateMemory = res.data[jobID].aggregateMemory;
                this.currentJobMetrics[index][jobID].aggregateVcore = res.data[jobID].aggregateVcore;
                // 如果任务执行完毕，则从currentJobMetrics列表删除，并添加到historyJobMetrics
                if (this.currentJobMetrics[index][jobID].state == 'FINISHED') {
                    this.currentJobMetrics.splice(index, 1);
                    // 添加到历史任务列表时，需要更新指标数据
                    this.$axios.get(this.$backend + '/update_finished_job/', {
                        params: {
                            'clusterName': this.$clusterInfo.cluster,
                            'jobID': jobID
                        }
                    })
                    .then(res => {
                        console.log(res.data);
                        // 格式化时间戳和内存
                        res.data[jobID].launchTime = this.$processFunc.dateToString(res.data[jobID].launchTime);
                        res.data[jobID].physicalMemory = this.$processFunc.formatBytes(res.data[jobID].physicalMemory);
                        res.data[jobID].virtualMemory = this.$processFunc.formatBytes(res.data[jobID].virtualMemory);
                        this.historyJobMetrics.unshift(res.data);
                    })
                    .catch(err => {
                        console.log(err);
                        this.$notify.error({
                            title: "失败",
                            message: "无法将任务" + jobID +"添加到历史任务中",
                            duration: 3000,
                        });
                    })
                }
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法更新" + key + "进度",
                    duration: 3000,
                });
            })
        },

        getHistoryJob() {
            this.$axios.get(this.$backend + '/get_history_job_metrics/', {
                params: {
                    'clusterName': this.$clusterInfo.cluster
                }
            })
            .then(res => {
                // console.log(res.data)
                this.historyJobMetrics = res.data;
                // 格式化时间戳和内存
                for(let i = 0; i < this.historyJobMetrics.length; i++) {
                    // 获取当前对象的键
                    let key = Object.keys(this.historyJobMetrics[i])[0];
                    this.historyJobMetrics[i][key].launchTime = this.$processFunc.dateToString(this.historyJobMetrics[i][key].launchTime);
                    this.historyJobMetrics[i][key].physicalMemory = this.$processFunc.formatBytes(this.historyJobMetrics[i][key].physicalMemory);
                    this.historyJobMetrics[i][key].virtualMemory = this.$processFunc.formatBytes(this.historyJobMetrics[i][key].virtualMemory);
                }
            })
            .catch(err => {
                // console.log(err)
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
.ACCEPTED {
    color: #78d8d6;
}

.RUNNING {
    color: #409EFF;
}

.SUCCEEDED {
    color: #67C23A;
}

.FAILED {
    color: #fa0909;
}

.KILLED {
    color: #909399;
}
</style>>