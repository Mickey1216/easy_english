<template>
  <div class="homeView">
    <el-container>
      <!-- 侧边导航栏 -->
      <el-aside width="200px">
        <!-- beta版本图片展示 -->
        <div class="asideTop">
          <transition name="slide-fade">
            <img v-show="!isCollapse" src="../assets/beta.png" alt="beta版本"/>
          </transition>
        </div>
        <!-- 菜单 -->
        <el-menu
          active-text-color="#ffd04b"
          background-color="#545c64"
          default-active="1"
          text-color="#fff"
          :collapse="isCollapse"
        >
          <el-menu-item @click="changeCurrentOpt(1)" index="1">
            <el-icon><i class="fa fa-book"></i></el-icon>
            <span>我的单词</span>
          </el-menu-item>
          <el-menu-item @click="changeCurrentOpt(2)" index="2">
            <el-icon><i class="fa fa-pencil"></i></el-icon>
            <span>单词复习</span>
          </el-menu-item>
          <el-menu-item @click="changeCurrentOpt(3)" index="3">
            <el-icon><i class="fa fa-cog"></i></el-icon>
            <span>设置</span>
          </el-menu-item>
          <el-menu-item @click="logout" index="4">
            <el-icon><i class="fa fa-coffee"></i></el-icon>
            <span>登出</span>
          </el-menu-item>
        </el-menu>
      </el-aside>
      <!-- 中间展示区 -->
      <el-main>
        <!-- 我的单词 -->
        <MyWords
          :avatarUrl="avatarUrl"
          v-if="currentOpt === 1"
          @avatarUrlChanged="avatarUrlChanged"
        />
        <!-- 单词复习 -->
        <WordsReview v-if="currentOpt === 2" />
        <!-- 设置 -->
        <Setting v-if="currentOpt === 3" />
      </el-main>
    </el-container>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import request from "../api/request";
import { ElMessage } from "element-plus";
import MyWords from "../components/home/mywords/MyWords";
import WordsReview from "../components/home/wordsReview/WordsReview";
import Setting from "../components/home/setting/Setting";

export default {
  name: "Home",
  components: {
    MyWords,
    WordsReview,
    Setting,
  },
  data() {
    return {
      currentOpt: 0, // 当前侧边栏选中项
      isCollapse: false, // 侧边导航是否折叠
      timer: null, // 定时器
      avatarUrl: "", // 头像
    };
  },
  methods: {
    // 检查登录的状态
    checkLoginStatus() {
      let username = Cookies.get("username");
      let token = Cookies.get("token");

      if (username === undefined || token === undefined) {
        this.$router.push("/");
      }

      // 读取用户配置信息的接口
      request("/config/load", "POST", {
        username,
        token
      }).then(res => {
        if (res.flag) { // 成功
          ElMessage({
            message: "读取用户配置成功",
            type: "success",
            duration: 2000,
          });

          // 将用户配置存于cookie中
          Cookies.set(
            "wordsConfigLimit", 
            res.configs.page_size, 
            { expires: 14 }
          ); 
          Cookies.set(
            "wordsConfigPronunciation",
            res.configs.pronunciation_type,
            { expires: 14 }
          );
          Cookies.set(
            "wordsConfigMarkedOnly",
            res.configs.is_marked_only,
            { expires: 14 }
          );

          // 加载用户头像的接口
          request("/user/load/avatar", "POST", {
            username
          }).then(res => { 
            if (res.flag) { // 成功
              // atob() 方法用于解码使用 base-64 编码的字符串。
              let byteString = window.atob(res.avatarRaw);
              
              let ia = new Uint8Array(new ArrayBuffer(byteString.length));
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i); // charCodeAt()：返回指定位置的字符的 Unicode 编码
              }

              // URL.createObjectURL(blob)可以获取当前文件的一个内存URL
              this.avatarUrl = URL.createObjectURL(
                new Blob([ia], { type: "image/jpeg" })
              );
            }
          });

          this.currentOpt = 1;
        } else { // 失败
          ElMessage({
            message: "读取用户配置失败",
            type: "error",
            duration: 2000,
          });

          Cookies.remove("username");
          Cookies.remove("token");
          this.$router.push("/");
        }
      });
    },
    // 更改头像
    avatarUrlChanged(newUrl) {
      this.avatarUrl = newUrl;
      ElMessage.success("新头像已更新");
    },
    // 更改当前选中项
    changeCurrentOpt(opt) {
      this.currentOpt = opt;
    },
    // 【登出】- 点击事件
    logout() {
      // 关键：清除存于cookie中的token和username信息
      Cookies.remove("username");
      Cookies.remove("token");

      ElMessage({
        message: "已退出",
        type: "success",
        duration: 2000,
      });

      this.$router.push("/");
    },
    // 获取更新屏幕宽度后的值
    resize() {
      // 为什么要用定时器？ 减少检查页面大小的频率，从而避免频繁调用浪费性能。
      if (this.timer) clearTimeout(this.timer);

      this.timer = setTimeout(() => {
        this.isCollapse = document.body.clientWidth < 900;
      }, 10);
    }
  },
  created() {
    this.checkLoginStatus();
    // resize：调整窗口大小加载事件，只要窗口大小发生像素变化，就会触发这个事件；经常利用这个事件完成响应式布局。
    window.addEventListener("resize", this.resize);
  },
  beforeUnmount() { 
    window.removeEventListener("resize", this.resize);
  }
};
</script>

<style scoped>
.homeView,
.el-container {
  height: 100%;
}

.el-aside {
  height: 100%;
  width: 200px;
  background-color: #545c64;
}

.asideTop {
  margin: 20px 0;
  text-align: center;
}

.el-main {
  height: 100%;
  padding: 0;
  background-color: #f2f6fc;
}

/* 当宽度小于900px时，侧边导航只显示图标，不再显示文字 */
@media only screen and (max-width: 900px) {
  .el-aside {
    width: 63px;
    transition: width 0.5s;
  }
}
</style>