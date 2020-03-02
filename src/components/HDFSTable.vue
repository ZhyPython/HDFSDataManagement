<template>
<div class="dir-table">
    <el-table 
        :data="tableData"  
        height="500" 
        highlight-current-row="true">
        <!-- <el-table-column type="selection" width="55"></el-table-column> -->
        <el-table-column 
            prop="pathSuffix" 
            label="名称" 
            sortable="true">
        </el-table-column>
        <el-table-column 
            prop="permission" 
            label="权限">
        </el-table-column>
        <el-table-column 
            prop="owner" 
            label="所有者">
        </el-table-column>
        <el-table-column 
            prop="group" 
            label="所有组">
        </el-table-column>
        <el-table-column 
            prop="length" 
            label="大小">
        </el-table-column>
        <el-table-column 
            prop="modificationTime" 
            label="最近修改时间"   
            sortable="true">
        </el-table-column>
        <el-table-column 
            prop="replication" 
            label="副本数量">
        </el-table-column>
        <el-table-column 
            prop="blockSize" 
            label="块大小">
        </el-table-column>
        <el-table-column 
            label="操作">
            <template slot-scope="scope">
                <el-button 
                    size="small" 
                    @click="handleDelete(scope.$index, scope.row)" 
                    icon="el-icon-delete">
                </el-button>
            </template>
        </el-table-column>
    </el-table>
</div>
</template>

<script>
export default {
    name: 'HDFSTable',

    props: {
        tableData: Array,
    },

    data() {
        return {
            tableData: [],
        }
    },
}
</script>