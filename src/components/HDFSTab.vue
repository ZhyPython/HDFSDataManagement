<template>
<!-- 用户界面的tab选项 -->
<div class="hdfs-tag">
<el-card class="box-card">
    <el-tabs v-model="activeTab">
        <el-tab-pane name="first">
            <span slot="label"><i class="el-icon-notebook-2"></i> HDFS文件浏览</span>
            <HDFSDirectory ref="hdfsDirectory"></HDFSDirectory>
        </el-tab-pane>

        <el-tab-pane name="second">
            <span slot="label"><i class="el-icon-pie-chart"></i> HDFS存储监控</span>
            <HDFSMonitor ref="hdfsMonitor"></HDFSMonitor>
        </el-tab-pane>

        <el-tab-pane name="third">
            <span slot="label"><i class="el-icon-copy-document"></i> 数据导入</span>
            <SqoopImp @switchTab="switchTab"></SqoopImp>
        </el-tab-pane>

        <el-tab-pane name="fourth">
            <span slot="label"><i class="el-icon-collection"></i> 数据导入任务</span>
            <JobInfo @refreshOutputDir="refreshOutputDir"></JobInfo>
        </el-tab-pane>

    </el-tabs>
</el-card>
</div>
</template>

<script>
import HDFSDirectory from './HDFSDirectory.vue'
import HDFSMonitor from './HDFSMonitor.vue'
import JobInfo from './JobInfo.vue'
import SqoopImp from './SqoopImp.vue'

export default {
    name: 'HDFSTab',

    components: {
        HDFSDirectory,
        HDFSMonitor,
        JobInfo,
        SqoopImp,
    },

    mounted () {
        // 检测是否为管理员，判断是否需要渲染用户管理选项卡
        // this.checkAdminUser();
    },

    data() {
        return {
            activeTab: 'first',
            showUsersFlag: false,
        };
    },

    methods: {
        refreshOutputDir() {
            // 导入任务结束后刷新hdfs目录，使得能够查看输出目录
            let ins = this.$refs.hdfsDirectory;
            ins.initDir();
        },

        switchTab() {
            this.activeTab = 'fourth';
        },

    },
}
</script>
