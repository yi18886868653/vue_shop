<template>
    <div class="login_container">
      <div class="login_box">
              <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
    </div>
    <!--登录框-->
            <el-form ref="loginFromRef" :model="loginFrom" :rules="loginrules" label-width="0px" class="login_form">
            <!--账号框-->
              <el-form-item prop="username">
              <el-input v-model="loginFrom.username" prefix-icon="iconfont icon-user"></el-input>
              </el-form-item >
            <!--密码框-->
            <el-form-item prop="password">
              <el-input v-model="loginFrom.password" type="password" prefix-icon="iconfont icon-3702mima"></el-input>
              </el-form-item >
              <!--按钮-->
            <el-form-item>
              <el-button type="primary" @click="login">登陆</el-button>
              <el-button type="info" @click="resetLoginFrom">重置</el-button>
            </el-form-item >
            </el-form>
    </div>

    </div>
</template>
<script>
export default {
  data () {
    return {
      // 这里是登录表单的数据绑定对象
      loginFrom: {
        username: 'admin',
        password: '123456'
      },
      // 这是表单的注册规则对象
      loginrules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 点击重置按钮，重置表单
    resetLoginFrom () {
      this.$refs.loginFromRef.resetFields()
    },
    login () {
      this.$refs.loginFromRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginFrom)
        console.log(res)
        if (res.meta.status !== 200) return this.$message.error('登录失败!')
        this.$message.success('登录成功!')
        // 1. 将登录成功之后的 token,保存到客户端的 sessionStorage(会话机制/只在当前页面生效)中 localStorage(持久话机制/关闭页面也不会忘记数据)
        //   1.1 项目中除了登录之外的API接口,必须在登录之后才能访问
        //   1.2 token 只应在当前网站打开期间生效, 所以将 token 保存在 sessionStorage中
        window.sessionStorage.setItem('token', res.data.token)
        window.sessionStorage.setItem('id', res.data.id)
        window.sessionStorage.setItem('rid', res.data.rid)
        // 2. 通过编程式路由导航跳转到后台主页,路由地址是 /home
        this.$router.push('/home')
      })
    }
  }
}
</script>
<style lang="less" scoped>
.login_container {
  height: 100%;
  background-color: #5dbe8a;
}
.login_box {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;
  .avatar_box {
    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);
    padding: 10px;
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    box-shadow: 0 0 10px #ddd;
    background-color: #fff;
    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eeeeee;
    }
  }
  .login_form {
    box-sizing: border-box;
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
  }
  .btns {
    display: flex;
    justify-content: flex-end;
  }
}
</style>
