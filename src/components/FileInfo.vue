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

        <span slot="footer" class="dialog-footer">
            <el-button
                type="primary"
                size="medium"
                @click="downloadFile"
                >下载
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
            this.$axios.get(this.downloadUrl, {
                responseType: 'blob'   // 表明服务器返回的数据类型
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
                this.$notify.error({
                    title: "失败",
                    message: "无法下载文件",
                    duration: 3000,
                });
            })
        },

        open() {
            this.$axios.get(this.getBlockInfoUrl)
            .then(res => {
                if (res.status == 200) {
                    // console.log(res);
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
        }

    }

}
</script>