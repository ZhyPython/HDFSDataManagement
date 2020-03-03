<template>
<div class="opt-btn-group">
<el-button-group>
    <el-button 
        size="medium" 
        type="primary" 
        icon="el-icon-upload"
        @click="uploadDialogVisible = true">
    </el-button>
    <el-dialog
        title="上传文件"
        :lock-scroll=false
        width="30%"
        :visible.sync="uploadDialogVisible">
    <el-upload
        class="upload-btn"
        ref="upload"
        action="uploadUrl"
        :data="params"
        :on-change="fileSaveToUrl"
        :on-remove="handleRemove"
        :file-list="fileList"
        :auto-upload="false">
        <el-button slot="trigger" 
                   size="small" 
                   type="primary"
                   @click="addFile">选取文件
        </el-button>
    </el-upload>
        <span slot="footer" class="dialog-footer">
            <el-button size="small" @click="uploadDialogVisible = false">取 消</el-button>
            <el-button style="margin-left: 10px;" 
                       size="small" type="success" 
                       @click="submitUpload">上传到集群
            </el-button>
        </span>
    </el-dialog>

    <el-button 
        size="medium"
        type="primary" 
        @click="mkdirDialogVisible = true" 
        icon="el-icon-folder">
    </el-button>
    <el-dialog
        title="新建目录"
        :lock-scroll=false
        width="40%"
        :visible.sync="mkdirDialogVisible">
    <el-input placeholder="" v-model="inputDir">
        <template slot="prepend">{{ currentDir }}</template>
    </el-input>
    <span slot="footer" class="dialog-footer">
        <el-button size="small" @click="mkdirDialogVisible = false">取 消</el-button>
        <el-button size="small" 
                   type="primary" 
                   @click="btnMkdir(currentDir+inputDir, defaultPermisson)">确 定
        </el-button>
    </span>
    </el-dialog>

    <el-button 
        size="medium" 
        type="primary" 
        icon="el-icon-delete">
    </el-button>
</el-button-group>
</div>
</template>

<script>
export default {
    name: 'OptBtnGroup',

    data() {
        return {
            uploadUrl: 'http://192.168.112.101:9870/webhdfs/v1/test',
            params: {
                'op': 'CREATE',
                'user.name': 'hdfs',
            },
            mkdirDialogVisible: false,
            uploadDialogVisible: false,
            inputDir: '',
            currentDir: '/',
            defaultPermisson: 775,
            fileList: [],
        }
    },

    methods: {
        addFile() {
            
        },

        fileSaveToUrl(file, fileList) {
            this.fileList = fileList;
        },

        submitUpload() {
            this.$processFunc.printObj(this.fileList);
            if (this.fileList.length == 0) {
                this.$notify.warning({
                    title: "警告",
                    message: "未选择任何文件！",
                    duration: 3000,
                }); 
            };
            this.$refs.upload.submit();
            // this.$axios.put("/webhdfs/v1"
            //                 + "/test"
            //                 + "?op=CREATE&user.name=hdfs")
            // .then(res => {
            //     console.log(res.status);
            // })
            // .catch(err => {
            //     console.log(err);
            // });
        },

        handleRemove(file, fileList) {
            this.$notify.success({
                        title: "成功",
                        message: "移除文件成功！",
                        duration: 3000,
                    });
        },

        btnMkdir(dir, permission) {
            this.$axios.put("/webhdfs/v1"
                            + dir 
                            + "?op=MKDIRS&user.name=hdfs&permission="
                            + permission)
            .then(res => {
                if (res.status == 200) {
                    this.mkdirDialogVisible = false
                    this.$notify.success({
                        title: "成功",
                        message: "创建文件夹成功！",
                        duration: 3000,
                    });
                }
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "创建文件夹失败",
                    duration: 3000,
                });
            })
        }
    },
}
</script>
