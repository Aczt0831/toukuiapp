var app=getApp()
Page({
  data: {
    pre:app.globalData.pre,
    qianm: "个性签名~",
    userinfo: [],
    id: ""
  },
  
  onShow() {
    let self = this;
    // 尝试获取缓存中的用户ID
    try {
      const userId = wx.getStorageSync('id');
      if (userId) {
        self.setData({
          id: userId
        })
        console.log('成功获取缓存中的用户ID:', self.data.id);
        self.getUserInfo();
      } else {
        // 缓存中没有数据
        console.log('缓存中没有用户ID数据');
        self.setData({
          userinfo: []
        })
      }
    } catch (e) {
      // 缓存操作失败的处理
      console.error('获取缓存失败:', e);
      wx.showToast({
        title: '获取用户信息失败',
        icon: 'none',
        duration: 2000
      });
      self.setData({
        userinfo: []
      })
    }
  },
  getUserInfo() {
    if (this.data.id) {
      wx.request({
        url: this.data.pre + '/getuserinfo?id=' + this.data.id,
        method: 'GET',
        success: (res) => {
          console.log('用户信息获取成功:', res);
          if (res.data && res.data.data) {
            this.setData({
              userinfo: res.data.data
            })
          }
        },
        fail: (err) => {
          console.error('用户信息请求失败:', err);
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none',
            duration: 2000
          });
        }
      })
    } else {
      this.setData({
        userinfo: []
      })
    }
  },
  godenglu() {
    wx.navigateTo({
      url: '/pages/Login/Login',
    });
  },
  goSet() {
    wx.navigateTo({
      url: '/pages/Set/Set',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },

  goStore() {
    wx.navigateTo({
      url: '/pages/store/store',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  goMaintenance() {
    wx.navigateTo({
      url: '/pages/maintenance/maintenance',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  goVideoPlayback() {
    wx.navigateTo({
      url: '/pages/videoPlayback/videoPlayback',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  goNetworkDate() {
    wx.navigateTo({
      url: '/pages/networkDate/networkDate',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  goCustomerService() {
    wx.navigateTo({
      url: '/pages/customerService/customerService',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  goUserWorks() {
    if (!this.data.id) {
      wx.showToast({
        title: '用户未登录',
        icon: 'none'
      });
      return;
    }
    
    wx.navigateTo({
      url: '/pages/zpPage/zpPage?userId=' + this.data.id,
      success: () => {
        console.log('跳转到用户作品页面成功');
      },
      fail: (err) => {
        console.error('跳转到用户作品页面失败:', err);
        if (err.errMsg.includes('timeout')) {
          wx.showToast({
            title: '网络繁忙，请稍后重试',
            icon: 'none'
          });
        } else {
          wx.showToast({
            title: '跳转失败，请重试',
            icon: 'none'
          });
        }
      }
    });
  }
})