// 获取全局应用实例
const app = getApp();
// 引入API工具类
const { api } = require('../../utils/api');

Page({
  data: {
    pre: app.globalData.pre,
    isSee: true, // 密码可见性控制
    password: "",
    account: ""
  },
  
  // 账号输入处理
  AccInput(e) {
    this.setData({
      account: e.detail.value
    });
  },
  
  // 密码输入处理
  PassInput(e) {
    this.setData({
      password: e.detail.value
    });
  },
  
  // 返回上一页
  back() {
    wx.navigateBack({
      delta: 1,
      animationType: 'pop-out',
      animationDuration: 200
    });
  },
  
  // 显示密码
  changeSee() {
    this.setData({
      isSee: false
    });
  },
  
  // 隐藏密码
  changeSee2() {
    this.setData({
      isSee: true
    });
  },
  
  // 跳转到注册页面
  register() {
    wx.navigateTo({
      url: '/pages/Register/Register'
    });
  },
  
  // 登录处理
  login() {
    // 调试信息输出
    console.log('输入的账号:', this.data.account);
    console.log('输入的密码:', this.data.password);
    
    // 表单验证
    if (!this.data.account) {
      wx.showToast({
        title: '账号未填写',
        image: '../../static/images/!.png',
        duration: 2000
      });
      return;
    } 
    
    if (!this.data.password) {
      wx.showToast({
        title: '密码未填写',
        image: '../../static/images/!.png',
        duration: 2000
      });
      return;
    }
    
    // 调用登录API
    api.login(this.data.account, this.data.password)
      .then(res => {
        console.log('登录请求返回结果:', res);
        
        // 处理返回的用户ID（兼容不同的返回格式）
        const userId = typeof res === 'string' ? res : (res.data || res);
        
        // 保存用户ID到本地缓存
        wx.setStorage({
          key: 'id',
          data: userId,
          success: () => {
            // 登录成功后延迟跳转
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/user/user'
              });
            }, 500);
            
            wx.showToast({
              title: '登录成功！',
              duration: 500
            });
          },
          fail: (err) => {
            console.error('缓存保存失败:', err);
            // 即使缓存失败也允许用户进入，只是下次可能需要重新登录
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/user/user'
              });
            }, 500);
            
            wx.showToast({
              title: '登录成功但缓存保存失败',
              icon: 'none',
              duration: 2000
            });
          }
        });
        })
        .catch(err => {
          console.error('登录失败:', err);
          wx.showToast({
            title: '登录失败，请检查账号密码',
            icon: 'none',
            duration: 2000
          });
        });
    }
  }
);

