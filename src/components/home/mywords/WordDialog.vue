<template>
  <div>
    <!-- 对话框：添加单词和修改单词共用一个  -->
    <el-dialog
      v-model="visibility"
      :title="isAdd ? '添加单词' : '单词信息修改'"
      width="30%"
      :before-close="handleClose"
    >
      <div v-loading="wordUpdateLoading">
        <div>
          单词<el-input
            v-model="word"
            :disabled="!isAdd"
            :placeholder="word"
            @focusout="autoFillWord"
          ></el-input>
        </div>
        <div>音标 <el-input v-model="pronunciation" /></div>
        <div>释义 <el-input v-model="explanation" /></div>
        <div>
          例子
          <el-input
            class="textareaInput"
            type="textarea"
            autosize
            v-model="sentence"
            ref="textareaInputRef"
          />
        </div>
        <div>备注 <el-input v-model="note" /></div>
      </div>

      <template #footer>
        <span class="dialog-footer">
          <span v-if="isFetchFill" class="dialog-footer-loading"
            ><i class="fa fa-spinner fa-spin"></i
          ></span>
          <el-button
            v-if="!isAdd"
            type="primary"
            :disabled="wordUpdateLoading"
            @click="confirmEdition"
            >修改</el-button
          >
          <el-button
            v-if="isAdd"
            type="primary"
            :disabled="wordUpdateLoading"
            @click="confirmAddition"
            >添加</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "WordDialog",
  props: ["isAdd", "visibility", "wordUpdateLoading", "row", "fill_row"],
  data() {
    return {
      word: "", // 单词
      pronunciation: "", // 音标
      explanation: "", // 释义
      sentence: "", // 例子
      note: "", // 笔记
      autoWord: "",
      isFetchFill: false, // 单词信息是否自动填充
    };
  },
  methods: {
    // 修改单词对话框中【修改】按钮 - 点击事件
    confirmEdition() {
      this.$emit(
        "confirmEditionEvent",
        this.word,
        this.pronunciation,
        this.explanation,
        this.sentence,
        this.note
      );
    },
    // 添加单词对话框中【添加】按钮 - 点击事件
    confirmAddition() {
      let word = this.word.trim();
      if (word === '' || word === undefined || word === null)
        return

      this.$emit(
        "confirmAdditionEvent",
        this.word,
        this.pronunciation,
        this.explanation,
        this.sentence,
        this.note
      );

      this.word = "";
      this.pronunciation = "";
      this.explanation = "";
      this.sentence = "";
      this.note = "";
    },
    // 关闭前的回调，会暂停 Dialog 的关闭. 回调函数内执行 done 参数方法的时候才是真正关闭对话框的时候.
    handleClose() {
      this.$emit("closeDialogEvent");
    },
    // 单词输入框失去焦点后触发事件：实现单词信息自动填充
    autoFillWord() {
      let word = this.word.trim();

      if (this.autoWord === word) return;

      if (word !== "" && word !== undefined) {
        this.isFetchFill = true;
        this.$emit("autoFillWordEvent", word);
        this.autoWord = word;
      }
    },
  },
  watch: {
    isAdd() {
      if (this.isAdd) {
        // 添加单词
        this.word = "";
        this.pronunciation = "";
        this.explanation = "";
        this.sentence = "";
        this.note = "";
      } else {
        // 修改单词信息
        this.word = this.row.word;
        this.pronunciation = this.row.pronunciation;
        this.explanation = this.row.explanation;
        this.sentence = this.row.sentence;
        this.note = this.row.note;
      }
    },
    "fill_row.pronunciation"() {
      if (this.fill_row.pronunciation !== undefined)
        this.pronunciation = this.fill_row.pronunciation;

      // 让焦点聚集到例子输入框
      this.$refs["textareaInputRef"].focus();

      this.isFetchFill = false;
    },
    "fill_row.explanation"() {
      if (this.fill_row.explanation !== undefined)
        this.explanation = this.fill_row.explanation;
    },
    "fill_row.note"() {
      if (this.fill_row.note !== undefined) this.note = this.fill_row.note;
    },
  },
};
</script>

<style scoped>
.el-input,
.textareaInput {
  margin-bottom: 12px;
  margin-top: 2px;
}

.el-dialog {
  min-width: 300px;
}

.dialog-footer-loading {
  float: left;
  margin-left: 5px;
  color: rgb(104, 193, 189);
}
</style>