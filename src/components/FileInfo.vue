<template>
<!-- 查看文件信息 -->
<div class="file-information">
    <el-dialog
        :title="fileInfoTitle"
        :visible.sync="fileInfoDialogVisible"
        :lock-scroll=false
        width="30%"
        :before-close="handleCloseDialog"
        @open="open"
        @close="close">

        <div v-if="showBlockInfo">
            <span><b>选择block块查看信息:</b></span>
            <el-select 
                v-model="value"  
                @change="changeBlockInfo(value)"
                style="width:25%">
                <el-option
                    v-for="item in blocks"
                    :key="item.value"
                    :value="item.value"
                    :label="item.label">
                </el-option>
            </el-select>

            <p>Block块的ID：{{ block.blockId }}</p>
            <p>Block块的生成时间：{{ block.genTime }}</p>
            <p>Block块的大小：{{ block.fileSize }}</p>
            <p>
                存储Block块的主机：
                <ul v-for="host in block.hosts">
                    <li>{{ host }}</li>
                </ul>
            </p>
        </div>
        
        <!-- 内层的dialog，选择文件下载到的具体主机 -->
        <el-dialog
            width="30%"
            title="选择主机"
            :visible.sync="innerVisible"
            :lock-scroll=false
            @open="getDNs"
            @close="clearHosts"
            append-to-body>
            
            <div>
                <span>选择主机:</span>
                <el-select 
                    v-model="hostIP"  
                    style="width:40%">
                    <el-option
                        v-for="item in hosts"
                        :key="item.hostIP"
                        :value="item.hostIP"
                        :label="item.hostName">
                    </el-option>
                </el-select>
            </div>
            <div>
                <span>存储路径:</span>
                <el-input
                    v-model="downloadPath" 
                    style="width: 300px; margin-top: 20px">
                </el-input>
            </div>

            <span slot="footer" class="dialog-footer">
                <el-button 
                    size="medium" 
                    @click="innerVisible = false">取 消
                </el-button>
                <el-button 
                    type="primary" 
                    size="medium" 
                    @click="handledownloadToHost">{{ btnFileToHost }}
                </el-button>
            </span>
        </el-dialog>

        <span slot="footer" class="dialog-footer">
            <el-button
                type="primary"
                size="medium"
                @click="downloadFile"
                style="float: left"
                >下载到本地
            </el-button>
            <el-button
                type="primary"
                size="medium"
                @click="innerVisible = true"
                style="float: left"
                >下载到节点
            </el-button>
            <el-button 
                type="primary" 
                @click="handleCloseDialog"
                size="medium">关 闭
            </el-button>
        </span>
    </el-dialog>
</div>
</template>

<script>
export default {
    name: 'FileInfo',

    data() {
        return {
            value: 0,
            block: {},
            blocks: [],
            innerVisible: false,
            hostIP: '',
            hosts: [],
            downloadPath: '/hdfs_download',
            btnFileToHost: "下 载",     // 下载文件到主机的按钮显示文字
            showBlockInfo: true,        // 是否显示block信息
        }
    },

    props: {
        fileInfoDialogVisible: {
            type: Boolean,
            default: false
        },
        fileName: {
            type: String
        },
        currentDir: {
            type: String,
            default: '/'
        }     
    },

    computed: {
        fileInfoTitle: function() {
            return "文件信息 - " + this.fileName;
        },
        getBlockInfoUrl: function() {
            let url = '/webhdfs/v1' + this.currentDir;
            // 防止当前目录最后一位是'/'，所以用append_path拼接字符串
            url = this.$processFunc.append_path(url, this.fileName);
            url += '?op=GET_BLOCK_LOCATIONS';
            return url;
        },
        downloadUrl: function() {
            let url = '/webhdfs/v1' + this.currentDir;
            // 防止当前目录最后一位是'/'，所以用append_path拼接字符串
            url = this.$processFunc.append_path(url, this.fileName);
            url += '?op=OPEN';
            return url;
        }
    },

    methods: {
        handleCloseDialog() {
            this.$emit('closeFileInfoDialog');
        },

        downloadFile() {
            // console.log(this.downloadUrl)
            this.$axios.get(this.$backend + '/download_file/', {
                params: {
                    'activeNN': this.$clusterInfo.activeNN.hostIP,
                    'url': this.downloadUrl
                },
                responseType: 'blob',   // 表明服务器返回的数据类型
                withCredentials: false,
            })
            .then(res => {
                // console.log(res)
                if (res.status == 200) {
                    // console.log(res.data)
                    let blob = new Blob([res.data], {
                        type: "application/octet-stream"
                    });
                    if ('download' in document.createElement('a')) { 
                        //支持a标签download的浏览器
                        const link = document.createElement('a')//创建a标签
                        link.download = this.fileName//a标签添加属性
                        link.style.display = 'none'
                        link.href = URL.createObjectURL(blob)
                        document.body.appendChild(link)
                        link.click()//执行下载
                        URL.revokeObjectURL(link.href) //释放url
                        document.body.removeChild(link)//释放标签
                    }else{
                        navigator.msSaveBlob(blob, fileName)
                    }
                }
            })
            .catch(err => {
                // console.log(err)
                this.$notify.error({
                    title: "失败",
                    message: "无法下载文件",
                    duration: 3000,
                });
            })
        },

        open() {
            this.showBlockInfo = true;
            this.$axios.get(this.$backend + '/get_block_info/', {
                params: {
                    'activeNN': this.$clusterInfo.activeNN.hostIP,
                    'url': this.getBlockInfoUrl
                }
            })
            .then(res => {
                if (res.status == 200) {
                    // console.log(res);
                    // 判断文件长度是否大于0，如果为0则不显示block信息
                    if (res.data.LocatedBlocks.fileLength == 0) {
                        this.showBlockInfo = false;
                        return;
                    }
                    // 获取文件在hdfs中的块信息
                    let arr = res.data.LocatedBlocks.locatedBlocks;
                    // console.log(arr);
                    // 循环获取block块信息
                    for (let i = 0; i < arr.length; i++) {
                        let blockInfo = arr[i].block;
                        // console.log(blockInfo);
                        // 定义一个对象存储信息值
                        let infoObj = {};
                        // block块ID，block生成时间，bolock大小
                        let blockId = blockInfo.blockId;
                        let genTime = blockInfo.generationStamp;
                        let fileSize = blockInfo.numBytes;
                        // 获取当前数据块冗余存储在哪些主机上，定义一个数组存储主机名
                        let hostArr = [];
                        for (let k = 0; k < arr[i].locations.length; k++) {
                            let host = arr[i].locations[k].hostName;
                            hostArr.push(host);
                        }
                        // 将信息存入对象中,同时将block对应select组件的信息存入对象
                        infoObj['value'] = i;
                        infoObj['label'] = 'Block' + i;
                        infoObj['blockId'] = blockId;
                        infoObj['genTime'] = genTime;
                        infoObj['fileSize'] = fileSize;
                        infoObj['hosts'] = hostArr;
                        // 将对象存入this.blocks
                        this.blocks.push(infoObj);
                    }
                    // test
                    // let test = {};
                    // test['value'] = 1;
                    // test['label'] = 'Block' + 1;
                    // test['blockId'] = 2;
                    // test['genTime'] = 2;
                    // test['fileSize'] = 2;
                    // test['hosts'] = ['hadoop1', 'hadoop2', 'hadoop3'];
                    // this.blocks.push(test);

                    // console.log(this.blocks);
                    // 初始化block,使得对话框默认显示block0
                    this.block = this.blocks[0];
                }
            })
            .catch(err => {
                console.log(err);
                this.$notify.error({
                    title: "失败",
                    message: "无法获取文件信息",
                    duration: 3000,
                });
            })
        },

        close() {
            this.blocks = [];
        },

        changeBlockInfo(value) {
            this.block = this.blocks[value];
        },

        // 获取datanodes节点
        getDNs() {
            this.$axios.get(this.$backend + "/get_datanodes/", {
                params: {
                    clusterName: this.$clusterInfo.cluster
                }
            })
            .then(res => {
                // console.log(res.data)
                // 获取res.data.info中的键列表
                let hostName = Object.keys(res.data)
                for (let i = 0; i < hostName.length; i++) {
                    // 定义一个对象存储信息值
                    let temp = {}
                    temp['hostName'] = hostName[i]
                    temp['hostIP'] = res.data[hostName[i]]
                    // 将信息存入hosts中
                    this.hosts.push(temp)
                }
                // console.log(this.hosts)
            })
            .catch(err => {
                console.log(err)
            })
        },

        // 检查下载时的参数是否完整
        handledownloadToHost() {
            if (this.hostIP != "" && this.downloadPath != "") {
                this.btnFileToHost = "下载中..."
                this.downloadToHost()
            } else {
                this.$notify.warning({
                    title: "警告",
                    message: "需要选中主机或存储路径",
                    duration: 3000,
                });
            }
        },

        downloadToHost() {
            this.$axios.get(this.$backend + "/dowanload_file_to_host/", {
                params: {
                    hostIP: this.hostIP,
                    filePath: this.$processFunc.append_path(this.currentDir, this.fileName),
                    hostPath: this.$processFunc.append_path("/", this.downloadPath)
                }
            })
            .then(res => {
                // console.log(res)
                if (res.status == 200) {
                    // 关闭对话框
                    this.innerVisible = false
                    this.$notify.success({
                        title: "成功",
                        message: "成功下载文件到远程主机",
                        duration: 3000,
                    });
                    // 将按钮的显示恢复为"下载", 路径恢复为初始值
                    this.downloadPath = '/hdfs_download'
                    this.btnFileToHost = "下 载"
                }
            })
            .catch(err => {
                console.log(err)
                this.$notify.error({
                    title: "失败",
                    message: "无法下载文件到远程主机",
                    duration: 3000,
                });
            })
        },

        clearHosts() {
            // 设置关闭对话框后，清除下拉框保存的信息
            this.hostIP = ''
            this.hosts = []
        }

    }

}
</script>