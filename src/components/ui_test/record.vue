<template>
    <div>
        <!-- 面包屑导入区 -->
        <el-breadcrumb separator="/">
        <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>web自动化</el-breadcrumb-item>
        <el-breadcrumb-item>执行任务</el-breadcrumb-item>
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
                    <el-button type="primary" @click="addRecordVisible = true ">添加任务</el-button>
                </el-col>
            </el-row>

            <el-table :data='recordlist' border stripe >
                <el-table-column type="index" label="@"></el-table-column>
                <el-table-column label="任务名称" prop="record_name"></el-table-column>
                <el-table-column label="关联用例" prop="case_id"></el-table-column>
                <el-table-column label="定时任务" prop="run_time"></el-table-column>
                <el-table-column label="创建人" prop="user_name"></el-table-column>
                <el-table-column label="创建时间" prop="create_time"></el-table-column>
                <el-table-column label="操作" width="250px">
                  <!-- slot-scope拿到这一行的动态数据 -->
                    <template slot-scope="scope">
                        <!-- 修改按钮 -->
                        <el-button type="primary" icon="el-icon-edit" size="mini" circle @click="showEditDialog(scope.row.id)"></el-button>
                        <!-- 删除按钮 -->
                        <el-button type="danger" icon="el-icon-delete" size="mini" circle @click="removeCaseById(scope.row.id)"></el-button>
                        <el-button type="primary" class="el-icon-caret-right" round size="mini" @click="test_record(scope.row.id)">调试</el-button>
                        <el-button type="primary" class="el-icon-caret-right" round size="mini" @click="run_record(scope.row.id)">运行</el-button>

                    </template>
                    <template></template>
                </el-table-column>
            </el-table>
        </el-card>
                <!-- 添加case的对话框 -->
        <!-- 关闭事件@close 绑定 addRecordClosed  -->
        <el-dialog
          title="添加任务" :visible.sync="addRecordVisible"
          width="50%" @close='addRecordClosed'>
          <!-- 内容主体区域 -->
          <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
          <el-form :model="addForm" :rules="recordFormRules"
          ref="addFormRef" label-width="15%">
            <el-form-item label="任务名称" prop="record_name">
              <el-input v-model="addForm.record_name" style="width: 90%;"></el-input>
            </el-form-item>
            <el-form-item label="关联用例" prop="case_id">
                <el-select multiple collapse-tags v-model="addForm.case_id" style="width: 30%;" placeholder="方法" filterable>
                      <el-option
                            v-for="item in caselist"
                            :key="item.id"
                            :label="item.case_name"
                            :value="item.id">
                        </el-option>
                </el-select>
            </el-form-item>
            <el-form-item format label="定时任务" prop="run_time">
                <el-time-select
                v-model="addForm.run_time"
                :picker-options="{
                start: '00:00',
                step: '00:30',
                end: '24:00'
                }"
            placeholder="选择时间">
                </el-time-select>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="addRecordVisible = false">取 消</el-button>
            <el-button type="primary" @click="addrecord">确 定</el-button>
          </span>
        </el-dialog>
        <!-- 修改任务对话框 -->
        <el-dialog
          title="修改任务" :visible.sync="eidtCaseVisible"
          width="50%" @close='editRecordClosed'>
          <el-form :model="editForm" :rules="eidtFormRules"
          ref="editFormRef" label-width="80px">
            <el-form-item label="任务名称" prop="record_name">
              <el-input v-model="editForm.record_name"></el-input>
            </el-form-item>
            <el-form-item label="关联用例" prop="case_id">
                <el-select multiple v-model="editForm.case_id" style="width: 30%;" placeholder="方法" filterable>
                      <el-option
                            v-for="item in caselist"
                            :key="item.id"
                            :label="item.case_name"
                            :value="item.id">
                        </el-option>
                </el-select>
            </el-form-item>
            <el-form-item label="定时任务">
              <el-time-select v-model="editForm.run_time"
                :picker-options="{
                start: '00:00',
                step: '00:30',
                end: '24:00'
                }"
            placeholder="选择时间">
                </el-time-select>
            </el-form-item>
          </el-form>
          <!-- 底部按钮区域 -->
          <span slot="footer" class="dialog-footer">
            <el-button @click="eidtCaseVisible = false">取 消</el-button>
            <el-button type="primary" @click="editRcordInfo">确 定</el-button>
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
        //   获取任务列表的参数对象
        recordlist: [],
        caselist: [],
        total: 0,
        //  默认隐藏添加任务
        addRecordVisible: false,
        // 控制修改任务对话框的显示隐藏
        eidtCaseVisible: false,
        addForm: {
          record_name: '',
          case_id: '',
          run_time: '',
          user_id: window.sessionStorage.getItem('id')
        },
        // 添加record的验证规则对象
        recordFormRules: {
          record_name: [
            { required: true, message: '请输入任务名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          case_id: [
            { required: true, message: '请选择关联用例', trigger: 'blur' }
          ]
        },
        // 修改record的验证规则对象
        eidtFormRules: {
          record_name: [
            { required: true, message: '请输入任务名', trigger: 'blur' },
            { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
          ],
          case_id: [
            { required: true, message: '请选择关联用例', trigger: 'blur' }
          ],
          run_time: [
            { required: true, message: '请选择关联用例', trigger: 'blur' }
          ]
        },
        // 排序用到的信息
        sortFrom: {
          sort: '',
          sort1: ''
        },
        // 编辑时查询到的任务信息对象
        editForm: {}
      }
    },
    created() {
      this.getrecordlist()
      this.getcaselist()
    },
    mounted() {
      this.rowDrop()
    },
    methods: {
      async getrecordlist() {
        const { data: res } = await this.$http.get('record', { params: this.queryInfo })
        if (res.meta.status !== 200) {
          return this.$message.error('获取任务列表失败')
        }
        this.recordlist = res.data
        this.total = res.totalRecord
      },
      async getcaselist() {
        const { data: res } = await this.$http.get('case', { params: { pagenum: 1, pagesize: 1000 } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取用例列表失败')
        }
        this.caselist = res.data
      },
      nowPage() {
        this.queryInfo.pagenum = 1
        this.getrecordlist()
      },
      //   监听pagesize改变的事件
      handleSizeChange(newSize) {
        // consolo.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getrecordlist()
      },
      //   监听 页码值 的改变事件
      handleCurrentChange(newPage) {
        // consolo.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getrecordlist()
      },
      addrecord() {
        this.$refs.addFormRef.validate(async valid => {
          // 验证失败直接return
          if (!valid) return
          const { data: res } = await this.$http.post('record/addrecord', this.addForm)
          if (res.meta.status !== 200) {
            return this.$message.error('添加任务失败')
          }
          this.$message.success('添加任务成功')
          // 隐藏添加任务的对话框
          this.addRecordVisible = false
          // 重新获取任务列表数据
          this.getrecordlist()
        })
      },
      //  重置添加表单
      addRecordClosed() {
        // <!-- 方法引用表单引用的数据，然后通过重置方法重置表单数据 -->
        // 偶发下拉加延迟函数才生效
        setTimeout(() => {
          this.$refs.addFormRef.resetFields()
        }, 100)
      },
      // 重置修改表单
      editRecordClosed() {
        setTimeout(() => {
          this.$refs.editFormRef.resetFields()
        }, 100)
      },
      async sortTable() {
        const { data: res } = await this.$http.post('case/editcase', this.sortFrom)
        if (res.meta.status !== 200) {
          return this.$message.error('排序修改失败')
        }
        this.$message.success('排序修改成功')
        // 重新获取任务列表数据
        this.getrecordlist()
      },
      //  排序
      rowDrop() {
        const tbody = document.querySelector('.el-table__body-wrapper tbody')
        const that = this
        Sortable.create(tbody, {
          onEnd({ newIndex, oldIndex }) {
            if (newIndex === oldIndex) return
            that.sortFrom.sort = that.recordlist[oldIndex].sort
            that.sortFrom.sort1 = that.recordlist[newIndex].sort
            // 这后面的是实时保存拖拽结果，并且获取最新的列表顺序，需要和后端配合
            that.sortTable()
          }
        })
      },
      // 展示修改任务对话框
      async showEditDialog(id) {
        const { data: res } = await this.$http.get('record/idrecord', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('获取任务信息失败')
        }
        this.editForm = res.data
        this.eidtCaseVisible = true
      },
      editRcordInfo() {
        this.$refs.editFormRef.validate(async valid => {
          // 失败直接return
          if (!valid) return
          // 可以发起修改任务的请求
          const { data: res } = await this.$http.post('record/editrecord', {
            id: this.editForm.id,
            record_name: this.editForm.record_name,
            run_time: this.editForm.run_time,
            case_id: this.editForm.case_id
          })
          if (res.meta.status !== 200) {
            return this.$message.error('修改任务信息失败')
          }
          this.$message.success('修改任务成功')
          // 隐藏修改任务的对话框
          this.eidtCaseVisible = false
          // 重新获取任务列表数据
          this.getrecordlist()
        })
      },
      // 根据ID删除任务信息
      async removeCaseById(id) {
        // 弹窗询问任务是否删除数据
        const confirmResult = await this.$confirm('此操作将删除该任务, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果任务确认删除，则返回值为字符串 confirm 反之 cancel
        // console.log(confirmResult)
        if (confirmResult !== 'confirm') {
          return this.$message.info('取消删除')
        }
        const { data: res } = await this.$http.get('record/delete', { params: { id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('删除失败')
        }
        this.$message.success('删除成功')
        // 重新获取任务列表数据
        this.getrecordlist()
      },
      async test_record(id) {
        const { data: res } = await this.$http.get('record/case', { params: { run: 2, record_id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('执行任务失败')
        }
      },
      async run_record(id) {
        const { data: res } = await this.$http.get('record/jenkins', { params: { run: 2, record_id: id } })
        if (res.meta.status !== 200) {
          return this.$message.error('执行任务失败')
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
