<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.name" prefix-icon="el-icon-search" placeholder="输入权限名称搜索" class="filter-item"
			 @keyup.enter.native="handleFilter" />
			<el-cascader v-model="listQuery.parent" class="filter-item jilian" clearable placeholder="权限集合" :options="permissionParentOptions"
			 :props="{ expandTrigger: 'hover',checkStrictly: true}"></el-cascader>
			<el-select v-model="listQuery.status" placeholder="权限状态" clearable class="filter-item">
				<el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
			</el-select>
			<el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
				搜索
			</el-button>
			<el-button v-waves style="margin-left: 10px;" type="success" icon="el-icon-edit" v-permission="['permission/permission-list']" @click="handleCreate">
				新增权限
			</el-button>
		</div>
		<div class="left-container">
			<el-table v-loading="listLoading" sort-change="handleSortChange" :data="list" border fit
			 highlight-current-row style="width: 100%;" @sort-change="sortChange">
				<el-table-column label="权限名称" prop="name" width="180px" align="center">
					<template slot-scope="{row}">
						<span>{{ row.name }}</span>
					</template>
				</el-table-column>
				<el-table-column label="权限键值" width="180px" align="center">
					<template slot-scope="{row}">
						<span>{{ row.key }}</span>
					</template>
				</el-table-column>
				<el-table-column label="添加时间" width="210px" align="center">
					<template slot-scope="{row}">
						{{ row.created_at }}
					</template>
				</el-table-column>
				<el-table-column label="当前状态" width="160px" align="center">
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
						<el-button v-waves type="primary" size="mini" v-permission="['permission/edit-permission']" @click="handleUpdate(row)">
							编辑
						</el-button>
						<el-button v-waves v-if="row.status == 1" size="mini" v-permission="['permission/change-status']" type="warning" @click="handleChangeStatus(row,2)">
							禁用
						</el-button>
						<el-button v-waves v-else size="mini" type="success" v-permission="['permission/change-status']" @click="handleChangeStatus(row,1)">
							启用
						</el-button>
						<el-button v-waves size="mini" type="danger" v-permission="['permission/delete-permission']" @click="handleDelete(row)">
							删除
						</el-button>
					</template>
				</el-table-column>
			</el-table>
		</div>

		<pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
		<!-- 编辑 新增管理员 -->
		<el-dialog :title="textMap[dialogStatus]" width="700px" :visible.sync="dialogFormVisible">
			<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">

				<el-form-item label="权限名称" prop="name">
					<el-input v-model="temp.name" />
				</el-form-item>

				<el-form-item label="权限键值" prop="key">
					<el-input v-model="temp.key" />
				</el-form-item>

				<el-form-item label="状态">
					<div>
						<el-radio v-model="temp.status" label="1" border size="medium">启用</el-radio>
						<el-radio v-model="temp.status" label="2" border size="medium">禁用</el-radio>
					</div>
				</el-form-item>

				<el-form-item label="所属集合" prop="parent">
					<div class="block parent-select">
						<el-cascader v-model="temp.parent" class="jilian" :options="permissionParentOptions" clearable :props="{ expandTrigger: 'hover',checkStrictly: true}"></el-cascader>
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
		getPermissions,
		getPermissionParentOptions,
		editPermission,
		deletePermission,
		changeStatus
	} from '@/api/permission'
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
			var checkPhone = (rule, value, callback) => {
				if (!value) {
					return callback(new Error('手机号不能为空'));
				} else {
					const reg = /^1\d{10}$/
					if (reg.test(value)) {
						callback();
					} else {
						return callback(new Error('请输入正确的手机号'));
					}
				}
			};
			return {
				list: null,
				total: 0,
				listLoading: true,
				listQuery: {
					page: 1,
					limit: 10,
					sort: '-id'
				},
				multipleSelection: [],
				permissionParentOptions: [],
				statusOptions: [{
						name: '启用中',
						key: 1
					},
					{
						name: '已禁用',
						key: 2
					},
				],

				showReviewer: false,
				temp: {},
				dialogFormVisible: false,
				dialogStatus: '',
				textMap: {
					update: '编辑权限',
					create: '新增权限'
				},
				dialogPvVisible: false,
				rules: {
					company: [{
						required: true,
						message: '请填写公司名称',
						trigger: 'change'
					}],
					phone: [{
						required: true,
						validator: checkPhone,
						message: '请检查手机号码是否正确填写',
						trigger: 'blur'
					}]
				},
				downloadLoading: false
			}
		},
		created() {
			this.getList()
			this.getPermissionParentOptions()
		},
		methods: {
			number() {
				this.temp.mobile = this.temp.mobile.replace(/[^\.\d]/g, '');
				this.temp.mobile = this.temp.mobile.replace('.', '');
			},
			sortChange(data) {
				const {
					prop,
					order
				} = data
				if (order === 'ascending') {
					this.listQuery.sort = '+' + prop
				} else {
					this.listQuery.sort = '-' + prop
				}
				this.handleFilter()
			},

			getList() {
				this.listLoading = true
				getPermissions(this.listQuery).then(response => {
					this.list = response.data.data
					this.total = response.data.total
					this.listLoading = false
				})
			},
			getPermissionParentOptions() {
				getPermissionParentOptions().then(response => {
					this.permissionParentOptions = response.data
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
						editPermission(this.temp).then(response => {
							this.getList()
							this.getPermissionParentOptions()
							this.dialogFormVisible = false
							this.$notify({
								title: '成功',
								message: '保存权限信息成功',
								type: 'success',
								duration: 2000
							})
						})
					}
				})
			},
			handleChangeStatus(row, status) {
				var message = status == 1 ? '权限启用成功' : '权限禁用成功'
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
				this.$confirm('此操作将永久删除该权限, 是否继续?', '删除权限提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					deletePermission({
						id: row.id
					}).then(response => {
						this.$notify({
							title: '成功',
							message: '已成功删除权限项',
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

	.parent-select {
		height: 150px;
	}

	.jilian{
		width: 280px;
	}
</style>
