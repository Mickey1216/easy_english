<template>
  <div>
    <!-- 顶部按钮区  -->
    <div class="myWordsTop">
      <div class="myWordsTopCell1">
        <!-- 【选择多个】/【取消选择】 -->
        <el-button @click="selectWords" type="primary" plain>{{
          selectBtnText
        }}</el-button>
        <!-- 【删除选择】 -->
        <el-button
          @click="deleteSelectedWords"
          :disabled="noWordsSelected"
          type="danger"
          plain
        >
          <el-icon class="el-icon--right"
            ><i class="fa fa-trash-o"></i
          ></el-icon>
          &nbsp;删除选择
        </el-button>
      </div>
      <div class="myWordsTopCell2">
        <!-- 【遮住释义】/【让我看看】  -->
        <el-button @click="blurExplanations" plain class="blurBtn">
          <el-icon class="el-icon--right"
            ><i class="fa" :class="isBlurred ? 'fa-eye' : 'fa-eye-slash'"></i
          ></el-icon>
          &nbsp; {{ blurExplanationsText }}
        </el-button>
      </div>
      <!-- 添加单词组件 -->
      <FixedFuncArea @addWordEvent="addWord" />
      <!-- 头像展示 -->
      <div class="myWordsTopCell3">
        <el-upload
          class="avatar-uploader"
          action="/api/user/upload/avatar"
          :data="uploadCredential"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :on-error="handleAvatarFailed"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="avatarUrl" :src="avatarUrl" class="avatar" />
          <el-icon class="avatar-uploader-icon"
            ><i class="fa fa-plus"></i
          ></el-icon>
        </el-upload>
      </div>
    </div>

    <!-- 单词展示区 -->
    <div
      class="myWordsView"
      v-loading="wordsDataLoading"
      element-loading-text="单词加载中..."
    >
      <div class="myWordsList">
        <el-table
          :data="words"
          @selection-change="handleSelectionChange"
          ref="wordsList"
          :cell-class-name="tableRowClassName"
        >
          <el-table-column v-if="isSelected" type="selection" width="40" />
          <el-table-column fixed="left" label="单词" width="150">
            <template #default="scope">
              <el-popover
                effect="light"
                trigger="hover"
                placement="top"
                width="auto"
              >
                <template #default>
                  <div style="text-align: center">
                    {{ scope.row.note === "" ? "无备注" : scope.row.note }}
                  </div>
                </template>
                <template #reference>
                  <el-tag @click="speakWord(scope.row.word)">{{
                    scope.row.word
                  }}</el-tag>
                </template>
              </el-popover>
            </template>
          </el-table-column>
          <el-table-column prop="pronunciation" label="音标" width="200" />
          <el-table-column
            :prop="isBlurred ? 'blur' : 'explanation'"
            label="释义"
            width="400"
          />
          <el-table-column prop="sentence" label="例子" width="600" />
          <el-table-column prop="note" label="备注" width="400" />
          <el-table-column fixed="right" label="操作" width="220">
            <template #default="scope">
              <el-button
                size="small"
                circle
                @click="handleMark(scope.row.word, scope.row.mark)"
                class="markBtn"
                :class="
                  scope.row.mark === '0' ? 'markBtnMark' : 'markBtnMarked'
                "
              >
                <i
                  class="fa"
                  :class="scope.row.mark === '0' ? 'fa-star-o' : 'fa-star'"
                ></i>
              </el-button>
              <el-button size="small" @click="handleEdit(scope.row)"
                >修改</el-button
              >
              <el-button
                size="small"
                type="danger"
                @click="handleDelete(scope.row.word)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>

    <!-- 播放单词发音 -->
    <audio :src="pronunciationSrc" autoplay @ended="speakEnded">
      对不起，您的浏览器版本无法使用音频！
    </audio>

    <!-- 添加单词/修改单词 -->
    <WordDialog
      :isAdd="isAdd"
      :visibility="dialogVisibility"
      :wordUpdateLoadind="wordUpdateLoading"
      :row="row"
      :fill_row="fill_row"
      @confirmEditionEvent="confirmEdition"
      @confirmAdditionEvent="confirmAddition"
      @closeDialogEvent="closeDialog"
      @autoFillWordEvent="autoFillWord"
    />

    <!-- 分页 -->
    <el-pagination
      :page-size="limit"
      :pager-count="11"
      layout="prev, pager, next, jumper"
      :total="totalWordsLength"
      @current-change="handleCurrentChange"
    >
    </el-pagination>
  </div>
</template>

<script>
import Cookies from "js-cookie";
import request from "../../../api/request";
import WordDialog from "./WordDialog";
import FixedFuncArea from "./FixedFuncArea";
import { ElNotification, ElMessage } from "element-plus";
import "../../../assets/futura-medium.css";

export default {
  name: "MyWords",
  components: {
    FixedFuncArea,
    WordDialog
  },
  props: ["avatarUrl"],
  data() {
    return {
      wordsDataLoading: false, // 单词加载loading
      dialogVisibility: false, // 对话框是否可见
      wordUpdateLoading: false, // 单词更新loading
      words: [], // 单词列表
      row: {}, // 当前单词对象
      fill_row: {}, //  单词其他信息填充对象
      isAdd: true, // 用于判断是添加单词还是修改单词，默认添加
      offset: 0, // 单词偏移量
      limit: -1, // 一页展示多少个单词
      totalWordsLength: -1, // 单词总共个数
      isSelected: false, // 单词是否被选中
      selectBtnText: "选择多个",
      selectedWords: [], // 选中单词列表
      blurExplanationsText: "遮住释义",
      isBlurred: false, // 单词是否被遮住
      blurText: "***", // 单词被遮住后展示的文字
      pronunciationSrc: null, // 单词发音来源地
      isMarkedOnly: false, // 单词是否被标记
    };
  },
  methods: {
    // 上传文件之前的钩子，参数为上传的文件
    beforeAvatarUpload(file) {
      const isJPG = file.type === "image/jpeg" || file.type === "image/png"; // 图片类型为jpeg或png
      const isLt2M = file.size / 1024 / 1024 < 2; // 大小限制在2MB内

      if (!isJPG) {
        ElMessage.error("头像图片格式有误");
      }

      if (!isLt2M) {
        ElMessage.error("头像图片大小不能超过2MB");
      }

      return isJPG && isLt2M;
    },
    // 文件上传成功时的钩子
    handleAvatarSuccess(res, file) {
      // 自定义事件：更改头像，新头像地址：URL.createObjectURL(file.raw)
      this.$emit("avatarUrlChanged", URL.createObjectURL(file.raw));
    },
    // 文件上传失败时的钩子
    handleAvatarFailed(err, file) {
      ElMessage.error("新头像更新失败");
    },
    // 获取单词发音来源
    speakWord(word) {
      this.pronunciationSrc = `
        /youdao/dictvoice?type=${Cookies.get(
          "wordsConfigPronunciation"
        )}&audio=${word}`;
    },
    // ended 事件在音频/视频(audio/video)播放完成后触发。该事件通常用于提示播放完成的信息，例如 "谢谢收听", "谢谢观看" 等。
    speakEnded() {
      this.pronunciationSrc = null;
    },
    // 【修改】按钮 - 点击事件
    handleEdit(row) {
      this.isAdd = false;
      this.row = row;
      this.dialogVisibility = true;
    },
    // 【删除】按钮- 点击事件：删除单个单词
    handleDelete(word) {
      // 初始化待删除数组
      let words = new Array({ word });
      // 删除单个单词的接口
      request("/words/del", "DELETE", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        words: JSON.stringify(words),
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "单词删除成功",
            type: "success",
            duration: 2000,
          });

          this.loadWords(this.offset, this.limit);
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
    // 处理单词标记 - 点击事件
    handleMark(word, mark) {
      let newMarkSymbol = mark === "0" ? "1" : "0";
      // 修改单词标记字段的接口
      request("/words/mark", "PATCH", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        word,
        mark: newMarkSymbol,
      }).then(res => {
        if (res.flag) {
          // 成功
          ElNotification({
            title: "成功",
            message: "单词标记操作",
            type: "success",
            duration: 2000,
          });
          
          this.words.find(row => {
            return row.word === word;
          }).mark = newMarkSymbol;
        } else {
          // 失败
          ElNotification({
            title: "失败",
            message: "服务器出现问题",
            type: "error",
            duration: 2000,
          });
        }
      });
    },
    // 向数据库修改单词信息
    confirmEdition(word, pronunciation, explanation, sentence, note) {
      this.wordUpdateLoading = true;
      // 判断单词是否有修改，若没有修改，则不需要向数据库发送修改信息
      if (
        this.row.word === word &&
        this.row.pronunciation === pronunciation &&
        this.row.explanation === explanation &&
        this.row.sentence === sentence &&
        this.row.note === note
      )
        return;
      // 修改单词信息的接口
      request("/words/update", "PUT", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        word,
        pronunciation,
        explanation,
        sentence,
        note,
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "单词已更新",
            type: "success",
            duration: 2000,
          });

          // 本地直接将修改后的单词展示在table上，而不用再次请求数据
          let targetRow = this.words.find(row => {
            return row.word === word;
          });
          targetRow.pronunciation = pronunciation;
          targetRow.explanation = explanation;
          targetRow.sentence = sentence;
          targetRow.note = note;

          this.wordUpdateLoading = false;
          this.closeDialog();
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
    // 【+】按钮 - 点击事件
    addWord() {
      this.isAdd = true;
      this.dialogVisibility = true;
    },
    // 向数据库添加单词
    confirmAddition(word, pronunciation, explanation, sentence, note) {
      // 添加单词时，默认是没有标记的
      let mark = "0";
      // 添加单词的接口
      request("/words/add", "POST", {
        username: Cookies.get("username"),
        token: Cookies.get("token"),
        word,
        pronunciation,
        explanation,
        sentence,
        note,
        mark,
      }).then(res => {
        if (res.flag) { // 成功
          ElNotification({
            title: "成功",
            message: "单词已添加",
            type: "success",
            duration: 2000,
          });

          if (Cookies.get("wordsConfigMarkedOnly") === "0") { // 此时说明只显示标记的单词
            this.totalWordsLength++;
            if (this.words.length < this.limit) { // 说明还只在一页且没有满
              this.words.push({
                word,
                pronunciation,
                explanation,
                sentence,
                note,
                mark
              });
            }
          }

          this.wordUpdateLoading = false;
          this.closeDialog();
        } else { // 失败
          ElNotification({
            title: "失败",
            message: res.msg === "the word exists" ? "单词已存在" : "服务器出现问题",
            type: res.msg === "the word exists" ? "warning" : "error",
            duration: 2000,
          });
        }
      });
    },
    // 关闭对话框
    closeDialog() {
      this.dialogVisibility = false;
      this.isAdd = true;
    },
    // 在添加单词对话框，只需填写单词，其余信息可以自动填充
    autoFillWord(word) {
      // 获取有道接口的单词信息
      request("/youdao/jsonapi", "POST", { q: word }).then(res => {
        if (res.input === word && res.ec !== undefined) { // 单词填充成功
          let word = res.ec.word[0];
          let row_word = "";
          let row_note = "";

          word.trs
            .map(tr_ => tr_.tr[0].l.i[0])
            .forEach(item => {
              row_word += item.indexOf("人名") !== -1 ? "" : "   " + item;
            });

          if (word.wfs !== undefined) {
            word.wfs
              .map((wf_) => wf_.wf)
              .forEach((item) => {
                row_note += item.name + ":" + item.value + "    ";
              });
            this.fill_row.note = row_note.trimLeft();
          }

          this.fill_row.pronunciation =
            Cookies.get("wordsConfigPronunciation") === "0"
              ? word.usphone
              : word.ukphone;
          this.fill_row.explanation = row_word.trimLeft();
        } else { // 单词填充失败
          ElNotification({
            title: "填充失败",
            message: "注意查看单词是否拼写正确！",
            type: "warning",
            duration: 2000,
          });
        }
      });
    },
    // 加载单词
    loadWords(offset, limit) {
      this.wordsDataLoading = true;
      // 获取数据库单词的接口
      request(
        `/words?offset=${offset}&limit=${limit}&markOnly=${Cookies.get(
          "wordsConfigMarkedOnly"
        )}`,
        "POST",
        { username: Cookies.get("username"), token: Cookies.get("token") }
        ).then(res => {
          if (!res.flag){ // 用户未登录
            this.$router.push("/");
          }else{
            res.words.forEach(row => {
              row["blur"] = this.blurText;
          });

          this.words = res.words;
          this.totalWordsLength = res.total_words_len;
          this.wordsDataLoading = false;
        }
      });
    },
    // current-page 改变时触发
    handleCurrentChange(currentPage) {
      this.wordsDataLoading = true;
      this.offset = (currentPage - 1) * this.limit;
      this.loadWords(this.offset, this.limit);
    },
    // 【选择多个】/【取消选择】 - 点击事件
    selectWords() {
      if (this.isSelected) {
        this.selectBtnText = "选择多个";
        this.isSelected = false;
        // clearSelection()：用于多选表格，清空用户的选择
        this.$refs["wordsList"].clearSelection();
      } else { 
        this.selectBtnText = "取消选择";
        this.isSelected = true;
      }
    },
    // 删除多个选中的单词
    deleteSelectedWords() {
      if (this.selectedWords.length) {
        // 向数据库删除选中的单词的接口
        request("/words/del", "DELETE", {
          username: Cookies.get("username"),
          token: Cookies.get("token"),
          words: JSON.stringify(this.selectedWords),
        }).then(res => {
          if (res.flag) { // 成功
            ElNotification({
              title: "成功",
              message: "单词已批量删除",
              type: "success",
              duration: 2000,
            });

            this.loadWords(this.offset, this.limit);
          } else { // 失败
            ElNotification({
              title: "失败",
              message: "服务器出现问题",
              type: "error",
              duration: 2000,
            });
          }
        });
      }
    },
    // 当选择项发生变化时会触发该事件
    handleSelectionChange(selectedRows) {
      this.selectedWords = selectedRows;
    },
    // 【遮住释义】/【让我看看】 - 点击事件
    blurExplanations() {
      if (this.isBlurred) {
        this.isBlurred = false;
        this.blurExplanationsText = "遮住释义";
      } else {
        this.isBlurred = true;
        this.blurExplanationsText = "让我看看";
      }
    },
    // 单元格的 className 的回调方法，也可以使用字符串为所有单元格设置一个固定的 className。
    tableRowClassName({ row, column, rowIndex, columnIndex }) {
      if (row.mark === "1") {
        return "markRowClass";
      }
      return "";
    },
  },
  computed: {
    // 没有单词被选中时，【删除选择】禁止点击
    noWordsSelected() {
      return this.selectedWords.length === 0;
    },
    // 上传新头像之前先获得cookie中的用户身份信息
    uploadCredential() {
      return { username: Cookies.get("username"), token: Cookies.get("token") };
    },
  },
  created() {
    this.limit = parseInt(Cookies.get("wordsConfigLimit"));
    this.loadWords(0, this.limit);
  }
};
</script>

<style scoped>
.myWordsTop {
  width: 90%;
  margin: 20px auto;
  display: flex;
}

.myWordsTop > div {
  display: flex;
  align-items: flex-end;
}

.myWordsTopCell1 {
  width: 360px;
  min-width: 220px;
}
.myWordsTopCell2 {
  width: 400px;
  min-width: 120px;
}

.myWordsTopCell3 {
  flex: 1;
  justify-content: right;
  padding-right: 40px;
}

.myWordsView {
  height: 100%;
}

.myWordsList {
  margin-top: 10px;
}

.el-table {
  width: 90%;
  left: 5%;
  font-size: 18px;
  font-family: "futura-Medium";
  min-width: 730px;
}

.el-table >>> .markRowClass {
  background-color: rgb(240, 249, 235);
}

.el-tag {
  font-size: 16px;
}

.el-pagination {
  display: flex;
  justify-content: center;
  margin-top: 30px;
}

.markBtnMark {
  background-color: #fff;
  border: 1px solid #999;
  color: #333;
}

.markBtnMark:hover {
  background-color: rgba(104, 193, 189, 0.1);
  border: 1px solid rgb(104, 193, 189);
  color: rgb(104, 193, 189);
}

.markBtnMarked {
  background-color: rgba(104, 193, 189, 0.2);
  border: 1px solid rgb(104, 193, 189);
  color: rgb(104, 193, 189);
}

.markedOnlyBtn {
  border: 1px solid rgb(104, 193, 189);
  color: rgb(104, 193, 189);
}

.markedOnlyBtn:hover {
  background-color: rgba(104, 193, 189, 0.1);
}

.markedOnlyBtnActive {
  background-color: rgba(104, 193, 189, 0.4);
}

.avatar-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 78px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  width: 78px;
  height: 78px;
}
.avatar-uploader:hover {
  border-color: #409eff;
}
.el-icon.avatar-uploader-icon {
  color: #8c939d;
  text-align: center;
  width: 78px;
  height: 78px;
}
.avatar {
  width: 78px;
  height: 78px;
  display: block;
  border-radius: 78px;
}
</style>