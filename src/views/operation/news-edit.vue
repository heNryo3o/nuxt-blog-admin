<template>
  <div>
    <el-form ref="postForm" :model="postForm" :rules="rules" class="form-container">
      <sticky>
      <div class="news-header">
        <el-button v-loading="loading" class="save-button" type="warning" @click="submitForm">
          保存
        </el-button>
        <el-button v-loading="loading" class="save-button" type="success" @click="submitForm">
          发布
        </el-button>
      </div></sticky>
      <div class="news-edit-container">
        <el-row>
          <el-col :span="24">
            <el-form-item style="margin-bottom: 40px;width: 70%;" prop="title">
              <MDinput v-model="postForm.title" :maxlength="100" name="name" required>
                新闻标题
              </MDinput>
            </el-form-item>

            <div class="postInfo-container">
              <el-row>
                <el-col :span="8">
                  <el-form-item label-width="60px" label="发布者:" class="postInfo-container-item">
                    <el-select v-model="postForm.author" :remote-method="getRemoteUserList" filterable
                      default-first-option remote placeholder="Search user">
                      <el-option v-for="(item,index) in userListOptions" :key="item+index" :label="item" :value="item" />
                    </el-select>
                  </el-form-item>
                </el-col>

                <el-col :span="10">
                  <el-form-item label-width="120px" label="发布时间:" class="postInfo-container-item">
                    <el-date-picker v-model="displayTime" type="datetime" format="yyyy-MM-dd HH:mm:ss" placeholder="Select date and time" />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-col>
        </el-row>

        <el-form-item prop="content" style="margin-bottom: 30px;">
          <Tinymce ref="editor" v-model="postForm.content" :height="500" />
        </el-form-item>

      </div>
    </el-form>
  </div>
</template>

<script>
  import Sticky from '@/components/Sticky' // 粘性header组件
  import MDinput from '@/components/MDinput'
  import Tinymce from '@/components/Tinymce'

  const defaultForm = {
    status: 'draft',
    title: '', // 文章题目
    content: '', // 文章内容
    content_short: '', // 文章摘要
    source_uri: '', // 文章外链
    image_uri: '', // 文章图片
    display_time: undefined, // 前台展示时间
    id: undefined,
    platforms: ['a-platform'],
    comment_disabled: false,
    importance: 0
  }

  export default {
    name: 'NewsEdit',
    components: {
      Sticky,MDinput,Tinymce
    },
    data() {
      const validateRequire = (rule, value, callback) => {
        if (value === '') {
          this.$message({
            message: rule.field + '为必传项',
            type: 'error'
          })
          callback(new Error(rule.field + '为必传项'))
        } else {
          callback()
        }
      }
      const validateSourceUri = (rule, value, callback) => {
        if (value) {
          if (validURL(value)) {
            callback()
          } else {
            this.$message({
              message: '外链url填写不正确',
              type: 'error'
            })
            callback(new Error('外链url填写不正确'))
          }
        } else {
          callback()
        }
      }
      return {
        postForm: Object.assign({}, defaultForm),
        loading: false,
        userListOptions: [],
        rules: {
          image_uri: [{ validator: validateRequire }],
          title: [{ validator: validateRequire }],
          content: [{ validator: validateRequire }],
          source_uri: [{ validator: validateSourceUri, trigger: 'blur' }]
        },
        tempRoute: {}
      }
    },
    methods: {

    },
  }
</script>

<style>
  .news-header {
    width: 100%;
    height: 50px;
    line-height: 50px;
    text-align: right;
    padding-right: 40px;
    background: linear-gradient(90deg, #20b6f9, #20b6f9 0, #2178f1 100%, #2178f1 0);
  }

  .save-button {
    margin-left: 10px;
  }

  .news-edit-container{
      padding: 10px 45px 20px 50px;
  }
</style>
