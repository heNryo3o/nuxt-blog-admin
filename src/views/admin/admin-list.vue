<template>
	<div class="app-container">
		<div class="filter-container">
			<el-input v-model="listQuery.username" prefix-icon="el-icon-search" placeholder="输入花名搜索" class="filter-item"
			 @keyup.enter.native="handleFilter" />
			<el-select v-model="listQuery.department" placeholder="部门" clearable class="filter-item">
				<el-option v-for="item in departmentOptions" :key="item.value" :label="item.label" :value="item.value" />
			</el-select>
			<el-select v-model="listQuery.status" placeholder="管理员状态" clearable class="filter-item">
				<el-option v-for="item in statusOptions" :key="item.key" :label="item.name" :value="item.key" />
			</el-select>
			<el-button v-waves type="primary" icon="el-icon-search" @click="handleFilter">
				搜索
			</el-button>
			<el-button v-waves style="margin-left: 10px;" v-permission="['admin/edit-admin']" type="success" icon="el-icon-edit" @click="handleCreate">
				新增管理员
			</el-button>
		</div>

		<el-table v-loading="listLoading" sort-change="handleSortChange" :data="list" border fit
		 highlight-current-row style="width: 100%;" @sort-change="sortChange">
			<el-table-column label="花名" prop="username" width="150px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.username }}</span>
					<el-tag type="success" size="small">{{ row.department }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="姓名" width="150px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.truename }}</span>
				</template>
			</el-table-column>
			<el-table-column label="手机号码" width="150px" align="center">
				<template slot-scope="{row}">
					{{ row.mobile }}
				</template>
			</el-table-column>
			<el-table-column label="添加时间" width="180px" align="center">
				<template slot-scope="{row}">
					<span>{{ row.created_at }}</span>
				</template>
			</el-table-column>
			<el-table-column label="角色" width="300px" align="center">
				<template slot-scope="{row}">
					<el-tag type="info" size="medium" v-for="item in row.roles_name" style="margin-right:10px;">{{ item }}</el-tag>
				</template>
			</el-table-column>
			<el-table-column label="当前状态" width="140px" align="center">
				<template slot-scope="{row}">
					<div v-if="row.status == 1">
						<el-tag><span>在职</span></el-tag>
					</div>
					<div v-else>
						<el-tag type="danger"><span>离职</span></el-tag>
					</div>
				</template>
			</el-table-column>

			<el-table-column label="操作" align="center" width="350px" class-name="small-padding fixed-width">
				<template slot-scope="{row}">
					<el-button v-waves type="primary" size="mini" v-permission="['admin/edit-admin']" @click="handleUpdate(row)">
						编辑
					</el-button>
					<el-button v-waves size="mini" type="success" v-permission="['admin/set-permission']" @click="handleSetPermission(row)">
						设置权限
					</el-button>
					<el-button v-waves v-if="row.status == 1" size="mini" v-permission="['admin/change-status']" type="warning" @click="handleChangeStatus(row,2)">
						离职
					</el-button>
					<el-button v-waves v-else size="mini" type="success" v-permission="['admin/change-status']" @click="handleChangeStatus(row,1)">
						入职
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
		<!-- 设置管理员权限 -->
		<el-dialog :title="textMap[dialogStatus]" width="700px" :visible.sync="permissionDialogVisble">
			<el-form ref="permissionForm" :rules="rules" :model="temp" label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
				<el-form-item label="所属角色" prop="roles">
					<el-select v-model="temp.roles" multiple placeholder="请选择" @change="handleRoleChange(temp)" style="width: 400px;">
						<el-option v-for="item in roleOptions" :key="item.value" :label="item.label" :value="item.value">
						</el-option>
					</el-select>
				</el-form-item>
				<el-form-item label="拥有权限">
					<el-tree :data="permissionOptions" v-model="temp.permissions" ref="tree" show-checkbox node-key="value">
					</el-tree>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer" align="center">
				<el-button @click="permissionDialogVisble = false">
					取消
				</el-button>
				<el-button type="primary" @click="updatePermissions()">
					确认
				</el-button>
			</div>
		</el-dialog>

	</div>
</template>

<script>
	import {
		getList,
		editAdmin,
		getDepartmentOptions,
		changeStatus,
		deleteAdmin,
		getAdminPermissions,
		setAdminPermissions
	} from '@/api/admins'
	import {
		getRoleOptions
	} from '@/api/role'
	import {
		getPermissionOptions
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
				departmentOptions: [],
				roleOptions: [],
				statusOptions: [{
						name: '在职中',
						key: 1
					},
					{
						name: '已离职',
						key: 2
					},
				],

				showReviewer: false,
				temp: {},
				dialogFormVisible: false,
				permissionDialogVisble: false,
				dialogStatus: '',
				textMap: {
					update: '编辑管理员',
					create: '新增管理员'
				},
				rules: {
				},
				permissionOptions: []
			}
		},
		created() {
			this.getList()
			this.getRoleOptions()
			this.getDepartmentOptions()
			this.getPermissionOptions()
		},
		methods: {
			number() {
				this.temp.mobile = this.temp.mobile.replace(/[^\.\d]/g, '');
				this.temp.mobile = this.temp.mobile.replace('.', '');
			},
			updatePermissions() {
				this.temp.permissions = this.$refs.tree.getCheckedKeys()
				setAdminPermissions({
					id: this.temp.id,
					roles: this.temp.roles,
					permissions: this.temp.permissions
				}).then(response=>{
					this.getList()
					this.permissionDialogVisble = false
					this.$notify({
						title: '成功',
						message: '设置管理员权限成功',
						type: 'success',
						duration: 2000
					})
				})
			},
			getRoleOptions() {
				getRoleOptions().then(response => {
					this.roleOptions = response.data
				})
			},
			getPermissionOptions() {
				getPermissionOptions().then(response => {
					this.permissionOptions = response.data
				})
			},
			handleRoleChange() {
				getAdminPermissions({
					id: this.temp.id,
					roles: this.temp.roles
				}).then(response => {
					this.temp.permissions = response.data
					this.$refs.tree.setCheckedKeys(response.data);
				})
			},
			handleSetPermission(row) {
				this.temp = Object.assign({}, row) // copy obj
				this.permissionDialogVisble = true
				this.$nextTick(() => {
					this.$refs.tree.setCheckedKeys(row.permissions);
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
			getDepartmentOptions() {
				getDepartmentOptions().then(response => {
					this.departmentOptions = response.data
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
						editAdmin(this.temp).then(response => {
							this.getList()
							this.dialogFormVisible = false
							this.$notify({
								title: '成功',
								message: '保存管理员信息成功',
								type: 'success',
								duration: 2000
							})
						})
					}
				})
			},
			handleChangeStatus(row, status) {
				var message = status == 1 ? '管理员入职成功' : '管理员离职成功'
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
				this.$confirm('此操作将永久删除该管理员, 是否继续?', '删除管理员提示', {
					confirmButtonText: '确定',
					cancelButtonText: '取消',
					type: 'warning'
				}).then(() => {
					deleteAdmin({
						id: row.id
					}).then(response => {
						this.$notify({
							title: '成功',
							message: '已成功删除管理员',
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
