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
        width="40%"
        :visible.sync="uploadDialogVisible">
    <el-upload
        class="upload-demo"
        ref="upload"
        action="https://jsonplaceholder.typicode.com/posts/"
        :on-preview="handlePreview"
        :on-remove="handleRemove"
        :file-list="fileList"
        :auto-upload="false">
        <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
        <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button>
        <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
    </el-upload>
    <span slot="footer" class="dialog-footer">
        <el-button @click="uploadmkdirDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="btnMkdir('/'+inputDir, defaultPermisson)">上 传</el-button>
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
        <el-button @click="mkdirDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="btnMkdir(currentDir+inputDir, defaultPermisson)">确 定</el-button>
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
            mkdirDialogVisible: false,
            uploadDialogVisible: false,
            inputDir: '',
            currentDir: '/',
            defaultPermisson: 775,
        }
    },

    methods: {
        btnUploadFile() {
            window.alert("upload");
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
                        duration: 2000,
                    })
                }
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "创建文件夹失败",
                    duration: 2000,
                });
            })
        }
    },
}
</script>
