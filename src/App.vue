<template>
  <div id="app">
      <!-- <HDFSDirectory></HDFSDirectory> -->
      <!-- <HDFSTag/> -->
    <router-view></router-view>
  </div>
</template>

<script>
// import HDFSDirectory from './components/HDFSDirectory.vue'
// import HDFSTag from './components/HDFSTag.vue'

export default {
  name: 'App',

  components: {
    // HDFSDirectory,
    // HDFSTag,
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  /* margin-top: 60px; */
  /* height: 100%; */
}

body {
  margin: 0px;
  /* height: 100%; */
}
</style>
