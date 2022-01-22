<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>元素管理</el-breadcrumb-item>
        </el-breadcrumb>

        <!-- 卡片视图区域 -->
        <el-card class="box-card">
            <!-- 搜索与添加 -->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getElementList">
                        <el-button slot="append" icon="el-icon-search" @click="getElementList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addElementVisible = true ">添加元素</el-button>
                    <el-button @click="deleteFileOrDirectory(sels)" :disabled="this.sels.length === 0"> 批量删除</el-button>
                </el-col>
            </el-row>

            <el-table :data='elementlist' border stripe @selection-change="selsChange">
                <el-table-column type="selection" width="55"></el-table-column>
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="元素名称" prop="element_name" show-overflow-tooltip></el-table-column>
                <el-table-column label="元素" prop="element" show-overflow-tooltip></el-table-column>
                <el-table-column label="元素类型" prop="type_name" show-overflow-tooltip></el-table-column>
                <el-table-column label="文本" prop="text" show-overflow-tooltip></el-table-column>
                <el-table-column label="数组" prop="array" show-overflow-tooltip></el-table-column>
                <el-table-column label="创建人" prop="user_name" show-overflow-tooltip></el-table-column>
                <el-table-column label="创建时间" prop="create_time" show-overflow-tooltip></el-table-column>
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
                :page-sizes="[ 10, 20, 50, 100 ]"
                :page-size="queryInfo.pagesize"
                layout="total, sizes, prev, pager, next, jumper"
                :total="total">
                </el-pagination>
        </el-card>
                <!-- 添加元素的对话框 -->
        <!-- 关闭事件@close 绑定 addElementClosed  -->
        <el-dialog
          title="添加元素" :visible.sync="addElementVisible"
          width="50%" @close='addElementClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="elementFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="元素名称" prop="element_name">
              <el-input v-model="addForm.element_name" style="width: 90%;"></el-input>
            </el-form-item>
            <el-form-item label="元素" prop="element">
              <el-input v-model="addForm.element" style="width: 90%;"></el-input>
            </el-form-item>
            <el-form-item label="元素类型" prop="type_id">
                <el-select v-model="addForm.type_id" style="width: 14%;" placeholder="元素类型">
                  <el-option label="xpath" value="1"></el-option>
                  <el-option label="id" value="2"></el-option>
                  <el-option label="name" value="3"></el-option>
                  <el-option label="text" value="4"></el-option>
                  <el-option label="class" value="5"></el-option>
                  <el-option label="css" value="6"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="文本" prop="text">
              <el-input v-model="addForm.text" style="width: 90%;"></el-input>
            </el-form-item>
            <el-form-item label="数组" prop="array">
              <el-input v-model="addForm.array" style="width: 90%;"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addElementVisible = false">取 消</el-button>
            <el-button type="primary" @click="addelement">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改元素对话框 -->
        <el-dialog
          title="修改元素" :visible.sync="eidtElementVisible"
          width="50%" @close='editElementClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="15%">
            <el-form-item label="元素名称" prop='element_name'>
              <el-input v-model="editForm.element_name"></el-input>
            </el-form-item>
            <el-form-item label="元素">
              <el-input v-model="editForm.element"></el-input>
            </el-form-item>
            <el-form-item label="元素类型" prop="type_id">
                <el-select v-model="editForm.type_id" style="width: 14%;" placeholder="元素类型">
                    <el-option label="xpath" value="1"></el-option>
                    <el-option label="id" value="2"></el-option>
                    <el-option label="name" value="3"></el-option>
                    <el-option label="text" value="4"></el-option>
                    <el-option label="class" value="5"></el-option>
                    <el-option label="css" value="6"></el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="文本">
              <el-input v-model="editForm.text"></el-input>
            </el-form-item>
            <el-form-item label="数组">
              <el-input v-model="editForm.array"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtElementVisible = false">取 消</el-button>
            <el-button type="primary" @click="editElementInfo">确 定</el-button>
          </span>
        </el-dialog>
    </div>
</template>
<script>
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
          element_page: ''
        },
        sels: [], // 选中的值显示
        //   获取元素列表的参数对象
        elementlist: [],
        total: 0,
        //  默认隐藏添加元素
        addElementVisible: false,
        // 控制修改元素对话框的显示隐藏
        eidtElementVisible: false,
        addForm: {
          element_name: '',
          element: '',
          type_id: '',
          array: '',
          text: '',
          element_page: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加元素的验证规则对象
        elementFormRules: {
          element_name: [
            { required: true, message: '请输入元素名', trigger: 'blur' },
            { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
          ],
          type_id: [
            { required: true, message: '请输入元素名', trigger: 'blur' }
          ]
        },
        // 修改元素的验证规则对象
        eidtFormRules: {
          element_name: [
            { required: true, message: '请输入元素名', trigger: 'blur' },
            { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
          ]
        },
        // 编辑时查询到的用户信息对象
        editForm: {}
      }
    },
    created() {
      this.queryInfo.element_page = this.$route.query.elementpageid
      this.addForm.element_page = this.$route.query.elementpageid
      this.getElementList()
    },
    methods: {
      async getElementList() {
        const { data: res } = await this.$http.get('element', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素列表失败')
        }
        this.elementlist = res.data
        this.total = res.totalRecord
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getElementList()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getElementList()
      },
      addelement() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('element/addelement', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加元素失败')
          }
          this.$message.success('添加元素成功')
          // 隐藏添加用户的对话框
          this.addElementVisible = false
          // 重新获取用户列表数据
          this.getElementList()
        })
      },
      //  重置添加表单
      addElementClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 重置修改表单
      editElementClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 展示修改用户对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('element/idelement', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素失败')
        }
        this.editForm = res.data
        this.eidtElementVisible = true
      },
      editElementInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改用户的请求
          const { data: res } = await this.$http.post('element/editelement', {
            id: this.editForm.id,
            element_name: this.editForm.element_name,
            element: this.editForm.element,
            text: this.editForm.text,
            array: this.editForm.array
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改元素信息失败')
          }
          this.$message.success('修改元素成功')
          // 隐藏修改用户的对话框
          this.eidtElementVisible = false
          // 重新获取用户列表数据
          this.getElementList()
        })
      },
      // 根据ID删除用户信息
      async removeCaseById(id) {
        // 弹窗询问用户是否删除数据
        const confirmResult = await this.$confirm('使用该元素的用例步骤会同步删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('element/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取元素列表数据
        this.getElementList()
      },
      async deleteFileOrDirectory() {
        var ids = this.sels.map(item => item.id).join()// 获取所有选中行的id组成的字符串，以逗号分隔
        console.log(ids)
        // 弹窗询问用户是否删除数据
        const confirmResult = await this.$confirm('使用该元素的用例步骤会同步删除, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('element/delete', { params: { id: ids } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取元素列表数据
        this.getElementList()
      },
      selsChange(sels) {
        this.sels = sels
      }
    }
  })
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
