<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.title" prefix-icon="el-icon-search" placeholder="输入新闻标题搜索" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.status" placeholder="新闻状态" clearable class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <router-link :to="'/operation/news-edit/0'">
        <el-button v-waves style="margin-left: 10px;" v-permission="['admin/edit-admin']" type="success" icon="el-icon-edit"
          @click="handleCreate">
          发布新闻
        </el-button>
      </router-link>
    </div>

    <el-table v-loading="listLoading" size="medium" sort-change="handleSortChange" :data="list" border fit
      highlight-current-row style="width: 100%;" @sort-change="sortChange">
      <el-table-column label="新闻标题" prop="username" width="350px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.title }}</span>
          <el-tag size="mini" v-if="row.sticky == 1">置顶</el-tag>
        </template>
      </el-table-column>

      <el-table-column label="分类名称" width="200px" align="center">
        <template slot-scope="{row}">
          {{ row.cate_name }}
        </template>
      </el-table-column>

      <el-table-column label="发布者" width="160px" align="center">
        <template slot-scope="{row}">
          {{ row.admin_name }}
        </template>
      </el-table-column>

      <el-table-column label="发布时间" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.created_at }}</span>
        </template>
      </el-table-column>

      <el-table-column label="浏览次数" width="180px" align="center">
        <template slot-scope="{row}">
          <span>{{ row.hits }}</span>
        </template>
      </el-table-column>

      <el-table-column label="当前状态" width="140px" align="center">
        <template slot-scope="{row}">
          <div v-if="row.status == 1">
            <el-tag><span>启用中</span></el-tag>
          </div>
          <div v-else>
            <el-tag type="danger"><span>已禁用</span></el-tag>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="350px" class-name="small-padding fixed-width">
        <template slot-scope="{row}">
          <el-button v-waves type="primary" size="mini" v-permission="['admin/edit-admin']" @click="handleUpdate(row)">
            编辑
          </el-button>
          <el-button v-if="row.sticky==1" v-waves size="mini" type="success" v-permission="['admin/set-permission']"
            @click="handleSetSticky(row,2)">
            取消置顶
          </el-button>
          <el-button v-else v-waves size="mini" type="success" v-permission="['admin/set-permission']" @click="handleSetSticky(row,1)">
            置顶
          </el-button>
          <el-button v-waves v-if="row.status == 1" size="mini" v-permission="['admin/change-status']" type="warning"
            @click="handleChangeStatus(row,2)">
            禁用
          </el-button>
          <el-button v-waves v-else size="mini" type="success" v-permission="['admin/change-status']" @click="handleChangeStatus(row,1)">
            启用
          </el-button>
          <el-button v-waves size="mini" type="danger" v-permission="['admin/delete-admin']" @click="handleDelete(row)">
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
    <!-- 编辑 新增管理员 -->
    <el-dialog :title="textMap[dialogStatus]" width="700px" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">

        <el-form-item label="真实姓名" prop="truename">
          <el-input v-model="temp.truename" />
        </el-form-item>

        <el-form-item label="花名" prop="username">
          <el-input v-model="temp.username" />
        </el-form-item>

        <el-form-item label="手机号码" prop="mobile">
          <el-input v-model="temp.mobile" maxlength="11" @keyup.native="number" />
        </el-form-item>

        <el-form-item v-if="temp.id == null" label="登录密码" prop="password">
          <el-input v-model="temp.password" maxlength="20" />
        </el-form-item>

        <el-form-item label="所在部门" prop="department">
          <el-input v-model="temp.department" maxlength="20" @keyup.native="number" />
        </el-form-item>

        <el-form-item label="状态">
          <div>
            <el-radio v-model="temp.status" label="1" border size="medium">在职</el-radio>
            <el-radio v-model="temp.status" label="2" border size="medium">离职</el-radio>
          </div>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import {
    getList,
    editNews,
    getNewsCateOptions,
    changeStatus,
    setSticky,
    deleteNews
  } from '@/api/news'
  import waves from '@/directive/waves' // waves directive
  import permission from '@/directive/permission' // permission directive
  import Pagination from '@/components/Pagination' // secondary package based on el-pagination

  export default {
    name: 'ComplexTable',
    components: {
      Pagination
    },
    directives: {
      waves,
      permission
    },
    data() {
      return {
        list: null,
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          sort: '-id'
        },
        newsCateOptions: [],
        statusOptions: [{
            name: '启用中',
            key: 1
          },
          {
            name: '已禁用',
            key: 2
          },
        ],
        temp: {},
        dialogFormVisible: false,
        dialogStatus: '',
        textMap: {
          update: '编辑新闻',
          create: '发布新闻'
        },
      }
    },
    created() {
      this.getList()
      this.getNewsCateOptions()
    },
    methods: {

      getNewsCateOptions() {
        getNewsCateOptions().then(response => {
          this.newsCateOptions = response.data
        })
      },

      getList() {
        this.listLoading = true
        getList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },
      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },
      resetTemp() {
        this.temp = {
          status: '1'
        }
      },
      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.temp.status = this.temp.status == 1 ? '1' : '2'
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {
          this.$refs['dataForm'].clearValidate()
        })
      },
      updateData() {
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            editNews(this.temp).then(response => {
              this.getList()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '保存新闻数据成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },

      handleChangeStatus(row, status) {
        var message = status == 1 ? '启用新闻成功' : '禁用新闻成功'
        changeStatus({
          id: row.id,
          status: status
        }).then(response => {
          this.$notify({
            title: '成功',
            message: message,
            type: 'success',
            duration: 2000
          })
          this.getList();
        })
      },

      handleSetSticky(row, status) {
        var message = status == 1 ? '置顶新闻成功' : '取消置顶新闻成功'
        setSticky({
          id: row.id,
          status: status
        }).then(response => {
          this.$notify({
            title: '成功',
            message: message,
            type: 'success',
            duration: 2000
          })
          this.getList();
        })
      },

      handleDelete(row) {
        this.$confirm('此操作将永久删除该新闻, 是否继续?', '删除新闻提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteNews({
            id: row.id
          }).then(response => {
            this.$notify({
              title: '成功',
              message: '已成功删除新闻',
              type: 'success',
              duration: 2000
            })
            this.getList();
          })
        }).catch(() => {

        });
      },
    }
  }
</script>

<style lang="scss">
  .filter-container {
    margin-bottom: 25px;
  }

  .filter-item {
    margin-right: 15px;
    width: 160px;
  }
</style>
