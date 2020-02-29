<template>
    <div id="test">
      <h1>网站列表</h1>
      <ol el-for="site in info">
        {{ site.name }}
      </ol>
    </div>
</template>    

<script lang="ts">
import axios from 'axios';

export default ({
    name: 'Test',
    data() {
      return {
        info: ''
      };
    },
    mounted () {
    this.axios
      .get('https://www.runoob.com/try/ajax/json_demo.json')
      .then(response => (
        // this.info = response.data.sites
        window.alert(response.data)
        ))
      .catch(function (error) { // 请求失败处理
        window.alert("请求错误" + error);
      });
  }
})
</script>
