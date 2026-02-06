// pages/privacy/privacy.js
Page({
  data: {
    // 数据权限设置
    locationPermission: true,
    usageDataPermission: true,
    // 个人信息展示设置
    showHelmetStatus: false,
    showLocation: false,
    // 缓存大小
    cacheSize: ''
  },

  onLoad() {
    this.loadPrivacySettings();
    this.calculateCacheSize();
  },

  // 从缓存加载隐私设置
  loadPrivacySettings() {
    const settings = wx.getStorageSync('privacySettings') || {};
    
    this.setData({
      locationPermission: settings.locationPermission !== undefined ? settings.locationPermission : true,
      usageDataPermission: settings.usageDataPermission !== undefined ? settings.usageDataPermission : true,
      showHelmetStatus: settings.showHelmetStatus !== undefined ? settings.showHelmetStatus : false,
      showLocation: settings.showLocation !== undefined ? settings.showLocation : false
    });
  },

  // 保存隐私设置到缓存
  savePrivacySettings() {
    const settings = {
      locationPermission: this.data.locationPermission,
      usageDataPermission: this.data.usageDataPermission,
      showHelmetStatus: this.data.showHelmetStatus,
      showLocation: this.data.showLocation
    };
    
    wx.setStorageSync('privacySettings', settings);
    
    // 可以在这里添加同步到服务器的代码
  },

  // 位置权限开关切换
  onLocationToggle(e) {
    const checked = e.detail;
    this.setData({
      locationPermission: checked
    });
    this.savePrivacySettings();
    
    if (checked) {
      // 请求位置权限
      wx.authorize({
        scope: 'scope.userLocation',
        success: () => {
          wx.showToast({
            title: '已开启位置权限',
            icon: 'success'
          });
        },
        fail: () => {
          wx.showModal({
            title: '权限提示',
            content: '需要位置权限以提供更好的服务，是否前往设置开启？',
            success: (res) => {
              if (res.confirm) {
                wx.openSetting();
              } else {
                // 如果用户拒绝，关闭开关
                this.setData({
                  locationPermission: false
                });
                this.savePrivacySettings();
              }
            }
          });
        }
      });
    }
  },

  // 使用数据权限开关切换
  onUsageDataToggle(e) {
    this.setData({
      usageDataPermission: e.detail
    });
    this.savePrivacySettings();
    
    if (e.detail) {
      wx.showToast({
        title: '感谢您帮助我们改进产品',
        icon: 'none'
      });
    }
  },

  // 头盔状态展示开关切换
  onHelmetStatusToggle(e) {
    this.setData({
      showHelmetStatus: e.detail
    });
    this.savePrivacySettings();
  },

  // 位置展示开关切换
  onShowLocationToggle(e) {
    const checked = e.detail;
    this.setData({
      showLocation: checked
    });
    this.savePrivacySettings();
    
    if (checked && !this.data.locationPermission) {
      // 如果开启位置展示但未开启位置权限，提示用户
      wx.showModal({
        title: '提示',
        content: '需要先开启位置权限才能允许他人查看您的位置',
        success: (res) => {
          if (res.confirm) {
            this.onLocationToggle({ detail: true });
          } else {
            // 如果用户拒绝，关闭位置展示开关
            this.setData({
              showLocation: false
            });
            this.savePrivacySettings();
          }
        }
      });
    }
  },

  // 查看隐私政策
  viewPrivacyPolicy() {
    wx.navigateTo({
      url: '/pages/text/text?title=隐私政策&contentType=privacy'
    });
  },

  // 查看用户协议
  viewTerms() {
    wx.navigateTo({
      url: '/pages/text/text?title=用户协议&contentType=terms'
    });
  },

  // 查看数据使用说明
  viewDataUsage() {
    wx.navigateTo({
      url: '/pages/text/text?title=数据使用说明&contentType=dataUsage'
    });
  },

  // 计算缓存大小
  calculateCacheSize() {
    wx.getStorageInfo({
      success: (res) => {
        let size = res.currentSize;
        let cacheSize = '';
        
        if (size < 1024) {
          cacheSize = size + 'KB';
        } else {
          cacheSize = (size / 1024).toFixed(2) + 'MB';
        }
        
        this.setData({
          cacheSize: cacheSize
        });
      }
    });
  },

  // 清除缓存
  clearCache() {
    wx.showModal({
      title: '清除缓存',
      content: '确定要清除所有缓存数据吗？',
      success: (res) => {
        if (res.confirm) {
          wx.clearStorage({
            success: () => {
              // 重新加载设置（因为我们的设置也在缓存中）
              this.loadPrivacySettings();
              this.setData({
                cacheSize: '0KB'
              });
              wx.showToast({
                title: '缓存清除成功',
                icon: 'success'
              });
            },
            fail: () => {
              wx.showToast({
                title: '缓存清除失败',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 导出个人数据
  exportUserData() {
    wx.showModal({
      title: '导出个人数据',
      content: '我们将准备您的个人数据，处理完成后会通知您下载',
      success: (res) => {
        if (res.confirm) {
          wx.showToast({
            title: '正在准备数据...',
            icon: 'loading',
            duration: 2000
          });
          
          // 模拟数据导出延迟
          setTimeout(() => {
            wx.showModal({
              title: '导出完成',
              content: '您的个人数据已准备完成，是否立即下载？',
              success: (res) => {
                if (res.confirm) {
                  wx.showToast({
                    title: '开始下载',
                    icon: 'success'
                  });
                  // 实际项目中这里应该调用下载API
                }
              }
            });
          }, 2000);
        }
      }
    });
  },

  // 生命周期方法 - 页面卸载时保存设置
  onUnload() {
    this.savePrivacySettings();
  }
})