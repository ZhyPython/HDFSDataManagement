<template>
<!-- 按钮栏，回退，上传文件，新建文件夹 -->
<div class="opt-btn-group">

    <el-tooltip effect="dark" content="回退至上级目录" placement="top">
        <el-button
            id="back-btn" 
            size="medium" 
            plain
            icon="el-icon-back" 
            @click="goParentDir">
        </el-button>
    </el-tooltip>

    <el-tooltip effect="dark" content="上传文件到集群" placement="top">
        <el-button 
            id="up-btn" 
            size="medium" 
            plain
            icon="el-icon-upload"
            @click="uploadDialogVisible = true">
        </el-button>
    </el-tooltip>
    <el-dialog
        title="上传文件"
        :lock-scroll=false
        width="30%"
        :visible.sync="uploadDialogVisible">
        <el-upload
            class="upload-btn"
            ref="upload"
            action="123"
            :on-change="fileSave"
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
                       @click="submitUpload">{{ btnText }}
            </el-button>
        </span>
    </el-dialog>

    <el-tooltip effect="dark" content="新建文件夹" placement="top">
        <el-button 
            id="mkdir-btn"
            size="medium"
            plain
            icon="el-icon-folder-add"
            @click="mkdirDialogVisible = true">
        </el-button>
    </el-tooltip>
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
                    @click="btnMkdir">确 定
            </el-button>
        </span>
    </el-dialog>

</div>
</template>

<script>
export default {
    name: 'OptionBtnGroup',

    props: {
        currentDir: {
            type: String,
            default: ''
        },
    },

    data() {
        return {
            mkdirDialogVisible: false,
            uploadDialogVisible: false,
            btnText: '上传到集群',
            inputDir: '',
            fileList: [],
        }
    },

    methods: {
        fileSave(file, fileList) {
            this.fileList = fileList;
        },

        submitUpload() {
            if (this.fileList.length == 0) {
                this.$notify.warning({
                    title: "警告",
                    message: "未选择任何文件！",
                    duration: 3000,
                }); 
            }
            else {
                this.btnText = '上传中...';
            }

            // 以特定的格式定义存储上传文件的列表
            let files = [];
            let numCompleted = 0;
            
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
                url += '?op=CREATE&user.name='
                       + localStorage.getItem('username')
                       + '&noredirect=true&overwrite=true';
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
                                async: false,
                            })
                            .done(res => {
                                // console.log(res);
                                // console.log("upload success");
                                numCompleted++;
                                if (numCompleted == files.length) {
                                    // 关闭对话框
                                    this.uploadDialogVisible = false;
                                    this.$notify.success({
                                        title: "成功",
                                        message: "上传文件成功！",
                                        duration: 3000,
                                    });
                                    // 清除上传列表
                                    this.$refs.upload.clearFiles();
                                    this.fileList = [];
                                    // 更新表格数据
                                    this.$emit('refreshDir', true, this.currentDir);
                                    this.btnText = '上传到集群'
                                }
                            })
                            .catch(err => {
                                console.log("upload failed");
                                this.$notify.error({
                                    title: "失败",
                                    message: files[i][url]["name"] + "上传失败",
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
            this.btnText = '上传到集群';
        },

        handleRemove(file, fileList) {
            this.$notify.success({
                        title: "成功",
                        message: "移除文件成功！",
                        duration: 3000,
                    });
        },

        btnMkdir() {
            let dir = this.$processFunc.append_path(this.currentDir, this.inputDir);
            let url = "/webhdfs/v1"
                      + dir 
                      + "?op=MKDIRS&permission=775&user.name="
                      + localStorage.getItem('username')
            this.$axios.put(url)
            .then(res => {
                if (res.status == 200) {
                    this.mkdirDialogVisible = false
                    this.$notify.success({
                        title: "成功",
                        message: "创建文件夹成功！",
                        duration: 3000,
                    });
                    // 更新表格数据
                    this.$emit('refreshDir', true, this.currentDir);
                }
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "创建文件夹失败",
                    duration: 3000,
                });
            })
        },

        goParentDir() {
            let dir = this.currentDir;
            // 拆分目录元素为数组，若为根目录，则直接return
            if (dir == '/') {
                return
            }
            else {
                let arr = dir.split('/');
                // 移除数组中第一个空元素和最后一个元素
                arr.shift();
                arr.pop();
                // 拼接为上级目录返回
                let parentDir =  '/' + arr.join('/');
                // 更新表格数据
                this.$emit('refreshDir', true, parentDir);
                // 更新this.currentDir的值
                this.$emit('backParentDir', parentDir);
            } 
        },
    },
}
</script>

<style scoped>
#back-btn, #up-btn, #mkdir-btn {
    margin-right: 10px;
    margin-left: 0px;
}
</style>