<template>
<!-- 用户管理组件 -->
<div class="user-manager" style="width: 90%; margin: auto;">
    <div style="margin-bottom: 20px; float: left">
        <el-button type="success" size="medium" @click="handleBatchEnable" icon="el-icon-circle-check">启用账号</el-button>
        <el-button type="warning" size="medium" @click="handleBatchDisable" icon="el-icon-circle-close">禁用账号</el-button>
        <el-button type="danger" size="medium" @click="handleBatchDelete" icon="el-icon-delete">删除账号</el-button>
    </div>
    
    <div style="width: 400px; float: right">
        <span style="display: inline-block">搜索用户：</span>
        <el-input 
            size="medium"
            v-model="searchString"
            clearable
            @clear="recoveryUsers"
            @input="searchUser"
            placeholder="输入用户名搜索用户"
            style="width: 300px">
        </el-input>
    </div>

    <el-table
        ref="usersTable"
        :data="showData"
        style="width: 100%; margin-bottom: 15px"
        @selection-change="handleSelectionChange"
        @filter-change="handleFilterChange">

        <el-table-column
            type="selection"
            width="55">
        </el-table-column>

        <el-table-column
            label="用户名"
            prop="username"
            min-width="20%">
        </el-table-column>

        <el-table-column
            label="角色"
            prop="role"
            min-width="20%">
        </el-table-column>

        <el-table-column
            label="账号状态"
            min-width="20%"
            column-key="state"
            :filters="[{text: '已通过审核', value: '已通过审核'}, {text: '账号审核中', value: '账号审核中'}]">
            <template slot-scope="scope">
                <span v-if="scope.row.state=='已通过审核'" style="color: #67C23A">已通过审核</span>
                <span v-if="scope.row.state=='账号审核中'" style="color: #fa0909">账号审核中</span>
            </template>
        </el-table-column>

        <el-table-column
            label="注册时间"
            prop="createDate"
            min-width="20%">
        </el-table-column>

        <el-table-column
            label="操作"
            min-width="20%">
            <template slot-scope="scope">
                <el-button
                    size="mini"
                    type="success"
                    @click="handleEnable(scope.$index, scope.row)"
                    icon="el-icon-circle-check"
                    :disabled="scope.row.state === '已通过审核'">
                </el-button>
                <el-button
                    size="mini"
                    type="warning"
                    @click="handleDisable(scope.$index, scope.row)"
                    icon="el-icon-circle-close"
                    :disabled="scope.row.state === '账号审核中'">
                </el-button>
                <el-button
                    size="mini"
                    type="danger"
                    @click="handleDelete(scope.$index, scope.row)"
                    icon="el-icon-delete">
                </el-button>
            </template>
        </el-table-column>
    </el-table>

    <div class="user-pagination" align="center">
        <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange" 
        :current-page="currentPage"
        :page-sizes="[5, 10, 20]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="userData.length">
        </el-pagination>
    </div>

</div>
</template>

<script>
export default {
    name: 'UserManager',

    data() {
        return {
            userData: [],
            multipleSelection: [],      // 多选的用户对象数组
            searchString: '',           // 输入框的搜索项
            searchData: [],             // 被搜索的变量
            currentPage: 1,
            pageSize: 5,
        }
    },

    computed: {
        showData: {
            get() {
                // 要显示的开始位置和终止位置
                let begin = (this.currentPage - 1) * this.pageSize;
                let end = this.currentPage * this.pageSize;
                return this.userData.slice(begin, end);
            }
        }
    },

    mounted() {
        this.getUsers();
    },

    methods: {
        searchUser() {
            if (this.searchString == '') {
                this.getUsers();
            }
            else {
                // 定义一个正则表达式进行用户名的匹配，参数 i 表示不区分大小写
                let reg = new RegExp(this.searchString, 'i');
                let tempArr = [];
                for (let i = 0; i < this.searchData.length; i++) {
                    if (reg.test(this.searchData[i].username)) {
                        tempArr.push(this.searchData[i]); 
                    }
                }
                this.userData = tempArr; 
            }
        },

        recoveryUsers() {
            this.getUsers();
        },

        handleSelectionChange (val) {
            this.multipleSelection = val;
            // console.log(this.multipleSelection);
        },

        getUsers () {
            this.$axios.get(this.$backend + '/list_users/', {
                params: {
                    'username': localStorage.getItem('username')
                }
            })
            .then(res => {
                // console.log(res)
                this.userData = res.data;
                // 为searchData赋值，搜索用户名时从该变量搜索，防止userData被无意更改
                this.searchData = res.data;
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法获取账号信息",
                    duration: 3000,
                });
            })
        },

        handleBatchEnable() {
            // 若未选中则将提示
            if (this.$refs.usersTable.selection.length == 0) {
                this.$notify.error({
                    title: "失败",
                    message: '请先选择账号',
                    duration: 3000,
                })
                return;
            }
            // 确认是否启用
            this.$confirm('确认启用该批账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                // 选中的数据是一个数组
                let selectData = this.$refs.usersTable.selection;
                // 获取选中数据在userData中的索引
                let indexArr = new Array();
                for (let i = 0; i < selectData.length ; i++) {
                    let idx = this.userData.findIndex(x => x.username==selectData[i].username);
                    indexArr.push(idx);
                }
                // console.log(index);
                // 调用enableUser函数
                this.enableUser(indexArr, selectData);
            })
            .catch(() => {})
        },

        handleEnable(index, users) {
            this.$confirm('确认启用该账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                this.enableUser(index, users);
            })
            .catch(() => {})
        },

        enableUser(index, users) {
            let data = {};
            data['currentUser'] = localStorage.getItem('username');
            // 如果users不是数组则将其放入数组中，同时将index也放入数组
            let usersArr = new Array();
            let indexArr = new Array();
            if (Array.isArray(users)) {
                usersArr = users;
                indexArr = index;
            } else {
                usersArr[0] = users;
                indexArr[0] = index;
            }
            data['users'] = usersArr;
            // 调用接口处理
            this.$axios.post(this.$backend + '/enable_user/', data)
            .then(res => {
                // console.log(res.data)
                // 更新表格中的数据
                for (let i = 0; i < indexArr.length; i++) {
                    this.userData[indexArr[i]].state = '已通过审核';
                }
                // 提示成功
                this.$notify.success({
                    title: "成功",
                    message: '启用账号成功',
                    duration: 3000,
                });
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法启用账号",
                    duration: 3000,
                });
            })
        },

        handleBatchDisable() {
            // 若未选中则将提示
            if (this.$refs.usersTable.selection.length == 0) {
                this.$notify.error({
                    title: "失败",
                    message: "请先选择账号",
                    duration: 3000,
                });
                return;
            }
            // 确认是否禁用
            this.$confirm('确认禁用该批账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                // 选中的数据是一个数组
                let selectData = this.$refs.usersTable.selection;
                // 获取选中数据在userData中的索引
                let indexArr = new Array();
                for (let i = 0; i < selectData.length ; i++) {
                    let idx = this.userData.findIndex(x => x.username==selectData[i].username);
                    indexArr.push(idx);
                }
                // console.log(index);
                // 调用disableUser函数
                this.disableUser(indexArr, selectData);
            })
            .catch(() => {})
        },

        handleDisable(index, users) {
            this.$confirm('确认禁用该账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                this.disableUser(index, users);
            })
            .catch(() => {})
        },

        disableUser(index, users) {
            let data = {};
            data['currentUser'] = localStorage.getItem('username');
            // 如果users不是数组则将其放入数组中，同时将index也放入数组
            let usersArr = new Array();
            let indexArr = new Array();
            if (Array.isArray(users)) {
                usersArr = users;
                indexArr = index;
            } else {
                usersArr[0] = users;
                indexArr[0] = index;
            }
            data['users'] = usersArr;
            // 调用接口处理
            this.$axios.post(this.$backend + '/disable_user/', data)
            .then(res => {
                // console.log(res.data)
                // 更新表格中的数据
                for (let i = 0; i < indexArr.length; i++) {
                    this.userData[indexArr[i]].state = '账号审核中';
                }
                this.$notify.success({
                    title: "成功",
                    message: "禁用账号成功",
                    duration: 3000,
                });
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法禁用账号",
                    duration: 3000,
                });
            })
        },

        handleBatchDelete() {
            // 若未选中则将提示
            if (this.$refs.usersTable.selection.length == 0) {
                this.$notify.error({
                    title: "失败",
                    message: "请先选择账号",
                    duration: 3000,
                });
                return;
            }
            // 确认是否删除
            this.$confirm('确认删除该批账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                // 选中的数据是一个数组
                let selectData = this.$refs.usersTable.selection;
                // 获取选中数据在userData中的索引
                let indexArr = new Array();
                for (let i = 0; i < selectData.length ; i++) {
                    let idx = this.userData.findIndex(x => x.username==selectData[i].username);
                    indexArr.push(idx);
                }
                // console.log(index);
                // 调用deleteUser函数
                this.deleteUser(indexArr, selectData);
            })
            .catch(() => {})
        },

        handleDelete(index, users) {
            this.$confirm('确认删除该账号？', '提示', {
                confirmButtonText: '确定',
                cacelButtonText: '取消',
                type: 'warning'
            })
            .then(() => {
                this.deleteUser(index, users);
            })
            .catch(() => {})
        },

        deleteUser(index, users) {
            let data = {};
            data['currentUser'] = localStorage.getItem('username');
            // 如果users不是数组则将其放入数组中，同时将index也放入数组
            let usersArr = new Array();
            let indexArr = new Array();
            if (Array.isArray(users)) {
                usersArr = users;
                indexArr = index;
            } else {
                usersArr[0] = users;
                indexArr[0] = index;
            }
            data['users'] = usersArr;
            // 调用接口处理
            this.$axios.post(this.$backend + '/delete_user/', data)
            .then(res => {
                // console.log(res.data)
                // 逆向循环删除表格中的数据，否则前向循环会破坏数组下标
                for (let i = indexArr.length - 1; i >= 0; i--) {
                    this.userData.splice(indexArr[i], 1);
                }
                this.$notify.success({
                    title: "成功",
                    message: "删除账号成功",
                    duration: 3000,
                });
            })
            .catch(err => {
                this.$notify.error({
                    title: "失败",
                    message: "无法删除账号",
                    duration: 3000,
                });
            })
        },

        handleFilterChange(filters) {
            // console.log(filters);
            let states = filters.state;
            if (states.length == 0) {
                // 如果filters的state属性为空列表，则表示不用过滤
                this.getUsers();
            } else {
                // 判断表格数据是否在过滤条件之中
                let tmp = [];
                for (let i = 0; i < this.searchData.length; i++) {
                    if (states.indexOf(this.searchData[i].state) >= 0) {
                        tmp.push(this.searchData[i]); 
                    }
                }
                this.userData = tmp;
            }
        },

        handleSizeChange(pageSize) {
            // 回调参数为每页条数
            this.pageSize = pageSize;
        },

        handleCurrentChange(currentPage) {
            // 回调参数为当前页
            this.currentPage = currentPage;
        }

    }
}
</script>