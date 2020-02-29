<template>
  <div id="app">
    <div>
      <HDFSTable></HDFSTable>
      <el-row>
        <el-col :span="18" :offset="3">
          <el-divider></el-divider>
        </el-col>
      </el-row>
      <HDFSTag/>
    </div>
    <router-view/>
  </div>
</template>

<script>
import HDFSTable from './components/HDFSTable.vue'
import HDFSTag from './components/HDFSTag.vue'

export default {
  name: 'App',

  components: {
    HDFSTable,
    HDFSTag,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
