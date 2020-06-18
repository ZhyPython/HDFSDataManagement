<template>
<!-- 目录表格 -->
<div class="dir-table">
    <el-table 
        :data="showData"
        @sort-change="changeSort"
        highlight-current-row>
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column
            label="名称"
            min-width="20%">
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
            label="权限"
            min-width="10%">
        </el-table-column>
        <el-table-column 
            prop="owner" 
            label="所有者"
            min-width="10%">
        </el-table-column>
        <el-table-column 
            prop="group" 
            label="用户组"
            min-width="10%">
        </el-table-column>
        <el-table-column 
            prop="length" 
            label="大小"
            min-width="8%">
        </el-table-column>
        <el-table-column 
            prop="modificationTime" 
            label="最近修改时间"
            min-width="14%">
        </el-table-column>
        <el-table-column 
            prop="replication" 
            label="副本数量"
            min-width="8%">
        </el-table-column>
        <el-table-column 
            prop="blockSize" 
            label="块大小"
            min-width="10%">
        </el-table-column>
        <el-table-column 
            label="操作"
            min-width="10%">
            <template slot-scope="scope">
                <el-dropdown>
                    <i class="el-icon-more" style="font-size: 25px; color: #409EFF;"></i>
                    <el-dropdown-menu 
                        slot="dropdown">
                        <el-dropdown-item icon="el-icon-delete" @click.native="handleDelete(scope.$index, scope.row)">删除文件</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-lock" @click.native="handlePermission(scope.$index, scope.row)">更改权限</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-user" @click.native="handleOwner(scope.$index, scope.row)">更改所有者</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-house" @click.native="handleGroup(scope.$index, scope.row)">更改用户组</el-dropdown-item>
                        <el-dropdown-item icon="el-icon-document-copy" @click.native="handleReplication(scope.$index, scope.row)">更改副本数量</el-dropdown-item>
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
        title='设置文件的用户组'
        :visible.sync="groupDialogVisible"
        width="30%"
        :lock-scroll=false>
        <span>更改用户组：</span>
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

    <el-dialog
        title='设置文件权限'
        :visible.sync="permissionDialogVisible"
        width="35%"
        :lock-scroll=false>
        <div class="uesr-permission">
            <span style="display: inline">所有者：</span>
            <el-checkbox-group 
                v-model="checkListUser" 
                style="display: inline; margin-left:14px">
                <el-checkbox label="可读"></el-checkbox>
                <el-checkbox label="可写"></el-checkbox>
                <el-checkbox label="可执行"></el-checkbox>
            </el-checkbox-group>
        </div>
        <div class="group-permission">
            <span style="display: inline">用户组：</span>
            <el-checkbox-group 
                v-model="checkListGroup" 
                style="display: inline; margin-left:14px">
                <el-checkbox label="可读"></el-checkbox>
                <el-checkbox label="可写"></el-checkbox>
                <el-checkbox label="可执行"></el-checkbox>
            </el-checkbox-group>
        </div>
        <div class="other-permission">
            <span style="display: inline">其他用户：</span>
            <el-checkbox-group 
                v-model="checkListOther" 
                style="display: inline">
                <el-checkbox label="可读"></el-checkbox>
                <el-checkbox label="可写"></el-checkbox>
                <el-checkbox label="可执行"></el-checkbox>
                <el-checkbox label="粘着位SBIT" :disabled="SBIT"></el-checkbox>
            </el-checkbox-group>
        </div>
        <span slot="footer" class="dialog-footer">
            <el-button size="medium" @click="permissionDialogVisible = false">取 消</el-button>
            <el-button size="medium" type="primary" @click="setPermission">{{ btnText }}</el-button>
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
        showData: {
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
            checkListUser: [],
            checkListGroup: [],
            checkListOther: [],
            SBIT: null,
        }
    },

    methods: {
        handleDelete(index, row) {
            // 判断当前用户是否为文件所有者或则hdfs超级用户
            let currentUser = localStorage.getItem('username');
            if (currentUser == row['owner'] || currentUser == 'hdfs') {
                this.deleteDialogVisible = true;
                this.fileName = row["pathSuffix"];
                this.fileIndex = index;
            } else {
                this.$notify.warning({
                    title: "警告",
                    message: "当前用户不是文件所有者或超级用户！",
                    duration: 3000,
                });
            }
        },

        deleteFile(fileName) {
            let url = '/webhdfs/v1' + this.currentDir;
            // 防止当前目录最后一位是'/'，所以用append_path拼接字符串
            url = this.$processFunc.append_path(url, fileName);
            url = url 
                  + '?op=DELETE&recursive=true&user.name='
                  + localStorage.getItem('username');
            //axios调用接口访问hdfs目录
            this.$axios.delete(this.$backend + '/delete_file/', {
                data: {
                    'activeNN': this.$clusterInfo.activeNN.hostIP,
                    'url': url
                }
            })
            .then(res => {
                // console.log(res);
                if (res.status == 200) {
                    this.showData.splice(this.fileIndex, 1);
                    this.$notify.success({
                        title: "成功",
                        message: "删除文件成功！",
                        duration: 3000,
                    });
                    this.$emit(
                        'deleteFile', 
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

        // 排序
        changeSort({ column, prop, order }) {
            // column:列属性
            // prop:列的绑定变量
            // order:排序方法(ascending，descending，null三者之一)
            // console.log(column, prop, order)
            this.$emit(
                'sortData',
                order,
            )
        },

        handlePermission(index, row) {
            this.permissionDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
            // 初始化对话框内的权限显示
            let perm = this.rowObj.permission;
            let permObj = this.$processFunc.initPermDialog(perm);
            this.checkListUser = permObj.checkListUser;
            this.checkListGroup = permObj.checkListGroup;
            this.checkListOther = permObj.checkListOther;
            // 粘着位是否显示
            if (row.type == 'FILE') {
                this.SBIT = true;
            }
            if (row.type == 'DIRECTORY') {
                this.SBIT = false;
            }
        },

        setPermission() {
            // 八进制权限
            var tempPerm = this.$processFunc.getOctalPermission(this.checkListUser);
            tempPerm += this.$processFunc.getOctalPermission(this.checkListGroup);
            tempPerm += this.$processFunc.getOctalPermission(this.checkListOther);
            // 拼接请求字符串
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url 
                  + '?op=SETPERMISSION&permission=' 
                  + tempPerm 
                  + '&user.name='
                  + localStorage.getItem('username');
            // put请求的参数
            let forms = new FormData()
            forms.append('activeNN', this.$clusterInfo.activeNN.hostIP)
            forms.append('url', url)
            this.$axios.put(this.$backend + '/set_permission/', forms)
            .then(res => {
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.permissionDialogVisible = false;
                    this.showData[this.fileIndex].permission = this.$processFunc.helperToDirectory(this.rowObj.type)
                                                               + this.$processFunc.helperToPermission(parseInt(tempPerm));
                    // console.log(this.showData[this.fileIndex].permission)
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改文件权限",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                // console.log(err);
                // 状态码
                let status = err.response.status
                // 报错信息
                let msg = JSON.parse(err.response.request.response).RemoteException.message
                // console.log(status, msg)
                this.$notify.error({
                    title: "失败",
                    message: "权限不足，" 
                             + localStorage.getItem('username')
                             + "用户不是当前文件的所有者",
                    duration: 3000,
                });
            })
        },
        
        handleOwner(index, row) {
            this.ownerDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
            // 将输入框的值清空
            this.owner = ''
        },

        setOwner() {
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url 
                  + '?op=SETOWNER&owner=' 
                  + this.owner 
                  + '&user.name='
                  + localStorage.getItem('username');
            // put请求的参数
            let forms = new FormData()
            forms.append('activeNN', this.$clusterInfo.activeNN.hostIP)
            forms.append('url', url)
            this.$axios.put(this.$backend + '/set_owner/', forms)
            .then(res => {
                // console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.ownerDialogVisible = false;
                    this.showData[this.fileIndex].owner = this.owner;
                    // 将输入框的值清空
                    this.owner = '';
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改所有者",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                // console.log(err);
                // 状态码
                let status = err.response.status
                // 报错信息
                let msg = JSON.parse(err.response.request.response).RemoteException.message
                this.$notify.error({
                    title: "失败",
                    message: "当前用户没有权限更改所有者",
                    duration: 3000,
                });
            })
        },
        
        handleGroup(index, row) {
            this.groupDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
            // 将输入框的内容清空
            this.group = '';
        },

        setGroup() {
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url 
                  + '?op=SETOWNER&group=' 
                  + this.group 
                  + '&user.name='
                  + localStorage.getItem('username')
            // put请求的参数
            let forms = new FormData()
            forms.append('activeNN', this.$clusterInfo.activeNN.hostIP)
            forms.append('url', url)
            this.$axios.put(this.$backend + '/set_group/', forms)
            .then(res => {
                // console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.groupDialogVisible = false;
                    this.showData[this.fileIndex].group = this.group;
                    // 将输入框的内容清空
                    this.group = '';
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改用户组",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                // console.log(err);
                // 状态码
                let status = err.response.status
                // 报错信息
                let msg = JSON.parse(err.response.request.response).RemoteException.message
                this.$notify.error({
                    title: "失败",
                    message: "当前用户没有权限更改用户组",
                    duration: 3000,
                });
            })
        },
        
        handleReplication(index, row) {
            this.replicationDialogVisible = true;
            this.fileIndex = index;
            this.rowObj = row;
            // 将输入框的内容清空
            this.replication = null;
        },

        setReplication() {
            let url = '/webhdfs/v1' 
                      + this.$processFunc.append_path(this.currentDir, this.rowObj.pathSuffix);
            url = url 
                  + '?op=SETREPLICATION&replication=' 
                  + this.replication 
                  + '&user.name='
                  + localStorage.getItem('username')
            // put请求的参数
            let forms = new FormData()
            forms.append('activeNN', this.$clusterInfo.activeNN.hostIP)
            forms.append('url', url)
            this.$axios.put(this.$backend + '/set_replication/', forms)
            .then(res => {
                // console.log(res);
                if (res.status == 200) {
                    // 关闭对话框，将按钮和输入框的内容恢复至初始状态
                    this.replicationDialogVisible = false;
                    this.showData[this.fileIndex].replication = this.replication;
                    // 将输入框的内容清空
                    this.replication = null;
                    this.$notify.success({
                        title: "成功",
                        message: "成功更改文件副本数量",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                // console.log(err);
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

<style scoped>
.dir-table {
    margin-bottom: 15px;
}
</style>