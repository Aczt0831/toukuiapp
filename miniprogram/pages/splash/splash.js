Page({
  data: {
  },

  onLoad: function (options) {
    this.checkUserStatus();
  },

  onReady: function () {
  },

  onShow: function () {
  },

  onHide: function () {
  },

  onUnload: function () {
  },

  checkUserStatus: function() {
    const that = this;
    
    setTimeout(() => {
      that.navigateToMainPage();
    }, 2000);
  },

  navigateToMainPage: function() {
    wx.switchTab({
      url: '/pages/index/index',
      success: function() {
        console.log('成功跳转到首页');
      },
      fail: function(error) {
        console.error('跳转失败:', error);
        wx.navigateTo({
          url: '/pages/index/index'
        });
      }
    });
  }
});