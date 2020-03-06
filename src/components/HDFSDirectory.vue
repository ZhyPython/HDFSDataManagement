<template>
<div class="hdfs-dir">
    <div class="option-bar">
        <el-input placeholder="" class="input-with-search" size="medium">
            <el-button slot="append" icon="el-icon-search"></el-button>
        </el-input>

        <OptionBtnGroup :currentDir="currentDir" @refreshDir="refreshDir">
        </OptionBtnGroup>
    </div>

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
        }
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
        }

    },
})
</script>

<style scoped>
.hdfs-dir {
    margin-left: 100px;
    margin-right: 100px;
}
</style>
