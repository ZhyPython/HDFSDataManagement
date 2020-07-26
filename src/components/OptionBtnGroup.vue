<template>
<!-- 按钮栏，回退，上传文件，新建文件夹 -->
<div class="opt-btn-group">

    <!-- <el-tooltip effect="dark" content="回退至上级目录" placement="top"> -->
        <el-button
            id="back-btn" 
            size="medium" 
            plain
            type="primary"
            icon="el-icon-back" 
            @click="goParentDir">目录回退
        </el-button>
    <!-- </el-tooltip> -->

    <!-- <el-tooltip effect="dark" content="上传文件到集群" placement="top"> -->
        <el-button 
            id="up-btn" 
            size="medium" 
            plain
            type="primary"
            icon="el-icon-upload"
            @click="handleUploadDialog">文件上传
        </el-button>
    <!-- </el-tooltip> -->
    <el-dialog
        title="上传文件"
        :lock-scroll=false
        width="30%"
        :visible.sync="uploadDialogVisible">
        <div style="margin-bottom: 20px">
            <span>上传至：</span>
            <el-input 
                v-model="uploadDir" 
                size="small" 
                style="width: 80%; display: inline-block">
            </el-input>
        </div>
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
            <el-button size="small" @click="handleCloseUploadDialog">取 消</el-button>
            <el-button style="margin-left: 10px;" 
                       size="small" type="success" 
                       @click="handleUpload">{{ btnText }}
            </el-button>
        </span>
    </el-dialog>

    <!-- <el-tooltip effect="dark" content="在当前目录新建文件夹" placement="top"> -->
        <el-button 
            id="mkdir-btn"
            size="medium"
            plain
            type="primary"
            icon="el-icon-folder-add"
            @click="mkdirDialogVisible = true">新建文件夹
        </el-button>
    <!-- </el-tooltip> -->
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

    computed: {
    },

    data() {
        return {
            mkdirDialogVisible: false,
            uploadDialogVisible: false,
            btnText: '上传到集群',
            inputDir: '',       // 新建目录
            fileList: [],
            uploadDir: '',      // 上传文件目录
            filesArray: [],    // 储存目录信息，为空时表示目录不存在或该目录下无文件
        }
    },

    methods: {
        fileSave(file, fileList) {
            this.fileList = fileList;
        },

        handleUploadDialog() {
            // 打开对话框，为上传目录赋初值为当前目录
            this.uploadDialogVisible = true;
            this.uploadDir = this.currentDir;
        },

        handleUpload() {
            // 先将上传目录的信息置空
            this.filesArray = [];
            // 获取上传目录下的所有文件名
            let url = this.$processFunc.append_path('/webhdfs/v1', this.uploadDir);
            url = url + '?op=LISTSTATUS&user.name=hdfs';
            this.$axios.get(this.$backend + '/get_hdfs_dir/', {
                params: {
                    'activeNN': this.$clusterInfo.activeNN.hostIP,
                    'url': url
                }
            })
            .then(res => {
                let data = res.data;
                if (data.flag == true) {
                    data = this.$processFunc.parseDirectory(data.data);
                    for(let i = 0; i < data.length; i++) {
                        this.filesArray.push(data[i].pathSuffix);
                    }
                }
                // console.log(this.filesArray)
                // 上传文件
                this.submitUpload();
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法获取上传目录信息",
                    duration: 3000,
                });
            })
        },

        checkFilesExist(fileName) {
            // 检查上传目录是否存在或该目录下是否无文件，不存在则直接上传
            if (this.filesArray.length == 0) {
                return fileName;
            } else {
                // 检查文件是否存在，如果存在则为文件名添加后缀
                if (this.filesArray.indexOf(fileName) >= 0) {
                    // 匹配文件类型的正则表达式
                    let regFileType = /(.*)\.(.*)?/;
                    let fileType = regFileType.exec(fileName);
                    let suffix = '';
                    if (fileType && fileType[2]) {
                        suffix = fileType[2];
                        fileName = fileType[1];
                    }
                    // 匹配文件序号的正则表达式
                    let reg = new RegExp(fileName + '(\\((\\d+)\\))\?');
                    // 保存文件副本的序号数组
                    let serialNum = [];
                    for (let i = 0; i < this.filesArray.length; i++) {
                        let regArray = reg.exec(this.filesArray[i]);
                        if (regArray && regArray[2]) {
                            // console.log(regArray);
                            serialNum.push(parseInt(regArray[2]))
                        }
                    }
                    let nums = serialNum.length > 0 ? Math.max(...serialNum) + 1 : 1;
                    suffix = suffix ? '.' + suffix : ''
                    return fileName + '(' + nums + ')'  + suffix;
                } 
                else {
                    // 文件名在目录中不存在，直接上传
                    return fileName;
                }
            }
        },

        submitUpload() {
            if (this.fileList.length == 0) {
                this.$notify.warning({
                    title: "警告",
                    message: "未选择任何文件！",
                    duration: 3000,
                }); 
            } else {
                this.btnText = '上传中...';
            }

            // 以特定的格式定义存储上传文件的列表
            let files = [];
            // let numCompleted = 0;
            
            // 将要传输的对象从this.fileList中取出放入files列表中
            // 以{url: File}为形式存储
            for (let i = 0; i < this.fileList.length; i++) {
                // 获取fileList中的File对象及文件名称，拼接字符串
                let file = this.fileList[i].raw;
                // console.log(file)
                // 上传重复文件时，需要在文件名后面添加后缀
                let fileName = this.checkFilesExist(file.name);
                // let fileName = file.name;
                // console.log(fileName);
                let url = this.$processFunc.append_path('/webhdfs/v1', this.uploadDir);
                url = this.$processFunc.encode_path(
                    this.$processFunc.append_path(url, fileName)
                );
                url += '?op=CREATE&user.name='
                       + localStorage.getItem('username')
                       + '&overwrite=true';
                // 将文件对象以对象的方式压入文件列表数组, 以变量作为键名需要加[]
                files.push( { [url]: file} );
            }
            for (let i = 0; i < files.length; i++){
                // 获取文件对应的url
                let url = Object.keys(files[i])[0];
                // 上传文件时用form-data提交
                let configs = {
                    headers: {'Content-Type':'multipart/form-data;charset=UTF-8'}
                }
                // put请求的参数
                let data = new FormData()
                data.append('activeNN', this.$clusterInfo.activeNN.hostIP)
                data.append('url', url)
                data.append('file', files[i][url])
                
                this.$axios.post(this.$backend + '/upload_file/', data, configs)
                .then(res => {
                    // console.log(res)
                    if (res.data.info == 'success'){
                        this.$notify.success({
                            title: "成功",
                            message: "文件 \"" + files[i][url]["name"] + "\" 上传成功！",
                            duration: 3000,
                        });
                        // 更新表格数据
                        this.$emit('refreshDir', true, this.currentDir);
                        // numCompleted++;
                        // if (numCompleted == files.length) {
                        //     // 关闭对话框
                        //     // this.uploadDialogVisible = false;
                        //     // 清除上传列表
                        //     this.$refs.upload.clearFiles();
                        //     this.fileList = [];
                        // }
                    } else {
                        this.$notify.error({
                            title: "失败",
                            message: files[i][url]["name"] + "上传失败",
                            duration: 3000,
                        });
                    }
                })
                .catch(err => {
                    console.log(err)
                    this.$notify.error({
                        title: "失败",
                        message: files[i][url]["name"] + "上传失败",
                        duration: 3000,
                    });
                })
            }
            this.btnText = '上传到集群';
            this.uploadDialogVisible = false;
            // 清除上传列表
            this.$refs.upload.clearFiles();
            this.fileList = [];
        },

        handleRemove(file, fileList) {
            this.fileList = fileList;
            this.$notify.success({
                title: "成功",
                message: "移除文件成功！",
                duration: 3000,
            });
        },

        handleCloseUploadDialog() {
            this.uploadDialogVisible = false;
            // 清除上传列表
            this.$refs.upload.clearFiles();
            this.fileList = [];
        },

        btnMkdir() {
            let dir = this.$processFunc.append_path(this.currentDir, this.inputDir);
            let url = "/webhdfs/v1"
                      + dir 
                      + "?op=MKDIRS&permission=775&user.name="
                      + localStorage.getItem('username')
            // put请求的参数
            let forms = new FormData()
            forms.append('activeNN', this.$clusterInfo.activeNN.hostIP)
            forms.append('url', url)
            this.$axios.put(this.$backend + '/mkdir/', forms)
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