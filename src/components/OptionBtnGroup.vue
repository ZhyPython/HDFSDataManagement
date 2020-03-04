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
        action="123"
        :on-change="fileSaveToUrl"
        :on-remove="handleRemove"
        :file-list="fileList"
        :auto-upload="false">
        <el-button slot="trigger" 
                   size="small" 
                   type="primary">选取文件
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
            mkdirDialogVisible: false,
            uploadDialogVisible: false,
            inputDir: '',
            currentDir: '/',
            defaultPermisson: 775,
            fileList: [],
        }
    },

    methods: {
        fileSaveToUrl(file, fileList) {
            this.fileList = fileList;
        },

        submitUpload() {
            if (this.fileList.length == 0) {
                this.$notify.warning({
                    title: "警告",
                    message: "未选择任何文件！",
                    duration: 3000,
                }); 
            };

            // 以特定的格式定义存储上传文件的列表
            let files = [];
            let numCompletedd = 0;

            // ajax内部无法使用vue的this引用，所以定义一个this.$notify引用
            let ajaxNotify = this.$notify;
            
            // 将要传输的对象从this.fileList中取出放入files列表中
            // 以{url: File}为形式存储
            for (let i = 0; i < this.fileList.length; i++) {
                // 获取fileList中的File对象及文件名称，拼接字符串
                let file = this.fileList[i].raw;
                let fileName = file.name;
                let url = '/webhdfs/v1' + this.currentDir  
                url = this.$processFunc.encode_path(
                    this.$processFunc.append_path(url, fileName)
                );
                url += '?op=CREATE&user.name=hdfs&noredirect=true&overwrite=true';
                // 将文件对象以对象的方式压入文件列表数组
                files.push( { [url]: file} );
            }
            // location为首次请求后返回的地址，用做第二次请求
            let location = '';
            for (let i = 0; i < files.length; i++){
                // 获取文件对应的url
                let url = Object.keys(files[i])[0];
                // 提交第一次请求获取返回的URI
                this.$axios.put(url)
                .then(res => {
                    if ('Location' in res.data) {
                        location = res.data["Location"];
                        // data参数为url对应的文件对象
                        jQuery.ajax({
                                type: 'PUT',
                                url: location,
                                data: files[i][url],
                                processData: false,
                                crossDomain: true,
                            })
                            .then(function(data) {
                                console.log("upload success");
                                // todo:关闭对话框
                                ajaxNotify.success({
                                    title: "成功",
                                    message: "上传文件成功！",
                                    duration: 3000,
                                });
                            })
                            .catch(function(error) {
                                console.log("upload failed");
                                ajaxNotify.error({
                                    title: "失败",
                                    message: "上传文件失败",
                                    duration: 3000,
                                });
                            })
                    }  
                })
                .catch(err => {
                    console.log(err);
                    this.$notify.error({
                        title: "失败",
                        message: "axios上传文件失败",
                        duration: 3000,
                    });
                }) 
            }
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
