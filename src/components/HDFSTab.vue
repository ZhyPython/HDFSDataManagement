<template>
<!-- 用户界面的tab选项 -->
<div class="hdfs-tag">
<el-card class="box-card">
    <el-tabs v-model="activeTab">
        <el-tab-pane name="first">
            <span slot="label"><i class="el-icon-notebook-2"></i> HDFS文件浏览</span>
            <HDFSDirectory></HDFSDirectory>
        </el-tab-pane>

        <el-tab-pane name="second">
            <span slot="label"><i class="el-icon-pie-chart"></i> HDFS存储监控</span>
            <HDFSMonitor></HDFSMonitor>
        </el-tab-pane>

        <el-tab-pane name="third">
            <span slot="label"><i class="el-icon-monitor"></i> 节点存储监控</span>
            <NodeMonitor></NodeMonitor>
        </el-tab-pane>
    </el-tabs>
</el-card>
</div>
</template>

<script>
import HDFSDirectory from './HDFSDirectory.vue'
import HDFSMonitor from './HDFSMonitor.vue'
import NodeMonitor from './NodeMonitor.vue'

export default {
    name: 'HDFSTab',

    components: {
        HDFSDirectory,
        HDFSMonitor,
        NodeMonitor,
    },

    data() {
        return {
            activeTab: 'first',
            
        };
    },

    methods: {
        
    },
}
</script>
