<template>
<!-- 用户管理组件 -->
<div class="user-manager">
    <el-table
        :data="userData"
        style="width: 100%"
        @selection-change="handleSelectionChange">

        <el-table-column
            type="selection"
            width="55">
        </el-table-column>

        <el-table-column
            label="用户名">
        </el-table-column>

        <el-table-column
            label="角色">
        </el-table-column>

        <el-table-column
            label="账号状态">
        </el-table-column>

        <el-table-column
            label="注册时间">
        </el-table-column>

        <el-table-column
            label="操作">
        </el-table-column>
    </el-table>
</div>
</template>

<script>
export default {
    name: 'UserManager',

    data() {
        return {
            userData: []
        }
    },

    methods: {
        handleSelectionChange () {}
    }
}
</script>