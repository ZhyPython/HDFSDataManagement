<template>
<div class="hdfs-dir">
    <div class="option-bar">
        <OptionBtnGroup :currentDir="currentDir" @refreshDir="refreshDir">
        </OptionBtnGroup>
    
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
    
        <el-input 
            placeholder="输入文件名在当前目录下搜索文件" 
            size="medium"
            clearable
            @clear="recoveryDir"
            @keyup.enter.native="searchFile"
            @input="searchFile"
            v-model="searchString">
            <el-button 
                slot="prepend" 
                icon="el-icon-search"
                @click="searchFile">
            </el-button>
        </el-input>
    </div>

    <div class="show-table">
        <HDFSTable :tableData="tableData" 
                   :currentDir="currentDir"
                   @enterDir="refreshDir"
                   @changeCurrentDir="changeCurrentDir">
        </HDFSTable>
    </div>
</div>
</template>

<script>
import HDFSTable from './HDFSTable.vue';
import OptionBtnGroup from './OptionBtnGroup.vue'

export default ({
    name: 'HDFSDirectory',

    data() {
        return {
            tableData: [],
            currentDir: '/',   
            searchString: '',
        }
    },

    computed: {
        
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

            this.$axios.get(url)
            .then(res => {
                this.tableData = this.$processFunc.parseDirectory(res.data);
            })
            .catch(err => {
                this.$notify.error({
                            title: "失败",
                            message: "获取信息失败:" + err,
                            duration: 3000,
                        });
            })
        },

        refreshDir(flag, currentDir) {
            if (flag == true) {
                this.initDir(currentDir);
            }
        },

        changeCurrentDir(dir) {
            this.currentDir = dir;
        },

        searchFile() {
            if (this.searchString == '') {
                this.initDir(this.currentDir);
            }
            // 定义一个正则表达式进行文件名的匹配，参数 i 表示不区分大小写
            let reg = new RegExp(this.searchString, 'i');
            let tempArr = [];
            for (let i = 0; i < this.tableData.length; i++) {
                if (reg.test(this.tableData[i].pathSuffix)) {
                    tempArr.push(this.tableData[i]);
                }
            }
            this.tableData = tempArr;
        },

        recoveryDir() {
            this.initDir(this.currentDir);
        },

    },
})
</script>

<style scoped>
.hdfs-dir {
    margin-left: 100px;
    margin-right: 100px;
}
</style>
