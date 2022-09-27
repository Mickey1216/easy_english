<template>
  <!-- 复习页面 -->
  <div>
    <!-- 顶部 -->
    <div
      class="reviewReport"
      :style="{ visibility: reviewReportShowing ? 'visible' : 'hidden' }"
    >
      <!-- 单词按钮 -->
      <div class="reviewReportLeft">
        <el-button
          :type="getBtnType(index)"
          v-for="index in indexArray"
          plain
          @click="jumpToQuestion(index)"
          >{{ index }}</el-button
        >
      </div>
      <!-- 准确率 -->
      <div class="reviewReportRight">
        <div class="reviewReportRightGroup">
          <el-progress
            type="circle"
            :percentage="calcAccuracy"
            :color="customColorsScores"
          ></el-progress>
          <div class="reviewReportRightGroupText">正确率</div>
        </div>
      </div>
    </div>
    <!-- ReviewWordCard组件 -->
    <ReviewWordCard
      :reviewWordsLen="reviewWords.length"
      :question="reviewWords[currency - 1]"
      @prevQuestionEvent="prevQuestion"
      @nextQuestionEvent="nextQuestion"
      @questionDid="questionDid"
      @wordMarkChangeEvent="wordMarkChange"
    />
    <!-- 进度条 -->
    <el-progress
      :percentage="percentage"
      :format="progress"
      :color="customColors"
    ></el-progress>
    <!-- 底部按钮 -->
    <div class="reviewBottom">
      <!-- 【返回】 -->
      <div
        class="reviewBottomBtn"
        v-if="reviewReportShowing"
        @click="returnReviewSettingClick"
      >
        返回
      </div>
      <!-- 【生成复习结果】 -->
      <div
        class="reviewBottomBtn"
        :class="{ reviewBottomBtnDisabled: reviewReportShowing }"
        @click="reviewReportClick"
      >
        生成复习结果
      </div>
      <!-- 【再做一次】 -->
      <div
        class="reviewBottomBtn"
        v-if="reviewReportShowing"
        @click="doAgainClick"
      >
        再做一次
      </div>
    </div>
  </div>
</template>

<script>
import ReviewWordCard from "../wordsReview/ReviewWordCard.vue";
import { ElNotification } from "element-plus";
import request from "../../../api/request";
import Cookies from "js-cookie";

export default {
  name: "DoReview",
  props: ["reviewWords"],
  components: {
    ReviewWordCard,
  },
  data() {
    return {
      currency: -1, // 当前单词索引
      total: -1, // 复习单词的总个数
      customColors: [ // 进度条颜色
        { color: "#1989fa", percentage: 20 },
        { color: "#5cb87a", percentage: 40 },
        { color: "#6f7ad3", percentage: 60 },
        { color: "#e6a23c", percentage: 80 },
        { color: "#f56c6c", percentage: 100 }
      ],
      customColorsScores: [ // 准确率进度条颜色
        { color: "#f56c6c", percentage: 20 },
        { color: "#e6a23c", percentage: 40 },
        { color: "#1989fa", percentage: 60 },
        { color: "#5cb87a", percentage: 80 }
      ],
      indexArray: [], // 单词索引数组
      reviewReportShowing: false, // 是否存在复习报告
    };
  },
  computed: {
    // 进度条的百分比
    percentage() {
      return (this.currency / this.total) * 100;
    },
    // 计算按钮的type值：warning/success/danger
    getBtnType() {
      return (index) => {
        // 当前单词  
        let question = this.reviewWords[index - 1];

        if (question.done === -1) return "warning";

        if (question.doneRes) 
            return "success";
        else 
            return "danger";
      };
    },
    // 准确率进度条的百分比
    calcAccuracy() {
      return ((this.reviewWords.filter(item => item.doneRes).length / this.reviewWords.length) * 100)
        .toFixed(2);
    }
  },
  methods: {
    // 指定进度条文字内容  
    progress() {
      return `${this.currency} / ${this.total}`;
    },
    // 获取上一个单词
    prevQuestion() {
      if (this.currency > 1) this.currency--;
    },
    // 获取下一个单词
    nextQuestion() {
      if (this.currency < this.reviewWords.length) this.currency++;
    },
    // 判断单词是否已经复习过
    questionDid(done, doneRes) {
      let question = this.reviewWords[this.currency - 1];
      question.done = done;
      question.doneRes = doneRes;

      if (this.currency < this.reviewWords.length) this.currency++;
    },
    // 改变单词的标志
    wordMarkChange(word, mark) {
      request(`/words/mark`, "PATCH", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        word,
        mark
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "单词标记操作",
            type: "success",
            duration: 2000,
          });

          this.reviewWords[this.currency - 1].mark = mark;
        } else { // 失败
          ElNotification({
            title: "失败",
            message: "服务器出现问题",
            type: "error",
            duration: 2000,
          });
        }
      });
    },
    // 【生成复习结果】- 点击事件
    reviewReportClick() {
      if (this.reviewReportShowing) return;

      this.reviewWords.forEach(item => {
        item.reveal = true;
      });
      this.reviewReportShowing = true;
    },
    // 点击单词序列按钮，进行跳转
    jumpToQuestion(index) {
      this.currency = index;
    },
    // 【返回】- 点击事件
    returnReviewSettingClick() {
      this.reviewReportShowing = false;
      this.$emit("returnReviewSettingEvent");
    },
    // 【再做一次】- 点击事件
    doAgainClick() {
      this.reviewReportShowing = false;

      this.reviewWords.forEach(item => {
        item.done = -1;
        item.doneRes = false;
        item.reveal = false;
      });

      this.currency = 1;
    }
  },
  created() {
    this.currency = 1;
    this.total = this.reviewWords.length;
    for (let i = 1; i <= this.total; i++) 
      this.indexArray.push(i);
  }
};
</script>

<style scoped>
.reviewReport {
  min-height: 140px;

  display: flex;
}

.reviewReportLeft {
  width: 80%;
}

.reviewReportRight {
  width: 20%;
}

.el-button {
  margin: 0 2px;
  width: 50px;
}

.reviewBottom {
  display: flex;
  justify-content: center;
  margin-top: 80px;
  margin-bottom: 20px;
}

.reviewBottomBtn {
  background-color: rgb(37, 187, 155);
  height: 48px;
  width: 140px;
  line-height: 48px;
  text-align: center;
  color: #fff;
  font-size: 14px;
  border-radius: 4px;
  cursor: pointer;
}

.reviewBottomBtn:hover {
  background-color: rgb(34, 174, 144);
}

.reviewBottomBtn:first-child,
.reviewBottomBtn:last-child {
  margin: 0 100px;
}

.reviewReportRightGroup {
  text-align: center;
}

.reviewBottomBtnDisabled,
.reviewBottomBtnDisabled:hover {
  background-color: #fff;
  color: rgb(192, 196, 204);
  border: 1px solid rgb(235, 238, 245);
  cursor: not-allowed;
}
</style>