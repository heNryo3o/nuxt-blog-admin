<template>
  <div class="app-container">
    <div class="filter-container">
      <el-input v-model="listQuery.describe" prefix-icon="el-icon-search" placeholder="输入模版描述搜索" class="filter-item"
        @keyup.enter.native="handleFilter" />
      <el-select v-model="listQuery.module" placeholder="模块" clearable class="filter-item">
        <el-option v-for="item in moduleOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.status" placeholder="模版状态" clearable class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.push_type" placeholder="推送类型" clearable class="filter-item">
        <el-option v-for="item in pushTypeOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
        搜索
      </el-button>
      <el-button v-waves style="margin-left: 10px;" type="success" icon="el-icon-edit" v-permission="['role/edit-role']"
        @click="handleCreate">
        新增模版
      </el-button>
    </div>
    <div class="left-container">
      <el-table v-loading="listLoading" :data="list" border fit highlight-current-row style="width: 100%;">
        <el-table-column label="模版名称" prop="type" width="180px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.type }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模版描述" width="320px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.describe }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模块" width="120px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.module }}</span>
          </template>
        </el-table-column>
        <el-table-column label="推送类型" width="250px" align="center">
          <template slot-scope="{row}">
            <el-tag type="success" size="small" v-if="row.type_app_buyer == 1"><span>需方APP</span></el-tag>
            <el-tag type="success" size="small" v-if="row.type_app_seller == 1"><span>供方APP</span></el-tag>
            <el-tag type="success" size="small" v-if="row.type_wechat == 1"><span>微信</span></el-tag>
            <el-tag type="success" size="small" v-if="row.type_sms == 1"><span>短信</span></el-tag>
          </template>
        </el-table-column>
        <el-table-column label="需要参数" width="180px" align="center">
          <template slot-scope="{row}">
            <span>{{ row.param }}</span>
          </template>
        </el-table-column>
        <el-table-column label="模版状态" width="160px" align="center">
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
            <el-button v-waves type="primary" size="mini" v-permission="['role/edit-role']" @click="handleUpdate(row)">
              编辑
            </el-button>
            <el-button v-waves v-if="row.status == 1" size="mini" v-permission="['role/change-status']" type="warning"
              @click="handleChangeStatus(row,2)">
              禁用
            </el-button>
            <el-button v-waves v-else size="mini" type="success" v-permission="['role/change-status']" @click="handleChangeStatus(row,1)">
              启用
            </el-button>
            <el-button v-waves size="mini" type="danger" v-permission="['role/delete-role']" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 新增/编辑模版弹框 -->
    <el-dialog :title="textMap[dialogStatus]" width="700px" :visible.sync="dialogFormVisible">

      <el-form ref="dataForm" :model="temp" label-position="left" label-width="120px" style="width: 550px; margin-left:50px;">

        <el-form-item label="模版类型名" prop="type">
          <el-input v-model="temp.type" />
        </el-form-item>

        <el-form-item label="模版描述" prop="describe">
          <el-input v-model="temp.describe" />
        </el-form-item>

        <el-form-item label="所属模块" prop="module">
          <el-input v-model="temp.module" />
        </el-form-item>

        <el-form-item label="推送类型" prop="module">
          <el-checkbox-group v-model="temp.push_type" size="mini">
            <el-checkbox label="1">需方app</el-checkbox>
            <el-checkbox label="2">供方app</el-checkbox>
            <el-checkbox label="3">微信</el-checkbox>
            <el-checkbox label="4">短信</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="需要参数" prop="param">
          <el-input v-model="temp.param" />
        </el-form-item>

        <el-form-item label="是否发给管理员" prop="inside">
          <el-checkbox v-model="temp.inside">是</el-checkbox>
          <el-select v-if="temp.inside === true" v-model="temp.reciever" multiple placeholder="请选择管理员">
            <el-option v-for="item in adminOptions" :key="item.value" :label="item.label" :value="item.value">
            </el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="状态">
          <div>
            <el-radio v-model="temp.status" label="1" border size="medium">启用</el-radio>
            <el-radio v-model="temp.status" label="2" border size="medium">禁用</el-radio>
          </div>
        </el-form-item>

        <div v-for="item in temp.push_type">
          <div v-if="item==1">
            <el-divider>需方app模版</el-divider>
            <el-form-item label="推送内容">
              <div>
                <el-input type="textarea" autosize v-model="temp.app_buyer_template.content" />
              </div>
            </el-form-item>
          </div>

          <div v-if="item==2">
            <el-divider>供方app模版</el-divider>
            <el-form-item label="推送内容">
              <div>
                <el-input type="textarea" autosize v-model="temp.app_seller_template.content" />
              </div>
            </el-form-item>
          </div>

          <div v-if="item==3">
            <el-divider>微信公众号模版</el-divider>
            <el-form-item label="模版编号">
              <div>
                <el-input v-model="temp.wechat_template.template_id" />
              </div>
            </el-form-item>
            <el-form-item label="顶部文案">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.first" />
              </div>
            </el-form-item>
            <el-form-item label="关键词1">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.kw1" />
              </div>
            </el-form-item>
            <el-form-item label="关键词2">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.kw2" />
              </div>
            </el-form-item>
            <el-form-item label="关键词3">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.kw3" />
              </div>
            </el-form-item>
            <el-form-item label="关键词4">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.kw4" />
              </div>
            </el-form-item>
            <el-form-item label="底部文案">
              <div>
                <el-input type="textarea" autosize v-model="temp.wechat_template.remark" />
              </div>
            </el-form-item>
            <el-form-item label="推送链接">
              <div>
                <el-input v-model="temp.wechat_template.url" />
              </div>
            </el-form-item>
          </div>

          <div v-if="item==4">
            <el-divider>短信模版</el-divider>
            <el-form-item label="推送内容">
              <div>
                <el-input type="textarea" autosize v-model="temp.sms_template.content" />
              </div>
            </el-form-item>
            <el-form-item label="模版编号">
              <div>
                <el-input v-model="temp.sms_template.template_id" />
              </div>
            </el-form-item>
          </div>
        </div>

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
    getTemplateList,
    changeStatus,
    deleteTemplate,
    moduleOptions,
    editTemplate,
    adminOptions,
  } from '@/api/push'
  import waves from '@/directive/waves' // waves directive
  import permission from '@/directive/permission'
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
        statusOptions: [{
            name: '启用中',
            key: 1
          },
          {
            name: '已禁用',
            key: 2
          },
        ],
        adminOptions: [],
        pushTypeOptions: [{
            name: '需方app',
            key: 1
          },
          {
            name: '供方app',
            key: 2
          },
          {
            name: '微信',
            key: 3
          },
          {
            name: '短信',
            key: 4
          },
        ],
        dialogFormVisible: false,
        dialogStatus: '',
        moduleOptions: [],
        textMap: {
          update: '编辑模版',
          create: '新增模版'
        },
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          sort: '-id'
        },
        temp: {
          push_type: [],
          app_buyer_template: {},
          app_seller_template: {},
          wechat_template: {},
          sms_template: {}
        }
      }
    },
    created() {
      this.getList(),
        this.getModuleOptions(),
        this.getAdminOptions()
    },

    methods: {

      getList() {
        this.listLoading = true
        getTemplateList(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },

      getAdminOptions() {
        adminOptions().then(response => {
          this.adminOptions = response.data
        })
      },

      getModuleOptions() {
        moduleOptions().then(response => {
          this.moduleOptions = response.data
        })
      },

      handleFilter() {
        this.listQuery.page = 1
        this.getList()
      },

      handleCreate() {
        this.resetTemp()
        this.dialogStatus = 'create'
        this.dialogFormVisible = true
        this.$nextTick(() => {

        })
      },

      handleUpdate(row) {
        this.temp = Object.assign({}, row) // copy obj
        this.temp.status = this.temp.status == 1 ? '1' : '2'
        this.temp.inside = this.temp.inside == 1 ? true : false
        this.dialogStatus = 'update'
        this.dialogFormVisible = true
        this.$nextTick(() => {

        })
      },

      updateData() {
        this.temp.inside = this.temp.inside === true ? 1 : 2
        this.$refs['dataForm'].validate((valid) => {
          if (valid) {
            editTemplate(this.temp).then(response => {
              this.getList()
              this.getModuleOptions()
              this.dialogFormVisible = false
              this.$notify({
                title: '成功',
                message: '保存模版信息成功',
                type: 'success',
                duration: 2000
              })
            })
          }
        })
      },

      resetTemp() {
        this.temp = {
          status: '1',
          push_type: [],
          app_buyer_template: {},
          app_seller_template: {},
          wechat_template: {},
          sms_template: {}
        }
      },

      handleChangeStatus(row, status) {
        var message = status == 1 ? '模版启用成功' : '模版禁用成功'
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
      handleDelete(row) {
        this.$confirm('此操作将永久删除该模版, 是否继续?', '删除模版提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          deleteTemplate({
            id: row.id
          }).then(response => {
            this.$notify({
              title: '成功',
              message: '已成功删除模版',
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

  .permission-select {
    height: 150px;
  }

  .link-type {
    cursor: pointer;
  }
</style>
