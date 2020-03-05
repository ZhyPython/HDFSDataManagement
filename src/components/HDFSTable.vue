<template>
<div class="dir-table">
    <el-table 
        :data="tableData"  
        height="500" 
        highlight-current-row="true">
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column 
            label="名称" 
            sortable="true">
            <template slot-scope="scope">
                <i :class="scope.row.type === 'FILE' ? 'el-icon-document' : 'el-icon-folder'"></i>
                <el-link 
                    type="primary" 
                    @click="showDetailDialog(scope.row)">{{ scope.row.pathSuffix }}
                </el-link>
            </template>
        </el-table-column>
        <el-table-column 
            prop="permission" 
            label="权限">
        </el-table-column>
        <el-table-column 
            prop="owner" 
            label="所有者">
        </el-table-column>
        <el-table-column 
            prop="group" 
            label="所有组">
        </el-table-column>
        <el-table-column 
            prop="length" 
            label="大小">
        </el-table-column>
        <el-table-column 
            prop="modificationTime" 
            label="最近修改时间"   
            sortable="true">
        </el-table-column>
        <el-table-column 
            prop="replication" 
            label="副本数量">
        </el-table-column>
        <el-table-column 
            prop="blockSize" 
            label="块大小">
        </el-table-column>
        <el-table-column 
            label="操作">
            <template slot-scope="scope">
                <el-button 
                    size="small" 
                    @click="handleDelete(scope.$index, scope.row)" 
                    icon="el-icon-delete">
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <el-dialog
        title='删除文件'
        :visible.sync="deleteDialogVisible"
        width="30%"
        :lock-scroll=false>
        <span>确定删除 {{ fileName }} ?</span>
        <span slot="footer" class="dialog-footer">
            <el-button @click="deleteDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="deleteFile(fileName)">确 定</el-button>
        </span>
    </el-dialog>    
</div>
</template>

<script>
export default {
    name: 'HDFSTable',

    props: {
        tableData: Array,
        currentDir: '',
    },

    data() {
        return {
            tableData: [],
            fileName: '',
            fileIndex: null,
            deleteDialogVisible: false,
        }
    },

    methods: {
        handleDelete(index, row) {
            this.deleteDialogVisible = true;
            this.fileName = row["pathSuffix"];
            this.fileIndex = index;
        },

        deleteFile(fileName) {
            let url = '/webhdfs/v1' + this.currentDir;
            // 防止当前目录最后一位是'/'，所以用append_path拼接字符串
            url = this.$processFunc.append_path(url, fileName);
            url = url + '?op=DELETE&recursive=true&user.name=hdfs';
            //axios调用接口访问hdfs目录
            this.$axios.delete(url)
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    this.tableData.splice(this.fileIndex, 1);
                }
            })
            .catch(err => {
                console.log(err);
            })

            this.deleteDialogVisible = false;
        },

        showDetailDialog(file) {
            if (file.type == 'FILE') {
                // todo:打开对话框，查看文件信息，提供下载功能
            }
            if (file.type == 'DIRECTORY') {
                // 进入下一级目录
                let url = '/webhdfs/v1' 
                          + this.$processFunc.append_path(this.currentDir, file.pathSuffix);
                // window.alert(url)
                this.$emit(
                    'enterDir', 
                    true, 
                    this.$processFunc.append_path(this.currentDir, file.pathSuffix)
                );  
                // 更新currentDir的值
                this.$emit(
                    'changeCurrentDir',
                    this.$processFunc.append_path(this.currentDir, file.pathSuffix)
                )
            }
        },
    },
}
</script>