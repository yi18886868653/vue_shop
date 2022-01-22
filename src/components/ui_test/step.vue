<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>步骤管理</el-breadcrumb-item>
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
                    <el-button type="primary" @click="stepCaseVisible = true ">添加步骤</el-button>
                </el-col>
            </el-row>

            <el-table :data='steplist' border stripe >
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="步骤名称" prop="step_name"></el-table-column>
                <el-table-column label="元素名称" prop="element_name"></el-table-column>
                <el-table-column label="方法名称" prop="method_name"></el-table-column>
                <el-table-column label="等待时间" prop="wait_time"></el-table-column>
                <el-table-column label="关联用例" prop="case_name"></el-table-column>
                <el-table-column label="步骤名称" prop="user_name"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
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
                :page-sizes="[ 10, 20, 50,100]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>
                <!-- 添加步骤的对话框 -->
        <!-- 关闭事件@close 绑定 addstepClosed  -->
        <el-dialog
          title="添加步骤" :visible.sync="stepCaseVisible"
          width="50%" @close='addstepClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="stepFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="步骤名称" prop="step_name">
              <el-input v-model="addForm.step_name" style="width: 90%;" placeholder="步骤名称"></el-input>
            </el-form-item>
            <el-form-item label="元素名称" prop="element_id">
              <el-select v-model="editForm.element_page_id" style="width: 20%; margin-right: 22px;" placeholder="选择页面" filterable @change="getelementlist(editForm.element_page_id)">
                    <el-option
                      v-for="item in elementpagelist"
                      :key="item.id"
                      :label="item.element_page_name"
                      :value="item.id">
                  </el-option>
                </el-select>
              <el-select v-model="addForm.element_id" style="width: 20%;" placeholder="选择元素" filterable>
                    <el-option
                      v-for="item in elementlist"
                      :key="item.id"
                      :label="item.element_name"
                      :value="item.id">
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="方法" prop="method_id">
                <el-select v-model="addForm.method_id" style="width: 43%;" placeholder="方法" filterable>
                      <el-option
                            v-for="item in methodlist"
                            :key="item.py_name"
                            :label="item.method_name"
                            :value="item.id">
                        </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="等待时间" prop="wait_time" >
              <el-input v-model="addForm.wait_time" style="width: 14%;" placeholder='等待秒数'></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="stepCaseVisible = false">取 消</el-button>
            <el-button type="primary" @click="addstep">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改步骤对话框 -->
        <el-dialog
          title="修改步骤" :visible.sync="eidtElementVisible"
          width="50%" @close='editElementClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="70px">
            <el-form-item label="步骤名称" prop="step_name">
              <el-input v-model="editForm.step_name" style="width: 90%;" placeholder="步骤名称"></el-input>
            </el-form-item>
            <el-form-item label="元素名称" prop="element_id">
                <el-select v-model="editForm.element_id" style="width: 14%;" placeholder="元素" filterable>
                    <el-option
                      v-for="item in elementlist"
                      :key="item.id"
                      :label="item.element_name"
                      :value="item.id">
                  </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="方法" prop="method_id">
                <el-select v-model="editForm.method_id" style="width: 14%;" placeholder="方法" filterable>
                      <el-option
                            v-for="item in methodlist"
                            :key="item.id"
                            :label="item.method_name"
                            :value="item.id">
                        </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="等待时间" prop="wait_time" >
              <el-input v-model="editForm.wait_time" style="width: 14%;" placeholder='等待秒数'></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtElementVisible = false">取 消</el-button>
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
          pagesize: 10,
          //  当前用例
          case_id: ''
        },
        //   获取步骤列表的参数对象
        steplist: [],
        methodlist: [],
        elementlist: [],
        elementpagelist: [],
        total: 0,
        //  默认隐藏添加步骤
        stepCaseVisible: false,
        // 控制修改步骤对话框的显示隐藏
        eidtElementVisible: false,
        addForm: {
          step_name: '',
          element_id: '',
          element_page_id: '',
          method_id: '',
          wait_time: '',
          case_id: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加case的验证规则对象
        stepFormRules: {
          step_name: [
            { required: true, message: '请输入步骤名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 1 到 10 个字符', trigger: 'blur' }
          ],
          element_id: [
            { required: true, message: '请选择元素', trigger: 'blur' }
          ]
        },
        // 修改case的验证规则对象
        eidtFormRules: {
          step_name: [
            { required: true, message: '请输入步骤名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 排序用到的信息
        sortFrom: {
          sort: '',
          sort1: ''
        },
        // 编辑时查询到的步骤信息对象
        editForm: {}
      }
    },
    async created() {
      this.queryInfo.case_id = this.$route.query.caseid
      this.addForm.case_id = this.$route.query.caseid
      await this.getsteplist()
      await this.getmethodlist()
      await this.getelementpagelist()
    },
    mounted() {
      this.rowDrop()
    },
    methods: {
      async getsteplist() {
        const { data: res } = await this.$http.get('step', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取步骤列表失败')
        }
        this.steplist = res.data
        this.total = res.totalRecord
      },

      async getmethodlist() {
        const { data: res } = await this.$http.get('method', { params: { pagenum: 1, pagesize: 1000 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取方法失败')
        }
        this.methodlist = res.data
      },
      async getelementlist(id) {
        const { data: res } = await this.$http.get('element', { params: { pagenum: 1, pagesize: 1000, id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素失败')
        }
        this.elementlist = res.data
      },
      async getelementpagelist() {
        const { data: res } = await this.$http.get('elementpage', { params: { pagenum: 1, pagesize: 1000 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素页面失败')
        }
        this.elementpagelist = res.data
      },
      nowPage() {
        this.queryInfo.pagenum = 1
        this.getsteplist()
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getsteplist()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getsteplist()
      },
      addstep() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('step/addstep', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加步骤失败')
          }
          this.$message.success('添加步骤成功')
          // 隐藏添加步骤的对话框
          this.stepCaseVisible = false
          // 重新获取步骤列表数据
          this.getsteplist()
        })
      },
      //  重置添加表单
      addstepClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 重置修改表单
      editElementClosed() {
        this.$refs.editFormRef.resetFields()
      },
      async sortTable() {
        const { data: res } = await this.$http.post('step/editstep', this.sortFrom)
        if (res.meta.status !== 200) {
          return this.$message.error('排序修改失败')
        }
        this.$message.success('排序修改成功')
        // 重新获取步骤列表数据
        this.steplist = undefined
        this.getsteplist()
      },
      //  排序
      rowDrop() {
        const tbody = document.querySelector('.el-table__body-wrapper tbody')
        const that = this
        Sortable.create(tbody, {
          onEnd({ newIndex, oldIndex }) {
            if (newIndex === oldIndex) return
            that.sortFrom.sort = that.steplist[oldIndex].sort
            that.sortFrom.sort1 = that.steplist[newIndex].sort
            // 这后面的是实时保存拖拽结果，并且获取最新的列表顺序，需要和后端配合
            that.sortTable()
          }
        })
      },
      // 展示修改步骤对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('step/idstep', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取步骤信息失败')
        }
        this.editForm = res.data
        console.log(res.data)
        this.eidtElementVisible = true
      },
      editCaseInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改步骤的请求
          const { data: res } = await this.$http.post('step/editstep', {
            id: this.editForm.id,
            step_name: this.editForm.step_name,
            element_id: this.editForm.element_id,
            method_id: this.editForm.method_id,
            wait_time: this.editForm.wait_time
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改步骤失败')
          }
          this.$message.success('修改步骤成功')
          // 隐藏修改步骤的对话框
          this.eidtElementVisible = false
          // 重新获取步骤列表数据
          this.getsteplist()
        })
      },
      // 根据ID删除步骤信息
      async removeCaseById(id) {
        // 弹窗询问步骤是否删除数据
        const confirmResult = await this.$confirm('此操作将删除该步骤, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果步骤确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('step/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取步骤列表数据
        this.getsteplist()
      }
    }
  })
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
