Page({
  data: {
    id: "",
    settings: [
      {
        id: 'userInfo',
        title: '个人信息',
        icon: 'user-o',
        showArrow: true,
        authRequired: true
      },
      {
        id: 'notification',
        title: '通知设置',
        icon: 'bell-o',
        showArrow: true,
        authRequired: false
      },
      {
        id: 'privacy',
        title: '隐私设置',
        icon: 'shield-o',
        showArrow: true,
        authRequired: false
      },
      {
        id: 'about',
        title: '关于我们',
        icon: 'info-o',
        showArrow: true,
        authRequired: false
      },
      {
        id: 'feedback',
        title: '意见反馈',
        icon: 'chat-o',
        showArrow: true,
        authRequired: false
      }
    ],
    appVersion: '2.0.1'
  },
  
  onLoad(options) {
    this.checkLoginStatus();
  },
  
  onShow() {
    // 每次显示页面时检查登录状态
    this.checkLoginStatus();
  },
  
  checkLoginStatus() {
    let self = this;
    wx.getStorage({
      key: 'id',
      success: function (res) {
        if (res.data) {
          self.setData({
            id: res.data
          })
        } else {
          console.log('缓存中没有数据');
          self.setData({
            id: null
          })
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        self.setData({
          id: null
        });
      }
    });
  },
  
  Login() {
    wx.navigateTo({
      url: '/pages/Login/Login',
    });
  },
  
  tuichu() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除缓存中的数据
          wx.removeStorage({
            key: 'id',
            success: () => {
              this.setData({ id: null });
              wx.showToast({
                title: '退出成功！',
                duration: 1000
              });
            },
            fail: (err) => {
              console.log('清除缓存失败', err);
            }
          });
        }
      }
    });
  },
  
  goUserInfo() {
    wx.navigateTo({
      url: '/pages/userInfo/userInfo',
    });
  },
  
  handleSettingItemClick(e) {
    const { id } = e.currentTarget.dataset;
    
    // 检查是否需要登录
    if (this.data.settings.find(item => item.id === id)?.authRequired && !this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 根据不同的设置项进行不同的处理
    switch(id) {
      case 'notification':
        wx.navigateTo({
          url: '/pages/notification/notification'
        });
        break;
      case 'privacy':
        wx.navigateTo({
          url: '/pages/privacy/privacy'
        });
        break;
      case 'feedback':
        wx.navigateTo({
          url: '/pages/customerService/customerService',
        });
        break;
      case 'userInfo':
        this.goUserInfo();
        break;
    }
  },
  

})