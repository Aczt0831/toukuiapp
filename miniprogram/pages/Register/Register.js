// 获取全局应用实例
const app = getApp();

Page({
  data: {
    pre: app.globalData.pre,
    isSee: true, // 密码可见性控制
    password: "",
    password2: "",
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
  
  // 确认密码输入处理
  PassInput2(e) {
    this.setData({
      password2: e.detail.value
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
  
  // 切换密码可见状态
  changeSee() {
    // 简单的取反操作，一次性切换密码显示状态
    this.setData({
      isSee: !this.data.isSee
    });
  },
  
  // 注册处理函数
  Register() {
    // 解构获取表单数据
    const { account, password, password2 } = this.data;
    
    // 表单验证 - 账号不能为空
    if (!account) {
      wx.showToast({
        title: '账号未填写',
        image: '../../static/images/!.png',
        duration: 2000
      });
      return;
    }
    
    // 表单验证 - 密码不能为空
    if (!password) {
      wx.showToast({
        title: '密码未填写',
        image: '../../static/images/!.png',
        duration: 2000
      });
      return;
    }
    
    // 表单验证 - 两次输入的密码必须一致
    if (password !== password2) {
      wx.showToast({
        title: '两次密码不一致',
        image: '../../static/images/!.png',
        duration: 2000
      });
      return;
    }

    // 显示加载提示
    wx.showLoading({
      title: '注册中...',
      mask: true
    });

    // 发送注册请求到服务器
    wx.request({
      url: `${this.data.pre}/register`,
      method: 'POST',
      data: {
        account,
        password
      },
      timeout: 10000,
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        wx.hideLoading();
        
        // 判断注册是否成功
        if (res.statusCode === 200 && res.data.code === 0) {
          wx.showToast({
            title: '注册成功！',
            duration: 500
          });
          
          // 延迟跳转到登录页面
          setTimeout(() => {
            wx.navigateTo({
              url: '/pages/Login/Login'
            });
          }, 500);
        } else {
          wx.showToast({
            title: res.data.message || '注册失败',
            image: "../../static/images/!.png",
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        let errMsg = '网络请求失败';
        if (err.errMsg.includes('timeout')) {
          errMsg = '请求超时';
        }
        wx.showToast({
          title: errMsg,
          image: "../../static/images/!.png",
          duration: 2000
        });
        console.error('注册失败详情:', err);
      }
    });
  },
  
  handleWechatLogin() {
    console.log('跳转到微信登录页面');
    wx.navigateTo({
      url: '/pages/wxLogin/wxLogin'
    });
  }
});

  