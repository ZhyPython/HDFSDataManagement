<template>
<el-row>
    <el-col :span="18" :offset="3">
    <div class="hdfs-tag">
        <el-tabs type="border-card">
            <el-tab-pane>
                <span slot="label"><i class="el-icon-coin"></i> HDFS存储监控</span>
                <div class="line-show" style="margin-left: 50px">
                    <el-progress 
                        :text-inside="true" 
                        :stroke-width="24" 
                        :percentage="80" 
                        status="success">
                    </el-progress>
                </div>
                <div id="test">
                    <h1>网站列表</h1>
                        {{ info }}
                    <h2>列表</h2>
                </div>
            </el-tab-pane>

            <el-tab-pane label="消息中心">
                <span slot="label"><i class="el-icon-monitor"></i> 节点存储监控</span>
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
    </el-col>
</el-row>
</template>

<script>
import axios from 'axios'
export default {
    name: 'HDFSTag',

    componets: {
    },

    data() {
        return {
            percentage: 10,
            colors: [
                {color: '#f56c6c', percentage: 20},
                {color: '#e6a23c', percentage: 40},
                {color: '#5cb87a', percentage: 60},
                {color: '#1989fa', percentage: 80},
                {color: '#6f7ad3', percentage: 100}
            ],
            info: 12132,
        };
    },

    mounted () {
    axios
      .get('https://www.runoob.com/try/ajax/json_demo.json')
      .then(response => {
        this.info = response.data.sites
        // console.log("获取信息" + this.info)
        })
      .catch(function (error) { // 请求失败处理
        window.alert("请求错误" + error);
      });
    },

    methods: {
      increase() {
        this.percentage += 10;
        if(this.percentage > 100){
            this.percentage = 100;
        }
      }
    },
}
</script>