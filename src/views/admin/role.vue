<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.name" prefix-icon="el-icon-search" placeholder="输入角色名称搜索" class="filter-item"
			 @keyup.enter.native="handleFilter" />
			<el-select v-model="listQuery.parent_id" placeholder="角色集合" clearable class="filter-item">
				<el-option v-for="item in permissionParentOptions" :key="item.key" :label="item.name" :value="item.key" />
			</el-select>
			<el-select v-model="listQuery.status" placeholder="角色状态" clearable class="filter-item">
				<el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
			</el-select>
			<el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
				搜索
			</el-button>
			<el-button v-waves style="margin-left: 10px;" type="success" icon="el-icon-edit" v-permission="['role/edit-role']" @click="handleCreate">
				新增角色
			</el-button>
		</div>
		<div class="left-container">
			<el-table v-loading="listLoading" sort-change="handleSortChange" :data="list" border fit
			 highlight-current-row style="width: 100%;" @sort-change="sortChange">
				<el-table-column label="角色名称" prop="name" width="180px" align="center">
					<template slot-scope="{row}">
						<span>{{ row.name }}</span>
					</template>
				</el-table-column>
				<el-table-column label="角色描述" width="360px" align="center">
					<template slot-scope="{row}">
						<span>{{ row.describe }}</span>
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
						<el-button v-waves type="primary" size="mini" v-permission="['role/edit-role']" @click="handleUpdate(row)">
							编辑
						</el-button>
						<el-button v-waves v-if="row.status == 1" size="mini" v-permission="['role/change-status']" type="warning" @click="handleChangeStatus(row,2)">
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
		<!-- 编辑 新增管理员 -->
		<el-dialog :title="textMap[dialogStatus]" width="700px" :visible.sync="dialogFormVisible">
			<el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">

				<el-form-item label="角色名称" prop="name">
					<el-input v-model="temp.name" />
				</el-form-item>

				<el-form-item label="角色描述" prop="describe">
					<el-input type="textarea" autosize v-model="temp.describe" />
				</el-form-item>

				<el-form-item label="状态">
					<div>
						<el-radio v-model="temp.status" label="1" border size="medium">启用</el-radio>
						<el-radio v-model="temp.status" label="2" border size="medium">禁用</el-radio>
					</div>
				</el-form-item>

				<el-form-item label="拥有权限">
					<el-tree :data="permissionOptions" v-model="temp.permissions" ref="tree" show-checkbox node-key="value">
					</el-tree>
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
		getRoles,
		editRole,
		deleteRole,
		changeStatus
	} from '@/api/role'
	import {
		getPermissionOptions
	} from '@/api/permission'
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
				permissionOptions: [],
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
					update: '编辑角色',
					create: '新增角色'
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
			}
		},
		created() {
			this.getList()
			this.getPermissionOptions()
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
				getRoles(this.listQuery).then(response => {
					this.list = response.data.data
					this.total = response.data.total
					this.listLoading = false
				})
			},

			getPermissionOptions() {
				getPermissionOptions().then(response => {
					this.permissionOptions = response.data
				})
			},

			handleFilter() {
				this.listQuery.page = 1
				this.getList()
			},
			resetTemp() {
				this.temp = {
					status: '1',
					'permissions': []
				}
			},
			handleCreate() {
				this.resetTemp()
				this.dialogStatus = 'create'
				this.dialogFormVisible = true
				this.$refs.tree.setCheckedKeys([]);
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
					this.$refs.tree.setCheckedKeys(this.temp.permissions);
					this.$refs['dataForm'].clearValidate()
				})
			},
			updateData() {
				this.$refs['dataForm'].validate((valid) => {
					if (valid) {
						this.temp.permissions = this.$refs.tree.getCheckedKeys()
						editRole(this.temp).then(response => {
							this.getList()
							this.dialogFormVisible = false
							this.$notify({
								title: '成功',
								message: '保存角色信息成功',
								type: 'success',
								duration: 2000
							})
						})
					}
				})
			},
			handleChangeStatus(row, status) {
				var message = status == 1 ? '角色启用成功' : '角色禁用成功'
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
				this.$confirm('此操作将永久删除该角色, 是否继续?', '删除角色提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					deleteRole({
						id: row.id
					}).then(response => {
						this.$notify({
							title: '成功',
							message: '已成功删除角色项',
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
</style>
