<template>
  <!-- 复习单词卡片 -->
  <div class="card-item">
    <!-- 正确祝贺图片、单词、标记 -->
    <div class="card-top">
      <img
        v-show="question.reveal && question.doneRes"
        src="../../../assets/right.png"
        style="height: 142px; width: 200px; position: absolute; left: 0"
        alt="正确祝贺"
      />
      <div class="card-word">{{ question.word }}</div>
      <div class="card-mark">
        <i
          @click="wordMarkChange"
          class="fa"
          :class="question.mark === '0' ? 'fa-star-o' : 'fa-star'"
        ></i>
      </div>
    </div>
    <!-- 单词音标 -->
    <div class="card-pron">{{ question.pronunciation }}</div>
    <!-- 单词例句 -->
    <div class="card-sentence">{{ question.sentence }}</div>
    <!-- 单词释义选项 -->
    <div class="card-btns">
      <!-- 【< prev】 -->
      <div class="card-change">
        <el-button
          class="change-word"
          :disabled="prevBtnDisable"
          @click="prevQuestionClick"
          type="text"
          >&lt;&nbsp;prev</el-button
        >
      </div>
      <!-- 选项（共4个） -->
      <div class="card-options">
        <div
          @click="chooseAns(0)"
          class="card-option"
          :class="{
            'card-option-active': question.done === 0,
            'card-option-done-wrong':
              question.reveal && !question.doneRes && question.done === 0,
            'card-option-done-right':
              question.reveal && question.done !== -1 && question.ans === 0,
          }"
        >
          {{ question.options[0] }}
        </div>
        <div
          @click="chooseAns(1)"
          class="card-option"
          :class="{
            'card-option-active': question.done === 1,
            'card-option-done-wrong':
              question.reveal && !question.doneRes && question.done === 1,
            'card-option-done-right':
              question.reveal && question.done !== -1 && question.ans === 1,
          }"
        >
          {{ question.options[1] }}
        </div>
        <div
          @click="chooseAns(2)"
          class="card-option"
          :class="{
            'card-option-active': question.done === 2,
            'card-option-done-wrong':
              question.reveal && !question.doneRes && question.done === 2,
            'card-option-done-right':
              question.reveal && question.done !== -1 && question.ans === 2,
          }"
        >
          {{ question.options[2] }}
        </div>
        <div
          @click="chooseAns(3)"
          class="card-option"
          :class="{
            'card-option-active': question.done === 3,
            'card-option-done-wrong':
              question.reveal && !question.doneRes && question.done === 3,
            'card-option-done-right':
              question.reveal && question.done !== -1 && question.ans === 3,
          }"
        >
          {{ question.options[3] }}
        </div>
      </div>
      <!-- 【next >】 -->
      <div class="card-change">
        <el-button
          class="change-word"
          :disabled="nextBtnDisable"
          @click="nextQuestionClick"
          type="text"
          >next&nbsp;&gt;</el-button
        >
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "ReviewWordCard",
  props: ["question", "reviewWordsLen"],
  methods: {
    // 【< prev】- 点击事件
    prevQuestionClick() {
      this.$emit("prevQuestionEvent");
    },
    // 【next >】- 点击事件
    nextQuestionClick() {
      this.$emit("nextQuestionEvent");
    },
    // 选中某一选项
    chooseAns(chooseAns) {
      if (chooseAns === this.question.done || this.question.reveal) return;

      this.$emit("questionDid", chooseAns, chooseAns === this.question.ans);
    },
    // 单词标记修改事件 - 点击
    wordMarkChange() {
      this.$emit(
        "wordMarkChangeEvent",
        this.question.word,
        this.question.mark === "0" ? "1" : "0"
      );
    }
  },
  computed: {
    // 【< prev】
    prevBtnDisable() {
      return !this.question.index;
    },
    // 【next >】
    nextBtnDisable() {
      return this.question.index === this.reviewWordsLen - 1;
    }
  }
};
</script>

<style scoped>
.card-top {
  height: 50px;
  display: flex;
  justify-content: center;
  font-size: 36px;
  margin-top: 30px;
}

.card-word,
.card-mark {
  height: 50px;
  display: flex;
  align-items: center;
}

.card-word {
  transform: translateX(14px);
}

.card-mark {
  font-size: 28px;
  transform: translate(60px, 4px);
}

.card-mark i {
  color: rgb(104, 193, 189);
  cursor: pointer;
}

.card-pron {
  display: flex;
  justify-content: center;
  margin: 20px 0;
}

.card-sentence {
  display: flex;
  justify-content: center;
}

.card-btns {
  margin: 40px auto;
  width: 80%;
  display: flex;
}

.card-change {
  display: flex;
  align-items: center;
}

.card-options {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.card-option {
  width: 80%;
  min-height: 50px;
  font-size: 17px;
  display: flex;
  align-items: center;
  padding-left: 20px;
  border: 1px solid rgb(220, 223, 230);
  text-align: left;
  margin: 10px 0;
  font-family: "Helvetica Neue", Helvetica, "PingFang SC", "Hiragino Sans GB",
    "Microsoft YaHei", "微软雅黑", Arial, sans-serif;
  cursor: pointer;
}

.card-option:hover {
  background-color: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
  border: 1px solid rgb(198, 226, 255);
}

.card-option-active {
  background-color: rgb(236, 245, 255);
  color: rgb(64, 158, 255);
  border: 1px solid rgb(198, 226, 255);
}

.card-change {
  display: flex;
  justify-content: space-around;
}

.change-word {
  min-height: 0;
  min-width: 0;
  font-size: 22px;
}

.card-option-done-wrong,
.card-option-done-wrong:hover {
  color: rgb(245, 108, 108);
  background-color: rgb(254, 240, 240);
  border: 1px solid rgb(251, 196, 196);
}

.card-option-done-right,
.card-option-done-right:hover {
  color: rgb(103, 194, 58);
  background-color: rgb(240, 249, 235);
  border: 1px solid rgb(194, 231, 176);
}
</style>