const app = getApp();

Page({
  data: {
    pre: app.globalData.pre,
    isLoading: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    // 可以在这里初始化一些数据或检查登录状态
    console.log('微信登录页面加载');
  },

  /**
   * 返回上一页
   */
  goBack: function() {
    wx.navigateBack({
      delta: 1,
      animationType: 'pop-out',
      animationDuration: 200
    });
  },

  /**
   * 处理微信登录（直接由按钮点击触发）
   */
  handleWechatLogin: function() {
    if (this.data.isLoading) {
      return; // 防止重复点击
    }

    this.setData({ isLoading: true });

    // 直接调用getUserProfile（必须放在点击事件直接回调中）
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户信息的用途
      success: (userInfoRes) => {
        console.log('获取用户信息成功:', userInfoRes);


        
  // 关键修改：将微信返回的 nickName 赋值给 username，统一字段名
  const userInfo = {
    ...userInfoRes.userInfo, // 保留原有其他字段（头像、性别等）
    username: userInfoRes.userInfo.nickName, // 新增 username 字段，值为微信昵称
    nickName: undefined // 可选：删除原有 nickName 字段，避免冗余
  };
  this.getLoginCode(userInfo);


      },
      fail: (error) => {
        console.error('获取用户信息失败:', error);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '请授权用户信息',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 获取登录凭证code
   */
  getLoginCode: function(userInfo) {
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          console.log('获取登录凭证code:', loginRes.code);
          // 将code和用户信息发送到服务器
          this.sendToServer(loginRes.code, userInfo);
        } else {
          console.error('登录失败:', loginRes);
          this.setData({ isLoading: false });
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('获取登录凭证失败:', error);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 将登录信息发送到服务器
   */
  sendToServer: function(code, userInfo) {
    wx.request({
      url: this.data.pre + '/wxLogin',
      method: 'POST',
      data: {
        code: code,
        userInfo: userInfo
      },
      header: {
        'content-type': 'application/json'
      },
      success: (res) => {
        this.setData({ isLoading: false });
        
        if (res.statusCode === 200 && res.data.code === 0) {
          // 登录成功，存储用户信息和token
          const loginData = res.data.data || {};
          
          // 存储用户信息到全局
          app.globalData.userInfo = loginData.userInfo || userInfo;
          app.globalData.token = loginData.token;
          app.globalData.id = loginData.userId || '';
          
          // 存储到本地缓存
          wx.setStorageSync('userInfo', app.globalData.userInfo);
          wx.setStorageSync('token', app.globalData.token);
          wx.setStorageSync('id', app.globalData.id);
          
          wx.showToast({
            title: '登录成功',
            icon: 'success',
            duration: 1500
          });
          
          // 延迟跳转到首页或上一页
          setTimeout(() => {
            // 返回首页
            wx.switchTab({
              url: '/pages/index/index'
            });
          }, 1500);
        } else {
          wx.showToast({
            title: res.data.message || '登录失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('服务器请求失败:', error);
        this.setData({ isLoading: false });
        wx.showToast({
          title: '网络请求失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 打开隐私政策
   */
  openPrivacyPolicy: function() {
    wx.navigateTo({
      url: '/pages/text/text?type=privacy'
    });
  },

  /**
   * 打开用户协议
   */
  openUserAgreement: function() {
    wx.navigateTo({
      url: '/pages/text/text?type=agreement'
    });
  }
});