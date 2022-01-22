<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>元素页面</el-breadcrumb-item>
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
                    <el-button type="primary" @click="addElementPageVisible = true ">添加元素页面</el-button>
                </el-col>
            </el-row>

            <el-table :data='elementpagelist' border stripe :key="kenNameRandom">
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="元素页面名称" prop="element_page_name">
                  <template slot-scope="scope">
                    <router-link v-bind:to="'/element?elementpageid='+scope.row.id">{{ scope.row.element_page_name }}</router-link>
                  </template>
                </el-table-column>
                <el-table-column label="创建人" prop="user_name"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
                <el-table-column label="操作" width="170px">
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
                <!-- 添加对话框 -->
        <!-- 关闭事件@close 绑定 addElementPageClosed  -->
        <el-dialog
          title="添加元素页面" :visible.sync="addElementPageVisible"
          width="50%" @close='addElementPageClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="elementpageFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="元素页面名称" prop="element_page_name">
              <el-input v-model="addForm.element_page_name" style="width: 90%;"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addElementPageVisible = false">取 消</el-button>
            <el-button type="primary" @click="addcase">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改元素页面对话框 -->
        <el-dialog
          title="修改元素页面" :visible.sync="aeidtElementPageVisible"
          width="50%" @close='editElementPageClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="70px">
            <el-form-item label="元素页面名称">
              <el-input v-model="editForm.element_page_name"></el-input>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="aeidtElementPageVisible = false">取 消</el-button>
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
        //   获取元素页面列表的参数对象
        elementpagelist: [],
        total: 0,
        //  默认隐藏添加元素页面
        addElementPageVisible: false,
        // 控制修改元素页面对话框的显示隐藏
        aeidtElementPageVisible: false,
        kenNameRandom: '',
        addForm: {
          element_page_name: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加case的验证规则对象
        elementpageFormRules: {
          case_name: [
            { required: true, message: '请输入元素页面名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 修改case的验证规则对象
        eidtFormRules: {
          case_name: [
            { required: true, message: '请输入元素页面名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ]
        },
        // 排序用到的信息
        sortFrom: {
          sort: '',
          sort1: ''
        },
        // 编辑时查询到的元素页面信息对象
        editForm: {}
      }
    },
    created() {
      this.getelementpagelist()
    },
    methods: {
      async getelementpagelist() {
        const { data: res } = await this.$http.get('elementpage', { params: this.queryInfo }, { showLoading: true })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素页面列表失败')
        }
        this.elementpagelist = res.data
        this.total = res.totalRecord
      },
      nowPage() {
        this.queryInfo.pagenum = 1
        this.getelementpagelist()
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getelementpagelist()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getelementpagelist()
      },
      addcase() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('elementpage/addelementpage', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加元素页面失败')
          }
          this.$message.success('添加元素页面成功')
          // 隐藏添加元素页面的对话框
          this.addElementPageVisible = false
          // 重新获取元素页面列表数据
          this.getelementpagelist()
        })
      },
      //  重置添加表单
      addElementPageClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        this.$refs.addFormRef.resetFields()
      },
      // 重置修改表单
      editElementPageClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 展示修改元素页面对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('elementpage/idelementpage', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取元素页面信息失败')
        }
        this.editForm = res.data
        this.aeidtElementPageVisible = true
      },
      editCaseInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改元素页面的请求
          const { data: res } = await this.$http.post('elementpage/editelementpage', {
            id: this.editForm.id,
            element_page_name: this.editForm.element_page_name
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改元素页面信息失败')
          }
          this.$message.success('修改元素页面成功')
          // 隐藏修改元素页面的对话框
          this.aeidtElementPageVisible = false
          // 重新获取元素页面列表数据
          this.getelementpagelist()
        })
      },
      // 根据ID删除元素页面信息
      async removeCaseById(id) {
        // 弹窗询问元素页面是否删除数据
        const confirmResult = await this.$confirm('此操作将删除该元素页面, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果元素页面确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('elementpage/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取元素页面列表数据
        this.getelementpagelist()
      }
    }
  })
</script>
<style lang="less" scoped>
.el-table {
  margin-top: 15px;
}
</style>
