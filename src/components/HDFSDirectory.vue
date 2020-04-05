<template>
<!-- HDFS文件浏览界面 -->
<div class="hdfs-dir">
    <div class="dir-position">
        <el-input 
            v-model="currentDir" 
            size="medium"
            @keyup.enter.native="refreshDir(true, currentDir)">
            <template slot="prepend">当前目录:</template>
            <el-button 
                slot="append" 
                icon="el-icon-aim" 
                @click="refreshDir(true, currentDir)">
            </el-button>
        </el-input>
    </div>

    <div class="btn-group">
        <OptionBtnGroup 
            :currentDir="currentDir" 
            @refreshDir="refreshDir"
            @backParentDir="backParentDir">
        </OptionBtnGroup>
    </div>

    <div class="search-input">    
        <span>搜索文件：</span>
        <el-input 
            placeholder="输入文件名在当前目录下搜索文件" 
            size="medium"
            clearable
            @clear="recoveryDir"
            @keyup.enter.native="searchFile"
            @input="searchFile"
            v-model="searchString"
            style="width: 400px">
        </el-input>
    </div>

    <div class="show-table">
        <HDFSTable :showData="showData" 
                   :currentDir="currentDir"
                   @sortData="sortData"
                   @enterDir="refreshDir"
                   @deleteFile="refreshDir"
                   @changeCurrentDir="changeCurrentDir">
        </HDFSTable>
    </div>

    <div class="table-pagination" align="center">
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" 
        :current-page="currentPage"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize" 
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
        </el-pagination>
    </div>
</div>
</template>

<script>
import HDFSTable from './HDFSTable.vue'
import OptionBtnGroup from './OptionBtnGroup.vue'

export default ({
    name: 'HDFSDirectory',

    data() {
        return {
            tableData: [],
            searchData: [],    // 搜索时的临时数据存储变量，防止showData无法复原
            searchFlag: false,
            currentDir: '/',   
            searchString: '',
            total: 0,
            currentPage: 1,
            pageSize: 10,    // 每页条数
        }
    },

    computed: {
        showData: {
            get () {
                // 要显示的开始位置和终止位置
                let begin = (this.currentPage - 1) * this.pageSize;
                let end = this.currentPage * this.pageSize;
                return this.tableData.slice(begin, end);
            }
        },
    },

    components: {
        HDFSTable,
        OptionBtnGroup,
    },

    // 初始化页面时就访问hdfs根目录获取数据
    mounted () {
        this.initDir();
    },

    methods: {
        initDir(currentDir='/') {
            // 拼接字符串
            let url = '/webhdfs/v1' + currentDir;
            url = url + '?op=LISTSTATUS&user.name=hdfs';
            this.$axios.get(this.$backend + '/get_hdfs_dir/', {
                params: {
                    'activeNN': this.$clusterInfo.activeNN.hostIP,
                    'url': url
                }
            })
            .then(res => {
                this.tableData = this.$processFunc.parseDirectory(res.data);
                // 计算当前目录下的文件数量
                this.total = this.tableData.length
                // 格式化显示权限、大小、修改时间
                // console.log(this.tableData);
                for(let i = 0; i < this.tableData.length; i++) {
                    // 转换所有者、所有组权限
                    let tmpPermission = this.$processFunc.helperToPermission(this.tableData[i].permission);
                    // 转换文件类型
                    this.tableData[i].permission = this.$processFunc.helperToDirectory(this.tableData[i].type)
                                                   + tmpPermission;
                    // 转换大小
                    this.tableData[i].length = this.$processFunc.formatBytes(this.tableData[i].length);
                    this.tableData[i].blockSize = this.$processFunc.formatBytes(this.tableData[i].blockSize);
                    // 转换修改时间
                    this.tableData[i].modificationTime = this.$processFunc.dateToString(this.tableData[i].modificationTime);
                    // 为searchData赋值，搜索文件时可直接在当前目录下搜索
                    this.searchData = this.tableData
                }
            })
            .catch(err => {
                this.$notify.error({
                            title: "失败",
                            message: "刷新目录表格失败",
                            duration: 3000,
                        });
            })
        },

        refreshDir(flag, currentDir) {
            if (flag == true) {
                this.initDir(currentDir);
            }
        },

        backParentDir(dir) {
            this.currentDir = dir;
        },

        changeCurrentDir(dir) {
            this.currentDir = dir;
        },

        searchFile() {
            if (this.searchString == '') {
                this.initDir(this.currentDir);
            }
            else {
                this.currentPage = 1;
                // 定义一个正则表达式进行文件名的匹配，参数 i 表示不区分大小写
                let reg = new RegExp(this.searchString, 'i');
                let tempArr = [];
                for (let i = 0; i < this.searchData.length; i++) {
                    if (reg.test(this.searchData[i].pathSuffix)) {
                        tempArr.push(this.searchData[i]); 
                    }
                }
                this.tableData = tempArr; 
            }
        },

        recoveryDir() {
            this.initDir(this.currentDir);
        },

        handleSizeChange: function(pageSize) {
            // 回调参数为每页条数
            this.pageSize = pageSize
        },

        handleCurrentChange: function(currentPage) {
            // 回调参数为当前页
            this.currentPage = currentPage
        },

        sortData: function(order) {
            if (order == "ascending") {
                console.log(order)
            }
            if (order == "descending") {
                console.log(order)
            }
            if (order == "null") {
                console.log(order)
                return;
            }
        },

    },
})
</script>

<style scoped>
/* .hdfs-dir {
    margin-left: 50px;
    margin-right: 50px;
    margin-top: -40px;
} */

.search-input {
    /* display:inline-block;  */
    float: right;
    margin-bottom: 10px;
}

.btn-group {
    /* display:inline-block;  */
    float: left;
    margin-bottom: 10px;
}

.dir-position {
    margin-bottom: 10px;
}
</style>
