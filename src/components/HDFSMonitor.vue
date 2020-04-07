<template>
<!-- HDFS监控 -->
<div class="hdfs-monitor">
<el-row :gutter="20">
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.dfs_capacity"></highcharts>
        </el-card>
    </el-col>
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.dfs_capacity_used"></highcharts>
        </el-card>
    </el-col>
</el-row>
        <!-- <highcharts :options="metrics.dfs_capacity_used_non_hdfs"></highcharts> -->
<el-row :gutter="20">
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.total_bytes_read_rate_across_datanodes"></highcharts>
        </el-card>
    </el-col>
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.total_bytes_written_rate_across_datanodes"></highcharts>
        </el-card>
    </el-col>
</el-row>

<el-row :gutter="20">
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.total_blocks_read_rate_across_datanodes"></highcharts>
        </el-card>
    </el-col>
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.total_blocks_written_rate_across_datanodes"></highcharts>
        </el-card>
    </el-col>
</el-row>
        <!-- <highcharts :options="metrics.packet_ack_round_trip_time_nanos_avg_time_across_datanodes"></highcharts> -->
<el-row :gutter="20">
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.send_data_packet_transfer_nanos_avg_time_across_datanodes"></highcharts>
        </el-card>
    </el-col>
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.send_data_packet_blocked_on_network_nanos_avg_time_across_datanodes"></highcharts>
        </el-card>
    </el-col>
</el-row>

<el-row :gutter="20">
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.flush_nanos_rate_across_datanodes"></highcharts>
        </el-card>
    </el-col>
    <el-col :span="12">
        <el-card shadow="hover" style="margin-bottom: 10px">
            <highcharts :options="metrics.flush_nanos_avg_time_across_datanodes"></highcharts>
        </el-card>
    </el-col>
</el-row>
</div>
</template>

<script>
export default {
    name: 'HDFSMonitor',

    data() {
        return {
            metrics: {
                dfs_capacity: {},
                dfs_capacity_used_non_hdfs: {},
                dfs_capacity_used: {},
                total_bytes_read_rate_across_datanodes: {},
                total_bytes_written_rate_across_datanodes: {},
                total_blocks_read_rate_across_datanodes: {},
                total_blocks_written_rate_across_datanodes: {},
                // 'packet_ack_round_trip_time_nanos_avg_time_across_datanodes,
                send_data_packet_transfer_nanos_avg_time_across_datanodes: {},
                send_data_packet_blocked_on_network_nanos_avg_time_across_datanodes: {},
                flush_nanos_rate_across_datanodes: {},
                flush_nanos_avg_time_across_datanodes: {},
            },
            // 定时器
            timer: '',
        }
    },  

    mounted () {
        // 初始化时，调用接口获取数据，否则要等1分钟才会有数据
        this.handleMetrics()
        // 1分钟执行一次
        this.timer = setInterval(this.handleMetrics, 60 * 1000);
    },

    beforeDestroy() {
        clearInterval(this.timer);
    },

    methods: {
        handleMetrics() {
            for (let i = 0; i < Object.keys(this.metrics).length; i++) {
            // 获取数据
            this.getMetrics(Object.keys(this.metrics)[i])
            }
        },

        getMetrics(metric) {
            this.$axios.get(this.$backend + "/get_metrics/", {
                params: {
                    metric: metric,
                    clusterName: this.$clusterInfo.cluster
                }
            })
            .then(res => {
                // console.log(res.data)
                // 将json字符串解析为json对象
                let obj = JSON.parse(res.data);
                // 将时间戳转化为毫秒数表示，并添加一个毫秒数属性
                obj['milliSecond'] = this.$processFunc.utc2milliSecond(obj.timestamp);
                // 处理数据中的时间戳，将utc时间转换为本地时间
                obj.timestamp = this.$processFunc.utc2localTime(obj.timestamp);
                // console.log(obj)
                // 向echarts实例中填充数据
                this.metrics[metric] = {
                    chart: {
                        type: 'areaspline',
                        width: 550,
                        height: 350,
                    },
                    title: {
                        text: obj.displayName,
                        style: {
                            fontWeight: 'bold',
                            fontSize: '18px',
                        }
                    },
                    legend: {
                        align: 'left',
                        labelFormatter: function() {
                            return obj.displayName
                                   + ": "
                                   + obj.value.slice(-1)[0].toFixed(3)
                                   + " "
                                   + obj.unit
                        },
                    },
                    xAxis: {
                        type: 'datetime',
                        crosshair: true,
                        dateTimeLabelFormats: {
                            minute: '%H:%M',
                            day: '00:00',
                        },
                    },
                    yAxis: {
                        tickAmount: 4,    // 刻度总数
                        crosshair: true,  // 十字准心线
                        title: {
                            text: obj.unit
                        },
                        // labels: {
                        //     format: '{value}' + obj.unit    // 格式化刻度数值
                        // },
                    },
                    plotOptions: {
                        series: {
                            lineWidth: 0,       // 线宽
                            marker: {
                                enabled: false,    // 数据点是否显示
                            }
                        }
                    },
                    series: {
                        name: obj.displayName,
                        data: obj.value,
                        pointStart: obj.milliSecond[0],
                        pointInterval: 1 * 60 * 1000,    // 间隔为15分钟
                        tooltip: {
                            xDateFormat: '%Y-%m-%d %H:%M',
                            valueDecimals: 3,    // 保留小数
                            valueSuffix: obj.unit    // 后缀
                        },
                    },
                    // 消除右下角版权标志
                    credits: {
                        enabled: false,
                    }
                }
            })
            .catch(err => {
                console.log(err)
            })
        },
    },
}
</script>