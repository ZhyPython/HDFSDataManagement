<template>
<div class="hdfs-table">
    <el-row>
        <el-col :span="14" :offset="3">
            <el-input placeholder="" class="input-with-search" size="medium">
                <el-button slot="append" icon="el-icon-search"></el-button>
            </el-input>
        </el-col>
        <el-col :span="4">
            <el-button size="medium" type="primary" icon="el-icon-upload"></el-button>
            <el-button size="medium" type="primary" icon="el-icon-folder"></el-button>
            <el-button size="medium" type="primary" icon="el-icon-delete"></el-button>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="14" :offset="3">
            <div>
                <el-input v-model="currentDir">
                    <template slot="prepend">当前目录:</template>
                </el-input>
            </div>
        </el-col>
    </el-row>
    <el-row>
        <el-col :span="18" :offset="3">
            <el-table :data="tableData"  height="250" highlight-current-row="true">
                <!-- <el-table-column type="selection" width="55"></el-table-column> -->
                <el-table-column 
                    prop="name" 
                    label="名称" 
                    width="120" 
                    sortable="true">
                </el-table-column>
                <el-table-column 
                    prop="permission" 
                    label="权限" 
                    width="100">
                </el-table-column>
                <el-table-column 
                    prop="owner" 
                    label="所有者" 
                    width="100">
                </el-table-column>
                <el-table-column 
                    prop="group" 
                    label="所有组" 
                    width="100">
                </el-table-column>
                <el-table-column 
                    prop="size" 
                    label="大小" 
                    width="100">
                </el-table-column>
                <el-table-column 
                    prop="last_modified" 
                    label="最近修改时间" 
                    width="150" 
                    sortable="true">
                </el-table-column>
                <el-table-column 
                    prop="replication" 
                    label="副本数量" 
                    width="100">
                </el-table-column>
                <el-table-column 
                    prop="block_size" 
                    label="块大小" 
                    width="220">
                </el-table-column>
                <el-table-column 
                    label="操作" 
                    width="100">
                    <template slot-scope="scope">
                        <el-button 
                            size="small" 
                            @click="handleDelete(scope.$index, scope.row)" 
                            icon="el-icon-delete">
                        </el-button>
                    </template>
                </el-table-column>
            </el-table>
        </el-col>
    </el-row>
</div>
</template>

<script>
export default ({
    name: 'HDFSTable',

    data() {
        return {
            tableData: [{
                name: '测试',
                permission: '777',
                owner: 'fdh',
                group: 'h',
                size: 'dh',
                last_modified: 'dh',
                replication: 'h',
                block_size: 'dh',
            }
            ],
            currentDir: '/',
            url: "http://192.168.112.101:9870/webhdfs/v1",
            dir_path: '/',
        }
    },

    // mounted: function() {
    //     this.axios
    //     .get('http://192.168.112.101:9870/webhdfs/v1/?op=LISTSTATUS&user.name=hdfs')
    //     .then(response => (this.currentDir = response.body))
    //     .catch(function (error) { // 请求失败处理
    //     console.log(error);
    //     });
        // var params = {
        //     op: 'LISTSTATUS',
        //     // user.name: 'hdfs',
        // }
        // this.axios({
        //     methods: 'get',
        //     url: this.url + this.dir_path,
        //     data: params
        // }).then(response => {
            
        //     this.currentDir = response.body
        // }).catch(function(error) {
        //     console.log(error);
        // })
    // },

    methods: {
        handleDelete(index, row) {
            console.log(index + row);
        }
    },
})
</script>
