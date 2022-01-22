<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>方法列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getMethodList">
                        <el-button slot="append" icon="el-icon-search" @click="getMethodList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addMethodVisible = true ">添加方法</el-button>
                </el-col>
            </el-row>

            <el-table :data='methodlist' border stripe >
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="方法名称" prop="method_name"></el-table-column>
                <el-table-column label="py_name" prop="py_name"></el-table-column>
                <el-table-column label="创建人" prop="user_name"></el-table-column>
                <el-table-column label="操作" width="150px">
                  <!-- slot-scope拿到这一行的动态数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeCaseById(scope.row.id)"></el-button>
                    </template>
                    <template></template>
                </el-table-column>
            </el-table>
                <!-- 分页区域 -->
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[5, 10, 20, 50,100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>
                <!-- 添加方法的对话框 -->
        <!-- 关闭事件@close 绑定 addmethodClosed  -->
        <el-dialog
          title="添加方法" :visible.sync="addMethodVisible"
          width="50%" @close='addmethodClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="methodFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="方法名称" prop="method_name">
              <el-input v-model="addForm.method_name" style="width: 90%;"></el-input>
            </el-form-item>
            <el-form-item label="py_name" prop="py_name">
              <el-input v-model="addForm.py_name" style="width: 90%;"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addMethodVisible = false">取 消</el-button>
            <el-button type="primary" @click="addmethod">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用户对话框 -->
        <el-dialog
          title="修改方法" :visible.sync="eidtCaseVisible"
          width="50%" @close='editCaseClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="70px">
            <el-form-item label="修改名">
              <el-input v-model="editForm.method_name"></el-input>
            </el-form-item>
            <el-form-item label="pyname">
              <el-input v-model="editForm.py_name"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtCaseVisible = false">取 消</el-button>
            <el-button type="primary" @click="editMethodInfo">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
import Sortable from 'sortablejs'
export default (
  {
    data() {
      return {
        queryInfo: {
          query: '',
          //   当前页数
          pagenum: 1,
          //   当前每页显示多少
          pagesize: 5
        },
        //   获取方法列表的参数对象
        methodlist: [],
        total: 0,
        //  默认隐藏添加用例
        addMethodVisible: false,
        // 控制修改用例对话框的显示隐藏
        eidtCaseVisible: false,
        addForm: {
          method_name: '',
          py_name: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加方法的验证规则对象
        methodFormRules: {
          method_name: [
            { required: true, message: '请输入用例名', trigger: 'blur' }
          ],
          py_name: [
            { required: true, message: '请输入用例名', trigger: 'blur' }
          ]
        },
        // 修改case的验证规则对象
        eidtFormRules: {
          case_name: [
            { required: true, message: '请输入用例名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 编辑时查询到的用户信息对象
        editForm: {}
      }
    },
    created() {
      this.getMethodList()
    },
    methods: {
      async getMethodList() {
        const { data: res } = await this.$http.get('method', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用例列表失败')
        }
        this.methodlist = res.data
        this.total = res.totalRecord
        // this.queryInfo.pagenum = res.data.pagenum 应该能解决在第二页搜索不到的情况
        console.log(this.total)
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getMethodList()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getMethodList()
      },
      addmethod() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('method/addmethod', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加方法失败')
          }
          this.$message.success('添加方法成功')
          // 隐藏添加用户的对话框
          this.addMethodVisible = false
          // 重新获取用户列表数据
          this.getMethodList()
        })
      },
      //  重置添加表单
      addmethodClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 重置修改表单
      editCaseClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 展示修改用户对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('method/idmethod', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取方法失败')
        }
        this.editForm = res.data
        this.eidtCaseVisible = true
      },
      editMethodInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改用户的请求
          const { data: res } = await this.$http.post('method/editmethod', {
            id: this.editForm.id,
            method_name: this.editForm.method_name,
            py_name: this.editForm.py_name
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改方法失败')
          }
          this.$message.success('修改方法成功')
          // 隐藏修改用户的对话框
          this.eidtCaseVisible = false
          // 重新获取用户列表数据
          this.getMethodList()
        })
      },
      // 根据ID删除用户信息
      async removeCaseById(id) {
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
        const { data: res } = await this.$http.get('method/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取用户列表数据
        this.getMethodList()
      }
    }
  })
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
