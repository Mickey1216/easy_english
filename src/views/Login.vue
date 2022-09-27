<template>
  <div class="loginView">
    <div class="container">
      <div class="opt">
        <div
          @click="loginActiveClicked"
          class="optItem active"
          :class="[loginActive ? 'active' : 'inactive']"
        >
          登&nbsp;录
        </div>
        <div
          @click="registerActiveClicked"
          class="optItem"
          :class="[loginActive ? 'inactive' : 'active']"
        >
          注&nbsp;册
        </div>
      </div>

      <!-- 登录   -->
      <div class="inputsLogin" v-show="loginActive">
        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-user-o"></i></span>
          <input
            type="text"
            v-model="loginUsernameText"
            ref="loginUsernameInput"
            placeholder="请输入用户名"
          />
        </div>

        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-key"></i></span>
          <input
            type="password"
            v-model="loginPasswordText"
            placeholder="请输入密码"
          />
        </div>

        <div class="inputsBtn" @click="loginBtnClicked">登录</div>
      </div>

      <!-- 注册   -->
      <div class="inputsRegister" v-show="!loginActive">
        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-user-o"></i></span>
          <input
            type="text"
            v-model="registerUsernameText"
            placeholder="请输入用户名"
          />
        </div>

        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-envelope-o"></i></span>
          <input
            type="text"
            v-model="registerEmailText"
            placeholder="请输入邮箱"
          />
        </div>

        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-key"></i></span>
          <input
            type="password"
            v-model="registerPasswordText"
            placeholder="请输入密码"
          />
        </div>

        <div class="inputsRow">
          <span class="inputsRowIcon"><i class="fa fa-key"></i></span>
          <input
            type="password"
            v-model="registerPasswordCText"
            placeholder="请再次输入密码"
          />
        </div>

        <div class="inputsBtn" @click="registerBtnClicked">注册</div>
      </div>

      <!-- 提示：根据登录和注册不同，进行提示 -->
      <div class="prompt">
        <el-alert
          :title="loginActive ? loginPrompt.title : registerPrompt.title"
          :type="loginActive ? loginPrompt.type : registerPrompt.type"
          :closable="false"
        />
      </div>
    </div>
  </div>

  <!-- 页脚 -->
  <div id="footer">
    <div>©2022&nbsp;&nbsp;Mickey创作</div>
  </div>
</template>

<script>
import request from "../api/request";
import { ElMessage } from "element-plus";
import Cookies from "js-cookie";

export default {
  name: "Login",
  data() {
    return {
      loginUsernameText: "", // 登录：用户名
      loginPasswordText: "", // 登录：密码

      registerUsernameText: "", // 注册：用户名
      registerEmailText: "", // 注册：邮箱
      registerPasswordText: "", // 注册：密码
      registerPasswordCText: "", // 注册：确认密码

      loginActive: true, // 默认是登录，而非注册

      // 提示：登录
      loginPrompt: {
        title: "每日英语，轻松学习！",
        type: "success",
      },
      // 提示：注册
      registerPrompt: {
        title: "要填写正确的邮箱哟~",
        type: "warning",
      },
    };
  },
  methods: {
    // 控制登录选项
    loginActiveClicked() {
      this.loginActive = true;
      // 清空输入框
      this.loginUsernameText = "";
      this.loginPasswordText = "";
    },
    // 控制注册选项
    registerActiveClicked() {
      this.loginActive = false;
    },
    // 【登录】按钮-点击事件
    loginBtnClicked() {
      let username = this.loginUsernameText.trim();
      let password = this.loginPasswordText.trim();

      // 判断用户名框是否输入正确
      if (username.length < 2 || username.length > 255 || !password.length) {
        this.loginPrompt.type = "error";
        this.loginPrompt.title = "账号或密码有误！";
        return;
      }

      // 用户登录接口
      request("/user/login", "POST", {
        username,
        password,
      }).then(res => { 
        if (!res.flag) { // 登录失败
          this.loginPrompt.type = "error";
          this.loginPrompt.title = "账号或密码有误！";
        } else { // 登录成功，将用户信息存入cookie
          Cookies.set("username", res.username, { expires: 14 });
          Cookies.set("token", res.token, { expires: 14 });

          this.$router.push("/home");
        }
      });
    },
    // 【注册】按钮-点击事件
    registerBtnClicked() {
      let username = this.registerUsernameText.trim();
      let email = this.registerEmailText.trim();
      let password = this.registerPasswordText.trim();
      let passwordC = this.registerPasswordCText.trim();
      // 验证邮箱的正则表达式
      let emailReg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;

      if (username === "") {
        this.registerPrompt.type = "error";
        this.registerPrompt.title = "怎么连用户名都不输入？";
        return;
      } else if (password === "") {
        this.registerPrompt.type = "error";
        this.registerPrompt.title = "一定要制定一个密码哟~";
        return;
      } else if (password !== passwordC) {
        this.registerPrompt.type = "error";
        this.registerPrompt.title = "两次密码不一致哦！";
        return;
      } else if (username.length < 2 || username.length > 255) {
        this.registerPrompt.type = "error";
        this.registerPrompt.title =
          username.length < 2 ? "用户名至少大于1位" : "用户名太长啦啦啦";
        return;
      } else if (!emailReg.test(email)) {
        this.registerPrompt.type = "error";
        this.registerPrompt.title = "请输入正确的邮箱地址啦";
        return;
      }

      // 用户注册接口
      request("/user/register", "POST", {
        username,
        email,
        password,
      }).then(res => {
        if (res.flag) { // 注册成功
          ElMessage({
            message: `一份激活邮件已发送至 ${email}，激活后完成注册 (Beta期间已自动激活，无需邮件)`,
            type: "success",
            duration: 6000,
          });

          this.registerUsernameText = "";
          this.registerEmailText = "";
          this.registerPasswordText = "";
          this.registerPasswordCText = "";

          // 将用户名添加进入用户配置表
          request("/config/add", "POST", { 
            username 
          }).then(res => {
              if (!res.flag) {
                alert("临时位置的配置生成有问题"); // 临时用一下
              }
            }
          );

          this.loginActive = true;
        } else { // 注册失败
          this.registerPrompt.type = "error";
          this.registerPrompt.title = "服务器出现了一些问题";
        }
      });
    },
  },
  mounted() {
    // 自动聚焦在登录时的用户名输入框
    this.$refs["loginUsernameInput"].focus();
  },
  created() { // 获取用户存放在cookie中的信息
    let username = Cookies.get("username");
    let token = Cookies.get("token");

    if (username !== undefined && token !== undefined) { // 用户信息保存在cookie中且没过期
      this.$router.push("/home");
    }

    // 绑定键盘事件
    document.onkeyup = (e) => {
      if (e.key === "Enter") { 
        if (this.loginActive) 
          this.loginBtnClicked();
        else 
          this.registerBtnClicked();
      }
    };
  },
};
</script>

<style scoped>
.loginView {
  height: 100%;
  background-color: rgb(214, 214, 250);
}

.container {
  position: absolute;
  left: 50%;
  top: 20%;
  transform: translate(-50%, 0);
  width: 420px;
  border-radius: 5px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  background-color: #fff;
  user-select: none;
}

.opt {
  width: 100%;
  display: flex;
  flex-direction: row;
}

.optItem {
  height: 50px;
  line-height: 50px;
  text-align: center;
  width: 100%;
  font-weight: bolder;
  background-color: #eee;
}

.active {
  background-color: #fff;
}

.inactive {
  background-color: #eee;
}

.inputsLogin,
.inputsRegister {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  margin-top: 20px;
}

.inputsRow {
  height: 50px;
  width: 80%;
  margin-top: 22px;
  display: flex;
}

.inputsRowIcon {
  height: 50px;
  width: 50px;
  min-width: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-right: 1px solid #ddd;
  background-color: #eee;
}

.inputsRowIcon i {
  font-size: 26px;
}

.inputsRow input {
  width: 100%;
  border: none;
  outline: none;
  text-indent: 16px;
  font-size: 18px;
  background-color: #eee;
  padding-top: 4px;
}

.inputsRowSuffix {
  height: 50px;
  background-color: #eee;
}

.inputsBtn {
  margin-top: 40px;
  height: 50px;
  line-height: 50px;
  width: 80%;
  text-align: center;
  font-weight: bolder;
  color: #fff;
  background-color: #8ec5fc;
  background-image: linear-gradient(62deg, #8ec5fc 0%, #e0c3fc 100%);
  border-radius: 8px;
  font-size: 18px;
  cursor: pointer;
}

.prompt {
  margin-top: 20px;
  user-select: text;
}

#footer {
  position: absolute;
  bottom: 0;
  height: 40px;
  width: 100%;
  line-height: 40px;
  text-align: center;
  color: #303133;
  background-color: rgb(241, 241, 241);
  font-size: 14px;
  display: flex;
  justify-content: center;
}

#footer div {
  margin: 0 40px;
}

#footer a {
  color: #303133;
  text-decoration: none;
}
</style>