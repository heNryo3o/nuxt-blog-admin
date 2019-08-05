<template>
  <div class="app-container">
    <div class="filter-container">

      <el-select v-model="listQuery.type" filterable placeholder="模块" clearable class="filter-item">
        <el-option v-for="item in typeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.result" placeholder="推送结果" clearable class="filter-item">
        <el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-select v-model="listQuery.push_type" placeholder="推送类型" clearable class="filter-item">
        <el-option v-for="item in pushTypeOptions" :key="item.key" :label="item.name" :value="item.key" />
      </el-select>
      <el-date-picker v-model="listQuery.date_range" type="daterange" align="right" unlink-panels range-separator="-"
        start-placeholder="开始日期" end-placeholder="结束日期" :picker-options="pickerOptions" value-format="yyyy-MM-dd" format="yyyy年 MM月 dd日">
      </el-date-picker>
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
        <el-table-column label="推送类型" width="150px" align="center">
          <template slot-scope="{row}">
            <el-tag type="success" size="medium" v-if="row.push_type == 1"><span>需方APP</span></el-tag>
            <el-tag type="success" size="medium" v-if="row.push_type == 2"><span>供方APP</span></el-tag>
            <el-tag type="success" size="medium" v-if="row.push_type == 3"><span>微信</span></el-tag>
            <el-tag type="success" size="medium" v-if="row.push_type == 4"><span>短信</span></el-tag>
          </template>
        </el-table-column>
        <el-table-column label="推送参数" width="280px" align="center">
          <template slot-scope="{row}">
            <p v-for="item in row.params">
              <span>{{item.key}} : </span>
              <el-tag size="small">{{item.value}}</el-tag>
            </p>
          </template>
        </el-table-column>
        <el-table-column label="推送时间" width="280px" align="center">
          <template slot-scope="{row}">
            <span>{{row.created_at}}</span>
          </template>
        </el-table-column>
        <el-table-column label="推送结果" width="100px" align="center">
          <template slot-scope="{row}">
            <div v-if="row.result == 1">
              <el-tag type="success"><span>成功</span></el-tag>
            </div>
            <div v-else>
              <el-tag type="danger"><span>失败</span></el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="失败原因" width="280px" align="center">
          <template slot-scope="{row}">
            <span>{{row.error}}</span>
          </template>
        </el-table-column>

      </el-table>
    </div>

    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

  </div>
</template>

<script>
  import {
    getPushLogs,
    getTypeOptions
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
        pickerOptions: {
          shortcuts: [{
            text: '最近一周',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近一个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 30);
              picker.$emit('pick', [start, end]);
            }
          }, {
            text: '最近三个月',
            onClick(picker) {
              const end = new Date();
              const start = new Date();
              start.setTime(start.getTime() - 3600 * 1000 * 24 * 90);
              picker.$emit('pick', [start, end]);
            }
          }]
        },
        statusOptions: [{
            name: '成功',
            key: 1
          },
          {
            name: '失败',
            key: 2
          },
        ],
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
        typeOptions: [],
        list: [],
        total: 0,
        listLoading: true,
        listQuery: {
          page: 1,
          limit: 10,
          sort: '-id',
          date_range: []
        },
      }
    },
    created() {
      this.getList(),
      this.getTypeOptions()
    },

    methods: {

      getList() {
        this.listLoading = true
        getPushLogs(this.listQuery).then(response => {
          this.list = response.data.data
          this.total = response.data.total
          this.listLoading = false
        })
      },

      getTypeOptions() {
        getTypeOptions().then(response => {
          this.typeOptions = response.data
        })
      },

      handleFilter() {
        this.listQuery.page = 1
        this.getList()
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
