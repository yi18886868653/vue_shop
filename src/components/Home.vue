<template>
<el-container class="home-container">
    <!-- 头部区域 -->
  <el-header>
      <div>
          <img src="../assets/css/w1.png" alt="">
          <span>自动化平台</span>
      </div>
      <div>
        <span>{{ rid }}&nbsp;</span>
        <el-button type="info" @click="logout" size="mini">退出</el-button>
      </div>
  </el-header>
  <!-- 页面主体 -->
  <el-container>
      <!-- 侧边栏 -->
      <el-aside :width="isCollapse ? '61px' : '200px'">
        <div class="toggle-button" @click="toggleCollpase">|||</div>
        <!-- 侧边栏菜单区域 -->
        <el-menu
          background-color="#333744"
          text-color="#fff"
          active-text-color="#409EFF"
          :unique-opened="true"
          :collapse="isCollapse"
          :collapse-transition="false"
          :router="true"
          :default-active="activePath"
        >
      <!-- 一级菜单 -->
      <el-submenu :index="item.id + ''" v-for="item in menulist" :key="item.id">
          <!-- 一级菜单模板区域 -->
        <template slot="title">
            <!-- 图标 -->
          <i class="el-icon-location"></i>
          <!--  -->
          <span>{{ item.authName }}</span>
        </template>
        <!-- 二级菜单 -->
          <el-menu-item :index="subIttem.path" v-for="subIttem in item.children"
          :key="subIttem.id" @click="saveNavState(subIttem.path)">
            <template slot="title">
            <!-- 图标 -->
          <i class="el-icon-location"></i>
          <!--  -->
          <span>{{ subIttem.authName }}</span>
        </template>
          </el-menu-item>
        </el-submenu>
    </el-menu>
    </el-aside>
    <!-- 右侧内容 -->
    <el-main>
      <!-- 路由占位符 -->
      <router-view></router-view>
    </el-main>
  </el-container>
</el-container>
</template>
<script>
export default {
  data() {
    return {
      // 左侧菜单数据
      menulist: [],
      isCollapse: false, // 是否折叠属性
      activePath: '',
      rid: window.sessionStorage.getItem('rid')
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout () {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    async getMenuList() {
      // 调用菜单栏接口 返回格式
      const { data: res } = await this.$http.get('/users/menus') // 接口名称 menus
      if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
      //   this.$message.success(res.meta.msg)
      //   res.data.unshift(this.welcome)
      this.menulist = res.data
      console.log(res, 'menus')
    },
    // 点击按钮,切换菜单的折叠和展开
    toggleCollpase() {
      this.isCollapse = !this.isCollapse
    },
    // b保存链接的值
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.hwelcome {
  color: #fff;
  font-size: 15px;
  height: 25px;
  text-align: center;
  background: green;
  span {
    margin-left: 10px;
  }
}
.home-container {
  height: 100%;
}
.el-header {
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  background-color: #373d3f;
  align-items: center;
  color: #fff;
  font-size: 20px;
  width: 100%;
  > div {
    display: flex;
    align-items: center;
    img {
      width: 60px;
      height: 60px;
      border-radius: 50%;
    }
    span {
      margin-left: 15px;
    }
  }
}
.el-aside {
  background-color: #333744;
  .el-menu {
    border-right: none;
  }
}
.el-main {
  background-color: #eaedf1;
}
.iconfont {
  padding-right: 10px;
}
.toggle-button {
  background: #4a5064;
  font-size: 10px;
  text-align: center;
  line-height: 24px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
