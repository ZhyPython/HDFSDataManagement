<template>
<div class="dir-table">
    <el-table 
        :data="tableData"  
        height="500" 
        highlight-current-row>
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
                <el-dropdown>
                    <el-button size="small">
                    <i class="el-icon-set-up" style="font-size: 15px;" type="primary"></i>
                    </el-button>
                    <el-dropdown-menu 
                        slot="dropdown">
                        <el-dropdown-item @click.native="handleDelete(scope.$index, scope.row)">删除文件</el-dropdown-item>
                        <el-dropdown-item @click.native="handlePermission(scope.$index, scope.row)">更改权限</el-dropdown-item>
                        <el-dropdown-item @click.native="handleOwner(scope.$index, scope.row)">更改所有者</el-dropdown-item>
                        <el-dropdown-item @click.native="handleGroup(scope.$index, scope.row)">更改所有组</el-dropdown-item>
                        <el-dropdown-item @click.native="handleReplication(scope.$index, scope.row)">更改副本数量</el-dropdown-item>
                    </el-dropdown-menu>
                </el-dropdown>
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
            <el-button size="medium" @click="deleteDialogVisible = false">取 消</el-button>
            <el-button size="medium" type="primary" @click="deleteFile(fileName)">确 定</el-button>
        </span>
    </el-dialog> 

    <el-dialog
        title='设置文件的所有者'
        :visible.sync="ownerDialogVisible"
        width="30%"
        :lock-scroll=false>
        <span>更改所有者：</span>
        <el-input v-model="owner" style="width:40%"></el-input>
        <span slot="footer" class="dialog-footer">
            <el-button size="medium" @click="ownerDialogVisible = false">取 消</el-button>
            <el-button size="medium" type="primary" @click="setOwner">{{ btnText }}</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title='设置文件的所有组'
        :visible.sync="groupDialogVisible"
        width="30%"
        :lock-scroll=false>
        <span>更改所有组：</span>
        <el-input v-model="group" style="width:40%"></el-input>
        <span slot="footer" class="dialog-footer">
            <el-button size="medium" @click="groupDialogVisible = false">取 消</el-button>
            <el-button size="medium" type="primary" @click="setGroup">{{ btnText }}</el-button>
        </span>
    </el-dialog>

    <el-dialog
        title='设置文件的副本数量'
        :visible.sync="replicationDialogVisible"
        width="30%"
        :lock-scroll=false>
        <span>更改文件的副本数量：</span>
        <el-input v-model="replication" style="width:20%"></el-input>
        <p/>
        <el-alert
            title="建议文件副本数量小于datanode主机数"
            type="info"
            show-icon
            :closable="false">
        </el-alert>
        <span slot="footer" class="dialog-footer">
            <el-button size="medium" @click="replicationDialogVisible = false">取 消</el-button>
            <el-button size="medium" type="primary" @click="setReplication">{{ btnText }}</el-button>
        </span>
    </el-dialog>

    <FileInfo
        :fileName="fileName"
        :currentDir="currentDir"
        :fileInfoDialogVisible="fileInfoDialogVisible"
        @closeFileInfoDialog="closeFileInfoDialog">
    </FileInfo>   
</div>
</template>

<script>
import FileInfo from './FileInfo.vue';

export default {
    name: 'HDFSTable',

    props: {
        tableData: {
            type: Array,
            default: []
        },
        currentDir: {
            type: String,
            default: ''
        },
    },

    components: {
        FileInfo,
    },

    data() {
        return {
            // 选中的行索引和行对象
            fileName: '',
            fileIndex: null,
            rowObj: {},
            deleteDialogVisible: false,
            fileInfoDialogVisible: false,
            btnText: '更 改',
            ownerDialogVisible: false,
            owner: '',
            groupDialogVisible: false,
            group: '',
            permissionDialogVisible: false,
            permisson: '',
            replicationDialogVisible: false,
            replication: null,
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
                    this.$notify.success({
                        title: "成功",
                        message: "删除文件成功！",
                        duration: 3000,
                    });
                    this.$emit(
                        'enterDir', 
                        true, 
                        this.currentDir
                    );  
                }
            })
            .catch(err => {
                console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "删除文件失败",
                    duration: 3000,
                });
            })

            this.deleteDialogVisible = false;
        },

        showDetailDialog(file) {
            if (file.type == 'FILE') {
                // todo:打开对话框，查看文件信息，提供下载功能
                this.fileInfoDialogVisible = true;
                // 对话框标题带有文件名
                this.fileName = file.pathSuffix;
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

        // 关闭文件信息子组件对话框
        closeFileInfoDialog() {
            this.fileInfoDialogVisible = false;
        },

        handlePermission(index, row) {
            this.permissionDialogVisible = true;
        },

        setPermission() {

        },
        
        handleOwner(index, row) {
            this.ownerDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
        },

        setOwner() {
            if (this.owner != '') {
                this.btnText = '更改中...';
            }
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url + '?op=SETOWNER&owner=' + this.owner + '&user.name=hdfs';
            // 执行put请求
            this.$axios.put(url)
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.ownerDialogVisible = false;
                    this.btnText = '更 改';
                    this.tableData[this.fileIndex].owner = this.owner;
                    this.owner = '';
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改所有者",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "更改所有者失败",
                    duration: 3000,
                });
            })
        },
        
        handleGroup(index, row) {
            this.groupDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
        },

        setGroup() {
            if (this.group != '') {
                this.btnText = '更改中...';
            }
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url + '?op=SETOWNER&group=' + this.group + '&user.name=hdfs'
            // 执行put请求
            this.$axios.put(url)
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.groupDialogVisible = false;
                    this.btnText = '更 改';
                    this.tableData[this.fileIndex].group = this.group;
                    this.group = '';
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改所有组",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "更改所有组失败",
                    duration: 3000,
                });
            })
        },
        
        handleReplication(index, row) {
            this.replicationDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
        },

        setReplication() {
            if (this.replication != '') {
                this.btnText = '更改中...';
            }
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url + '?op=SETREPLICATION&replication=' + this.replication + '&user.name=hdfs'
            // 执行put请求
            this.$axios.put(url)
            .then(res => {
                console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.replicationDialogVisible = false;
                    this.btnText = '更 改';
                    this.tableData[this.fileIndex].replication = this.replication;
                    this.replication = null;
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改文件副本数量",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "更改文件副本数量失败",
                    duration: 3000,
                });
            })
        },

    },
}
</script>