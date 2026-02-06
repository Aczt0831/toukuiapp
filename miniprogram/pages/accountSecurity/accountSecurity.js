// pages/accountSecurity/accountSecurity.js
var app = getApp()
Page({
  data: {
    pre: app.globalData.pre,
    id: '',
    username: '',
    passwordStatus: '未设置密码',
    phoneStatus: '未绑定',
    lastLoginInfo: '暂无记录'
  },

  onLoad() {
    // 页面加载时执行
  },

  onShow() {
    this.checkLoginStatus();
  },

  // 检查登录状态
  checkLoginStatus() {
    let self = this;
    wx.getStorage({
      key: 'id',
      success: function (res) {
        if (res.data) {
          self.setData({
            id: res.data
          })
          self.getUserInfo();
          self.checkSecurityStatus();
        } else {
          // 未登录状态
          self.setData({
            id: '',
            username: '',
            passwordStatus: '未设置密码',
            phoneStatus: '未绑定',
            lastLoginInfo: '未登录'
          })
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        self.setData({
          id: '',
          username: '',
          passwordStatus: '未设置密码',
          phoneStatus: '未绑定',
          lastLoginInfo: '未登录'
        })
      }
    });
  },

  // 获取用户信息
  getUserInfo() {
    if (this.data.id) {
      wx.request({
        url: this.data.pre + '/getuserinfo?id=' + this.data.id,
        method: 'GET',
        success: (res) => {
          console.log('获取用户信息:', res);
          if (res.data && res.data.data && res.data.data.length > 0) {
            const userData = res.data.data[0];
            this.setData({
              username: userData.username || '未设置'
            });
            
            // 更新最后登录信息
            if (userData.lastLoginTime) {
              const formattedTime = this.formatDate(userData.lastLoginTime);
              this.setData({
                lastLoginInfo: formattedTime
              });
            }
          }
        },
        fail: (err) => {
          console.error('获取用户信息失败', err);
        }
      });
    }
  },

  // 检查账号安全状态
  checkSecurityStatus() {
    if (this.data.id) {
      // 这里可以调用接口检查密码和手机号状态
      wx.request({
        url: this.data.pre + '/checkSecurityStatus?id=' + this.data.id,
        method: 'GET',
        success: (res) => {
          console.log('安全状态检查:', res);
          // 实际项目中根据接口返回更新状态
          if (res.data && res.data.code === 0) {
            this.setData({
              passwordStatus: res.data.hasPassword ? '已设置' : '未设置',
              phoneStatus: res.data.hasPhone ? res.data.phone : '未绑定'
            });
          }
        },
        fail: (err) => {
          console.error('检查安全状态失败', err);
          // 失败时保持默认状态
        }
      });
    }
  },

  // 格式化时间函数
  formatDate(dateStr) {
    if (!dateStr) return '暂无记录';
    
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '暂无记录';
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },

  // 返回上一页
  navigateBack() {
    wx.navigateBack();
  },

  // 修改密码
  changePassword() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '修改密码',
      content: '请输入新密码',
      editable: true,
      placeholderText: '请输入6-20位新密码',
      success: (res) => {
        if (res.confirm && res.content) {
          const newPassword = res.content.trim();
          
          // 简单的密码验证
          if (newPassword.length < 6 || newPassword.length > 20) {
            wx.showToast({
              title: '密码长度应为6-20位',
              icon: 'none'
            });
            return;
          }
          
          wx.showLoading({
            title: '修改中...',
            mask: true
          });
          
          // 调用修改密码接口
          wx.request({
            url: this.data.pre + '/changePassword',
            method: 'POST',
            data: {
              id: this.data.id,
              newPassword: newPassword
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '密码修改成功',
                  icon: 'success',
                  duration: 1500
                });
                this.setData({
                  passwordStatus: '已设置'
                });
              } else {
                wx.showToast({
                  title: res.data?.message || '修改失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              console.error('修改密码失败', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 绑定手机号
  bindPhone() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showModal({
      title: '绑定手机号',
      content: '请输入手机号码',
      editable: true,
      placeholderText: '请输入11位手机号码',
      success: (res) => {
        if (res.confirm && res.content) {
          const phone = res.content.trim();
          
          // 简单的手机号验证
          if (!/^1[3-9]\d{9}$/.test(phone)) {
            wx.showToast({
              title: '请输入正确的手机号码',
              icon: 'none'
            });
            return;
          }
          
          wx.showLoading({
            title: '绑定中...',
            mask: true
          });
          
          // 调用绑定手机号接口
          wx.request({
            url: this.data.pre + '/bindPhone',
            method: 'POST',
            data: {
              id: this.data.id,
              phone: phone
            },
            success: (res) => {
              wx.hideLoading();
              if (res.data && res.data.code === 0) {
                wx.showToast({
                  title: '手机号绑定成功',
                  icon: 'success',
                  duration: 1500
                });
                // 显示部分手机号
                const maskedPhone = phone.substring(0, 3) + '****' + phone.substring(7);
                this.setData({
                  phoneStatus: maskedPhone
                });
              } else {
                wx.showToast({
                  title: res.data?.message || '绑定失败',
                  icon: 'none'
                });
              }
            },
            fail: (err) => {
              wx.hideLoading();
              console.error('绑定手机号失败', err);
              wx.showToast({
                title: '网络错误，请稍后重试',
                icon: 'none'
              });
            }
          });
        }
      }
    });
  },

  // 登录历史
  loginHistory() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.request({
      url: this.data.pre + '/getLoginHistory?id=' + this.data.id,
      method: 'GET',
      success: (res) => {
        console.log('登录历史:', res);
        if (res.data && res.data.code === 0 && res.data.data && res.data.data.length > 0) {
          // 显示登录历史列表
          const historyList = res.data.data.map(item => {
            return {
              time: this.formatDate(item.loginTime),
              device: item.device || '未知设备',
              ip: item.ip || '未知IP'
            };
          });
          
          // 构建历史记录文本
          let historyText = '最近登录记录:\n';
          historyList.forEach((item, index) => {
            historyText += `${index + 1}. ${item.time}\n  设备: ${item.device}\n  IP: ${item.ip}\n`;
          });
          
          wx.showModal({
            title: '登录历史',
            content: historyText,
            showCancel: true,
            confirmText: '确定',
            cancelText: '关闭'
          });
        } else {
          wx.showModal({
            title: '登录历史',
            content: '暂无登录记录',
            showCancel: false
          });
        }
      },
      fail: (err) => {
        console.error('获取登录历史失败', err);
        wx.showToast({
          title: '获取登录历史失败',
          icon: 'none'
        });
      }
    });
  },

  // 隐私设置
  privacySettings() {
    wx.navigateTo({
      url: '../privacy/privacy'
    });
  },

  // 联系客服
  contactCustomerService() {
    wx.navigateTo({
      url: '../customerService/customerService'
    });
  }
})