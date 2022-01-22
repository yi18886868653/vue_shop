<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>用例列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="nowPage">
                        <el-button slot="append" icon="el-icon-search" @click="nowPage"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addCaseVisible = true ">添加用例</el-button>
                </el-col>
            </el-row>

            <el-table :data='caselist' border stripe :key="kenNameRandom">
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="用例名称" prop="case_name">
                  <template slot-scope="scope">
                    <router-link v-bind:to="'/step?caseid='+scope.row.id">{{ scope.row.case_name }}</router-link>
                  </template>
                </el-table-column>
                <el-table-column label="排序" prop="sort"></el-table-column>
                <el-table-column label="创建人" prop="user_name"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
                <el-table-column label="操作" width="170px">
                  <!-- slot-scope拿到这一行的动态数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeCaseById(scope.row.id)"></el-button>
                        <el-button type="primary" class="el-icon-caret-right" round size="mini" @click="test_case(scope.row.id)">调试</el-button>
                    </template>
                    <template></template>
                </el-table-column>
            </el-table>
                <!-- 分页区域 -->
                <el-pagination
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                :current-page="queryInfo.pagenum"
                :page-sizes="[ 10, 20, 50,100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>
                <!-- 添加case的对话框 -->
        <!-- 关闭事件@close 绑定 addCaseClosed  -->
        <el-dialog
          title="添加用例" :visible.sync="addCaseVisible"
          width="50%" @close='addCaseClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="caseFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="用例名称" prop="case_name">
              <el-input v-model="addForm.case_name" style="width: 90%;"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addCaseVisible = false">取 消</el-button>
            <el-button type="primary" @click="addcase">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改用例对话框 -->
        <el-dialog
          title="修改用例" :visible.sync="eidtCaseVisible"
          width="50%" @close='editCaseClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="70px">
            <el-form-item label="用例名称">
              <el-input v-model="editForm.case_name"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtCaseVisible = false">取 消</el-button>
            <el-button type="primary" @click="editCaseInfo">确 定</el-button>
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
          pagesize: 10
        },
        //   获取用例列表的参数对象
        caselist: [],
        total: 0,
        //  默认隐藏添加用例
        addCaseVisible: false,
        // 控制修改用例对话框的显示隐藏
        eidtCaseVisible: false,
        kenNameRandom: '',
        addForm: {
          case_name: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加case的验证规则对象
        caseFormRules: {
          case_name: [
            { required: true, message: '请输入用例名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 修改case的验证规则对象
        eidtFormRules: {
          case_name: [
            { required: true, message: '请输入用例名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 排序用到的信息
        sortFrom: {
          sort: '',
          sort1: ''
        },
        // 编辑时查询到的用例信息对象
        editForm: {}
      }
    },
    created() {
      this.getcaselist()
    },
    methods: {
      async getcaselist() {
        const { data: res } = await this.$http.get('case', { params: this.queryInfo }, { showLoading: true })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用例列表失败')
        }
        this.caselist = res.data
        this.total = res.totalRecord
      },
      nowPage() {
        this.queryInfo.pagenum = 1
        this.getcaselist()
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getcaselist()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getcaselist()
      },
      addcase() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('case/addcase', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加用例失败')
          }
          this.$message.success('添加用例成功')
          // 隐藏添加用例的对话框
          this.addCaseVisible = false
          // 重新获取用例列表数据
          this.getcaselist()
        })
      },
      //  重置添加表单
      addCaseClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 重置修改表单
      editCaseClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 展示修改用例对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('case/idcase', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用例信息失败')
        }
        this.editForm = res.data
        this.eidtCaseVisible = true
      },
      editCaseInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改用例的请求
          const { data: res } = await this.$http.post('case/editcase', {
            id: this.editForm.id,
            case_name: this.editForm.case_name
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改用例信息失败')
          }
          this.$message.success('修改用例成功')
          // 隐藏修改用例的对话框
          this.eidtCaseVisible = false
          // 重新获取用例列表数据
          this.getcaselist()
        })
      },
      // 根据ID删除用例信息
      async removeCaseById(id) {
        // 弹窗询问用例是否删除数据
        const confirmResult = await this.$confirm('此操作将删除该用例, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用例确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('case/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取用例列表数据
        this.getcaselist()
      },
      async test_case(id) {
        const { data: res } = await this.$http.get('case/case', { params: { run: 1, case_id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('执行用例失败')
        }
      }
    }
  })
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
