<template>
  <!-- 单词复习 -->
  <div>
    <div class="container" v-if="!showingReviewProcess">
      <!-- 顶部 -->
      <div class="top"><i class="fa fa-cogs fa-3x"></i>复习单词设置</div>
      <!-- 中部-单词类型设置 -->
      <div class="options">
        <el-row :gutter="20">
          <!-- 第一列：单词类型 -->
          <el-col :span="6">
            <el-card shadow="hover">
              <span class="cardHeader">本轮单词类型</span>
              <el-select
                v-model="wordsTypeSelected"
                multiple
                placeholder="请选择"
              >
                <el-option
                  v-for="item in wordsTypeOpts"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                >
                </el-option>
              </el-select>
            </el-card>
          </el-col>
          <!-- 第二列：单词复习个数 -->
          <el-col :span="10">
            <el-card class="cardSlider" shadow="hover">
              <span class="cardHeader">复习 {{ wordsRequestNumber }} 个</span>
              <el-slider
                v-model="wordsRequestNumber"
                :min="1"
                :max="wordsTotalNumber"
              >
              </el-slider>
            </el-card>
          </el-col>
          <!-- 第三列：单词顺序 -->
          <el-col :span="6">
            <el-card shadow="hover">
              <span class="cardHeader">从单词本挑选顺序</span>
              <div class="switchOuter">
                <i
                  :class="{ highlightIcon: !isRandomPick }"
                  class="fa fa-list"
                ></i>&nbsp;
                <el-switch
                  v-model="isRandomPick"
                  active-text="随机"
                  inactive-text="顺序"
                >
                </el-switch>
                <i
                  :class="{ highlightIcon: isRandomPick }"
                  class="fa fa-random"
                ></i>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </div>
      <!-- 中部-【开始复习】按钮 -->
      <div class="bottom">
        <div
          class="startBtn"
          :class="{ startBtnDisabled: startBtnDisabled }"
          @click="startReview"
        >
          开始复习
        </div>
      </div>
      <!-- 底部-复习步骤条 -->
      <div>
        <el-steps :active="stepActive" align-center>
          <el-step title="设置加载中" :description="steps1Desc"></el-step>
          <el-step title="复习单词请求中" :description="steps2Desc"></el-step>
          <el-step title="复习单词组装中" :description="steps3Desc"></el-step>
          <el-step title="就绪" :description="steps4Desc"></el-step>
        </el-steps>
      </div>
    </div>
    <!-- reviewArea组件 -->
    <div class="reviewArea">
      <DoReview
        v-if="showingReviewProcess"
        :reviewWords="reviewWords"
        @returnReviewSettingEvent="returnReviewSetting"
      />
    </div>
  </div>
</template>

<script>
import { ElNotification, ElMessage } from "element-plus";
import request from "../../../api/request";
import Cookies from "js-cookie";
import DoReview from "../wordsReview/DoReview.vue";

export default {
  name: "WordsReview",
  components: {
    DoReview,
  },
  data() {
    return {
      wordsTypeSelected: [0, 1], // 单词选中类型：未标记的/标记的
      wordsTypeOpts: [
        { value: 1, label: "标记的" },
        { value: 0, label: "未标记的" },
      ],
      wordsRequestNumber: -1, // 单词复习个数
      wordsTotalNumber: 100, // 单词总个数
      isRandomPick: true, // 是随机还是顺序
      startBtnDisabled: false, // 【开始按钮】能否点击
      stepActive: 0, // 当前激活步骤
      loadedWords: [], // 加载成功的复习单词
      reviewWords: [], // 需要复习的单词
      showingReviewProcess: false // 是否展示复习单词组件
    };
  },
  methods: {
    // 加载单词总个数
    loadWordsNumber() {
      // 获取数据库单词总个数  
      request(`/words/number`, "POST", {
        username: Cookies.get("username"),
        token: Cookies.get("token")
      }).then(res => {
        this.wordsTotalNumber = res.words_number;
      });
    },
    // 【开始复习】按钮 - 点击事件
    async startReview() {
      if (this.startBtnDisabled) return;

      if (this.wordsTotalNumber < 4) {
        ElMessage.error("单词总数少于4个，无法复习");
        return;
      }

      if (this.wordsRequestNumber < 4) {
        ElMessage.error("至少4个起做噢");
        return;
      }

      if (!this.wordsTypeSelected.length) {
        ElMessage.error("单词类型一个都不选吗");
        return;
      }

      if (this.wordsRequestNumber <= this.wordsTotalNumber && this.wordsRequestNumber) {
        this.stepActive = 1;
        this.startBtnDisabled = true;
      } else {
        ElMessage.error("ha~what");
        return;
      }

      // 请求复习单词的接口
      await request("/words/review", "POST", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        number: this.wordsRequestNumber,
        type: JSON.stringify(Object.values(this.wordsTypeSelected)),
        random: this.isRandomPick ? "1" : "0", // 1代表随机，0代表顺序
      }).then(res => {
        if (res.flag) { // 成功
          this.loadedWords = res.words;
          this.stepActive = 2;
        } else { // 失败
          ElNotification({
            title: "失败",
            message: "服务器出现问题",
            type: "error",
            duration: 2000,
          });

          this.startBtnDisabled = false;
          this.stepActive = 0;
        }
      });

      if (!this.loadedWords.length || this.loadedWords.length < 4) {
        ElNotification({
          title: "失败",
          message: "单词过少无法进行复习",
          type: "error",
          duration: 2000,
        });

        this.startBtnDisabled = false;
        this.stepActive = 0;

        return;
      }

      let explanations = this.loadedWords.map(item => item.explanation);  // 组成解释集合
      let wordsLen = this.loadedWords.length;
      let index = 0;

      this.loadedWords.forEach(res => {
        let random_opts_index = [];   // 用于存储抽取的随机单词下标
        while (true) {
          for (let i = 0; i < 3; i++)   // 随机挑选3个下标
            random_opts_index.push(Math.floor(Math.random() * wordsLen));

          let flag = random_opts_index.find(item => item === index) === undefined;  // 检测是否本轮单词下标在其中
          let tmp = new Set(random_opts_index);   // 检测是否抽取到重复单词

          if (tmp.size === 3 && flag) break;  // 达成随机3个不重复、不包含自身，退出while

          random_opts_index = [];   // 清空，再来随机挑选一遍
        }

        random_opts_index.push(index);
        random_opts_index.sort(() => 0.5 - Math.random());  // 打乱4个下标位置

        // 组装复习单词
        this.reviewWords.push({
          word: res.word,
          mark: res.mark,
          pronunciation: res.pronunciation,
          sentence: res.sentence,
          options: random_opts_index.map(item => explanations[item]),
          ans: random_opts_index.findIndex(item => item === index),
          index: index,
          done: -1,
          doneRes: false,
          reveal: false,
        });

        index++;
      });

      this.stepActive = 3;
      this.stepActive = 4;
      this.showingReviewProcess = true;
    },
    // 返回到单词复习页面
    returnReviewSetting() {
      this.showingReviewProcess = false;
      this.reviewWords = [];
      this.loadedWords = [];
      this.stepActive = 0;
      this.startBtnDisabled = false;
    }
  },
  computed: { // 进度条的描述文案
    steps1Desc() {
      return "";
    },
    steps2Desc() {
      return `${this.wordsRequestNumber} 个单词正在加载...`;
    },
    steps3Desc() {
      return `本轮 ${this.wordsRequestNumber} 个单词已到位，
        正在${ this.isRandomPick ? "乱序" : "顺序"}排队`;
    },
    steps4Desc() {
      return "祝好运！";
    },
  },
  created() {
    this.loadWordsNumber();
  }
};
</script>

<style scoped>
.container {
  width: 70%;
  min-width: 1070px;
  margin: 80px auto;
  background-color: #fff;
  height: 220px;
}

.top {
  height: 60px;
  min-height: 60px;
  display: flex;
  align-items: center;
  color: rgb(104, 193, 189);
  font-size: 18px;
  background-color: #545c64;
  text-indent: 20px;
}

.options {
  left: 5%;
  margin: 20px 0;
  padding-left: 20px;
}

.el-col {
  display: flex;
  justify-content: center;
  align-items: center;
  min-width: 240px;
}

.el-card {
  min-height: 120px;
}

.el-select {
  width: 220px;
  margin-top: 20px;
}

.cardSlider {
  width: 500px;
}

.el-slider {
  width: 100%;
  margin-top: 20px;
}

.switchOuter {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.el-switch {
  width: 120px;
}

.cardHeader {
  color: #666;
}

.highlightIcon {
  color: rgb(64, 158, 255);
}

.startBtn {
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

.startBtn:hover {
  background-color: rgb(34, 174, 144);
}

.startBtnDisabled {
  cursor: not-allowed;
  background-color: #8c939d;
}

.startBtnDisabled:hover {
  background-color: #8c939d;
}

.bottom {
  display: flex;
  justify-content: center;
  margin: 200px 0;
}

.reviewArea {
  width: 80%;
  min-width: 830px;
  margin: 0 auto;
  transform: translateY(2%);
}
</style>