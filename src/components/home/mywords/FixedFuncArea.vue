<template>
  <div>
    <!-- 固钉 添加单词的作用 -->
    <el-affix position="bottom" :offset="20">
      <el-button @click="addWord" size="large" circle class="addWordIcon">
        <el-icon><i class="fa fa-plus"></i></el-icon>
      </el-button>
    </el-affix>
  </div>
</template>

<script>
export default {
  name: "FixedFuncArea",
  methods: {
    // 添加单词  
    addWord() {
      this.$emit("addWordEvent");
    }
  }
};
</script>

<style scoped>
.el-affix {
  position: absolute;
  top: 50px;
  right: 300px;
}

.addWordIcon {
  height: 50px;
  width: 50px;
  background-color: rgb(179, 216, 255);
  color: #fff;
}

.addWordIcon:hover {
  background-color: #409eff;
}
</style>