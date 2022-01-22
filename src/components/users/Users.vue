<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item><a href="/">用户管理</a></el-breadcrumb-item>
        <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->

            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
                        <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible = true ">添加用户</el-button>
                </el-col>
            </el-row>

            <!-- 用户列表区域 -->
            <el-table :data='userlist' border stripe>
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="姓名" prop="username"></el-table-column>
                <el-table-column label="邮箱" prop="email"></el-table-column>
                <el-table-column label="电话" prop="mobile"></el-table-column>
                <el-table-column label="角色" prop="role_name"></el-table-column>
                <el-table-column label="状态">
                    <template slot-scope="scope">
                        <el-switch v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="150px">
                  <!-- slot-scope拿到这一行的动态数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeUserById(scope.row.id)"></el-button>
                        <!-- 分配角色 -->
                        <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable='false'>
                        <el-button type="warning" icon="el-icon-setting" size="mini" circle></el-button>
                        </el-tooltip>
                    </template>
                    <template></template>
                </el-table-column>
            </el-table>
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[1, 2, 5, 10]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>
        <!-- 添加用户的对话框 -->
        <!-- 关闭事件@close 绑定 addDialogClosed方法  -->
        <el-dialog
          title="添加用户" :visible.sync="addDialogVisible"
          width="50%" @close='addDialogClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="ruleFormRules"
          ref="addFormRef" label-width="70px">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="addForm.username"></el-input>
            </el-form-item>
            <el-form-item label="密码" prop="password">
              <el-input v-model="addForm.password"></el-input>
            </el-form-item>
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="addForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="addForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="adduser">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog
          title="修改用户" :visible.sync="eidtDialogVisible"
          width="50%" @close='editDialogClosed'>
          <el-form :model="editForm" :rules="editFormRules"
          ref="editFormRef" label-width="70px">
            <el-form-item label="用户名">
              <el-input v-model="editForm.username" disabled></el-input>
            </el-form-item>
            <!-- <el-form-item label="密码" prop="password">
              <el-input v-model="editForm.password"></el-input>
            </el-form-item> -->
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="editForm.email"></el-input>
            </el-form-item>
            <el-form-item label="手机" prop="mobile">
              <el-input v-model="editForm.mobile"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtDialogVisible = false">取 消</el-button>
            <el-button type="primary" @click="editUserInfo">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>

<script>
export default (
  {
    data() {
      return {
        //   获取用户列表的参数对象
        queryInfo: {
          query: '',
          //   当前页数
          pagenum: 1,
          //   当前每页显示多少
          pagesize: 2
        },
        userlist: [],
        total: 0,
        // 控制添加用户对话框的显示隐藏
        addDialogVisible: false,
        // 控制修改用户对话框的显示隐藏
        eidtDialogVisible: false,
        // 添加用户表单数据
        addForm: {
          username: '',
          password: '',
          email: '',
          mobile: ''

        },
        // 添加表单的验证规则对象
        ruleFormRules: {
          username: [
            { required: true, message: '请输入账号', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          password: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        },
        editFormRules: {
          password: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          mobile: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ],
          email: [
            { required: true, message: '请输入密码', trigger: 'change' },
            { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
          ]
        },
        // 编辑时查询到的用户信息对象
        editForm: {}
      }
    },
    created() {
      this.getUserList()
    },
    methods: {
      async getUserList() {
        const { data: res } = await this.$http.get('users', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户列表失败')
        }
        console.log(res)
        this.userlist = res.data.users
        this.total = res.data.total
        // this.queryInfo.pagenum = res.data.pagenum 应该能解决在第二页搜索不到的情况
        console.log(res)
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 监听 switch开关状态的改变
      async userStateChanged(userinfo) {
        console.log(userinfo)
        const { data: res } = await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
        if (res.meta.status !== 200) {
          userinfo.mg_state = !userinfo.mg_state
          return this.$message.error('更新用户列表失败')
        }
        this.$message.success('更新用户列表成功')
      },
      // 监听添加用户对话框的关闭事件
      // <!-- 关闭事件@close 绑定 addDialogClosed方法  -->
      addDialogClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 添加新用户adduser
      adduser() {
        this.$refs.addFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起添加用户的请求
          const { data: res } = await this.$http.post('users', this.addForm)
          if (res.meta.status !== 201) {
            return this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户列表数据
          this.getUserList()
        })
      },
      // 展示修改用户对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('获取用户信息失败')
        }
        this.editForm = res.data
        this.eidtDialogVisible = true
      },
      // 重置修改用户对话框内容
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      editUserInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改用户的请求
          const { data: res } = await this.$http.put('users/' + this.editForm.id, {
            email: this.editForm.email,
            mobile: this.editForm.mobile
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改用户信息失败')
          }
          this.$message.success('修改用户成功')
          // 隐藏修改用户的对话框
          this.eidtDialogVisible = false
          // 重新获取用户列表数据
          this.getUserList()
        })
      },
      // 根据ID删除用户信息
      async removeUserById(id) {
        // 弹窗询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.delete('users/' + id)
        if (res.meta.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除成功')
        // 重新获取用户列表数据
        this.getUserList()
      }
    }
  })
</script>

<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
