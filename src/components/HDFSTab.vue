<template>
<div class="hdfs-tag">
    <el-tabs v-model="activeTab">
        <el-tab-pane label="HDFS文件浏览" name="first">
            <HDFSDirectory></HDFSDirectory>
        </el-tab-pane>

        <el-tab-pane label="HDFS存储监控" name="second">
            <div class="line-show" style="margin-left: 50px">
                <el-progress 
                    :text-inside="true" 
                    :stroke-width="24" 
                    :percentage="80" 
                    status="success">
                </el-progress>
            </div>
        </el-tab-pane>

        <el-tab-pane label="节点存储监控" name="third">
            选择主机查看状态：
            <el-input placeholder="" size="small">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
            <div class="dashboard-show" style="margin-left: 50px">
                <el-progress 
                    type="dashboard" 
                    :percentage="percentage"
                    :color="colors">
                </el-progress>
                <el-button @click="increase" icon="el-icon-upload"></el-button>
            </div>
        </el-tab-pane>
    </el-tabs>
</div>
</template>

<script>
import HDFSDirectory from './HDFSDirectory.vue'

export default {
    name: 'HDFSTab',

    components: {
        HDFSDirectory,
    },

    data() {
        return {
            activeTab: 'first',
            percentage: 10,
            colors: [
                {color: '#f56c6c', percentage: 20},
                {color: '#e6a23c', percentage: 40},
                {color: '#5cb87a', percentage: 60},
                {color: '#1989fa', percentage: 80},
                {color: '#6f7ad3', percentage: 100}
            ],
        };
    },

    methods: {
      increase() {
        this.percentage += 10;
        if(this.percentage > 100){
            this.percentage = 100;
        }
      },
    },
}
</script>
