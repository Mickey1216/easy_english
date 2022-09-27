<template>
  <div class="settingView">
    <el-row>
      <el-col :span="24"
        ><div class="grid-content bg-purple-dark">单词偏好配置</div></el-col
      >
    </el-row>

    <el-row>
      <el-col :span="24">
        <div class="block">
          <span class="demonstration">单词每页显示数量</span>
          <el-slider
            :min="minLimit"
            :max="maxLimit"
            @change="wordLimitChange"
            width="300"
            v-model="wordLimit"
            show-input
          ></el-slider>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="10">
        <div class="block">
          <span class="demonstration">单词发音</span>
          <div class="pronType">
            <el-radio
              @change="pronChanged"
              v-model="pronunciationType"
              label="0"
              >美式</el-radio
            >
            <el-radio
              @change="pronChanged"
              v-model="pronunciationType"
              label="1"
              >英式</el-radio
            >
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row>
      <el-col :span="14">
        <div class="block">
          <span class="demonstration">单词显示类型</span>
          <div class="wordsDisplayType">
            <el-switch
              v-model="isMarkedOnly"
              active-text="只要标记的"
              inactive-text="全都要"
              @change="markedChanged"
            >
            </el-switch>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import request from "../../../api/request";
import { ElNotification } from "element-plus";

export default {
  name: "Setting",
  data() {
    return {
      wordLimit: -1, // 单词显示个数
      maxLimit: 30, // 每页单词最多显示个数
      minLimit: 1, // 每页单词最少显示个数
      pronunciationType: "-1", // 单词发音类型：英式、美式
      isMarkedOnly: false // 单词是否被标记过
    };
  },
  methods: {
    // 更改单词显示个数  
    wordLimitChange(limit) {
      request("/config/update/page_size", "PATCH", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        limit
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "设置已更新",
            type: "success",
            duration: 2000,
          });

          Cookies.set("wordsConfigLimit", limit, { expires: 14 });
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
    // 修改单词发音
    pronChanged(val) {
      request("/config/update/pronunciation_type", "PATCH", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        pronunciationType: val,
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "设置已更新",
            type: "success",
            duration: 2000,
          });

          Cookies.set("wordsConfigPronunciation", val, { expires: 14 });
          this.pronunciationType = val;
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
    // 修改单词显示类型
    markedChanged(val) {
      request("/config/update/is_marked_only", "PATCH", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        markedType: val ? "1" : "0",
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "设置已更新",
            type: "success",
            duration: 2000,
          });

          Cookies.set("wordsConfigMarkedOnly", val ? "1" : "0", { expires: 14 });
        } else {
          ElNotification({ // 失败
            title: "失败",
            message: "服务器出现问题",
            type: "error",
            duration: 2000,
          });
        }
      });
    }
  },
  created() {
    this.wordLimit = parseInt(Cookies.get("wordsConfigLimit"));
    this.pronunciationType = Cookies.get("wordsConfigPronunciation");
    this.isMarkedOnly = Cookies.get("wordsConfigMarkedOnly") === "1";
  },
};
</script>

<style scoped>
.settingView {
  border: 1px solid rgb(220, 223, 230);
  width: 60%;
  height: 800px;
  margin: 60px auto;
}

.grid-content {
  min-height: 36px;
  line-height: 36px;
  padding-left: 20px;
  color: #303133;
}

.bg-purple-dark {
  background: #99a9bf;
}

.block {
  display: flex;
  align-items: center;
}

.block .el-slider {
  margin-top: 0;
  margin-left: 12px;
}

.block .demonstration {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 48px;
  flex: 1;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.demonstration {
  flex: 1%;
  padding-left: 20px;
}

.block .el-slider {
  flex: 5;
}

.el-slider {
  margin-right: 10%;
}

.pronType,
.wordsDisplayType {
  flex: 2;
  white-space: nowrap;
  overflow: hidden;
}
</style>