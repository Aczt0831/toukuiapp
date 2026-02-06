// pages/userInfo/userInfo.js
var app = getApp()
Page({
  data: {
    pre: app.globalData.pre,
    qianm: "个性签名~",
    userinfo: [],
    id: "",
    show: false,
    show2: false,
    stylist: "",
    stylist2: ""
  },
  
  onLoad() {
    // 页面加载时不提前选择组件，避免加载时序问题
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
        } else {
          // 缓存中没有数据的情况下的处理逻辑
          console.log('缓存中没有数据');
          self.setData({
            userinfo: [],
            id: ''
          })
          // 提示用户登录
          wx.showToast({
            title: '请先登录',
            icon: 'none',
            duration: 1500
          });
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        self.setData({
          userinfo: [],
          id: ''
        })
      }
    });
  },
  
  // 格式化时间函数 - 优化版
  formatDate(dateStr) {
    // 健壮性检查
    if (!dateStr || dateStr === null || dateStr === undefined) {
      return '暂无数据';
    }
    
    // 尝试解析时间字符串
    const date = new Date(dateStr);
    
    // 检查是否是有效的日期
    if (isNaN(date.getTime())) {
      console.warn('无效的日期格式:', dateStr);
      return '暂无数据';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  },
  
  // 获取用户信息
  getUserInfo() {
    if (this.data.id) {
      wx.request({
        url: this.data.pre + '/getuserinfo?id=' + this.data.id,
        method: 'GET',
        success: (res) => {
          console.log(res);
          // 确保返回的数据格式正确
          if (res.data && res.data.data && res.data.data.length > 0) {
            const userData = res.data.data;
            
            // 格式化时间
            if (userData[0].createTime) {
              userData[0].createTime = this.formatDate(userData[0].createTime);
            }
            if (userData[0].lastLoginTime) {
              userData[0].lastLoginTime = this.formatDate(userData[0].lastLoginTime);
            }
            
            this.setData({
              userinfo: userData,
              stylist: userData[0].styleList || '',
              stylist2: userData[0].username || '未设置昵称'
            })
          } else {
            console.error('用户信息格式不正确');
            wx.showToast({
              title: '获取用户信息失败',
              icon: 'none'
            });
          }
        },
        fail: (err) => {
          console.error('获取用户信息请求失败', err);
          wx.showToast({
            title: '网络错误，请稍后重试',
            icon: 'none'
          });
        }
      })
    }
  },
  
  // 打开个性签名编辑
  changeStyList() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    this.setData({
      show: true
    })
  },
  
  // 打开昵称编辑
  changeName() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    this.setData({
      show2: true
    })
  },
  
  // 更换头像
  changeTx() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths;
        
        // 显示上传中提示
        wx.showLoading({
          title: '上传中...',
          mask: true
        });
        
        wx.uploadFile({
          url: this.data.pre + '/usertx',
          filePath: tempFilePaths[0],
          name: 'file',
          formData: {
            'id': this.data.id,
          },
          success: (res) => {
            wx.hideLoading();
            console.log('图片上传成功', res.data);
            try {
              const result = JSON.parse(res.data);
              if (result.code === 0) {
                wx.showToast({
                  title: '头像更新成功',
                  icon: 'success'
                });
                this.getUserInfo();
              } else {
                wx.showToast({
                  title: result.message || '更新失败',
                  icon: 'none'
                });
              }
            } catch (e) {
              // 如果返回不是JSON格式，也尝试更新
              wx.showToast({
                title: '头像更新成功',
                icon: 'success'
              });
              this.getUserInfo();
            }
          },
          fail: (err) => {
            wx.hideLoading();
            console.log('图片上传失败', err);
            wx.showToast({
              title: '上传失败，请重试',
              icon: 'none'
            });
          }
        });
      }
    });
  },
  
  // 关闭弹窗
  onClose() {
    this.setData({ show: false });
  },
  
  onClose2() {
    this.setData({ show2: false });
  },
  
  // 输入监听
  ListInput(e) {
    this.setData({
      stylist: e.detail.value
    });
  },
  
  ListInput2(e) {
    this.setData({
      stylist2: e.detail.value
    });
  },
  
  // 保存个性签名
  baocun() {
    if (!this.data.stylist.trim()) {
      wx.showToast({
        title: '请输入个性签名',
        icon: 'none'
      });
      return;
    }
    
    const queryParams = `?id=${this.data.id}&stylelist=${encodeURIComponent(this.data.stylist)}`;
    
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    wx.request({
      url: this.data.pre + '/stylelist' + queryParams,
      method: 'POST',
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '修改成功',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                this.getUserInfo();
                this.setData({ show: false });
              }, 1500);
            }
          });
        } else {
          wx.showToast({
            title: res.data?.message || '修改失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (res) => {
        wx.hideLoading();
        console.error('请求失败', res);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 保存昵称
  baocun2() {
    if (!this.data.stylist2.trim()) {
      wx.showToast({
        title: '请输入用户名',
        icon: 'none'
      });
      return;
    }
    
    const queryParams = `?id=${this.data.id}&username=${encodeURIComponent(this.data.stylist2)}`;
    
    wx.showLoading({
      title: '保存中...',
      mask: true
    });
    
    wx.request({
      url: this.data.pre + '/username' + queryParams,
      method: 'POST',
      success: (res) => {
        wx.hideLoading();
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '修改成功',
            duration: 1500,
            success: () => {
              setTimeout(() => {
                this.getUserInfo();
                this.setData({ show2: false });
              }, 1500);
            }
          });
        } else {
          wx.showToast({
            title: res.data?.message || '修改失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (res) => {
        wx.hideLoading();
        console.error('请求失败', res);
        wx.showToast({
          title: '网络错误，请稍后重试',
          icon: 'none'
        });
      }
    });
  },
  
  // 编辑个人资料按钮点击
  editProfile() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    wx.showActionSheet({
      itemList: ['修改昵称', '修改个性签名', '更换头像'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0:
            // 修改昵称
            this.changeName();
            break;
          case 1:
            // 修改个性签名
            this.changeStyList();
            break;
          case 2:
            // 更换头像
            this.changeTx();
            break;
        }
      }
    });
  },
  
  // 账号安全按钮点击
  accountSecurity() {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      });
      return;
    }
    
    // 跳转到账号安全页面
    wx.navigateTo({
      url: '../accountSecurity/accountSecurity'
    });
  },
  
  // 退出登录功能 
  logout() {
    if (!this.data.id) {
      wx.showToast({
        title: '您尚未登录',
        icon: 'none'
      });
      return;
    }
    
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        const networkType = res.networkType;
        if (networkType === 'none') {
          wx.showToast({
            title: '当前无网络连接',
            icon: 'none'
          });
          return;
        }
        
        wx.showModal({
          title: '退出登录',
          content: '确定要退出登录吗？',
          confirmColor: '#FF4D4F',
          success: (res) => {
            if (res.confirm) {
              // 显示加载提示
              wx.showLoading({
                title: '正在退出...',
                mask: true
              });
              
              // 清除登录状态
              wx.removeStorage({
                key: 'id',
                success: () => {
                  // 清除其他可能的用户相关缓存
                  wx.removeStorage({
                    key: 'userInfo',
                    fail: () => {
                    }
                  });
                  
                  this.setData({
                    id: '',
                    userinfo: [],
                    qianm: '个性签名~'
                  });
                  
                  wx.hideLoading();
                  wx.showToast({
                    title: '已退出登录',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                      // 返回首页
                      setTimeout(() => {
                        wx.switchTab({
                          url: '../index/index'
                        });
                      }, 1500);
                    }
                  });
                },
                fail: (err) => {
                  wx.hideLoading();
                  console.error('清除登录状态失败', err);
                  wx.showToast({
                    title: '退出失败，请重试',
                    icon: 'none'
                  });
                }
              });
            }
          }
        });
      },
      fail: () => {
        // 网络检查失败时仍允许退出
        wx.showModal({
          title: '退出登录',
          content: '确定要退出登录吗？',
          success: (res) => {
            if (res.confirm) {
              // 退出登录逻辑（简化版）
              wx.removeStorage({
                key: 'id',
                success: () => {
                  this.setData({
                    id: '',
                    userinfo: []
                  });
                  wx.showToast({
                    title: '已退出登录',
                    icon: 'success',
                    duration: 1500,
                    success: () => {
                      setTimeout(() => {
                        wx.switchTab({
                          url: '../index/index'
                        });
                      }, 1500);
                    }
                  });
                }
              });
            }
          }
        });
      }
    });
  }

})