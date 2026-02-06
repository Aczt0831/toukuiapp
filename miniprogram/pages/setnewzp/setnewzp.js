// pages/setnewzp/setnewzp.js
var app = getApp()
Page({
  data: {
    pre: app.globalData.pre,
    id: "",
    addImg: "",
    zptext: "",
    zpcontent: "",
    loading: false,
    maxTitleLength: 50,
    maxContentLength: 500,
    disabled: false
  },
  onLoad() {
    this.checkLoginStatus();
  },
  onShow() {
    let self = this;
    // 每次显示页面时都重新获取登录状态
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
            id: res.data,
            disabled: false
          })
        } else {
          console.log('缓存中没有登录信息');
          self.setData({
            disabled: true
          });
          wx.showModal({
            title: '提示',
            content: '请先登录',
            showCancel: false,
            success(res) {
              if (res.confirm) {
                wx.navigateTo({
                  url: '../Login/Login'
                })
              }
            }
          });
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        self.setData({
          disabled: true
        });
        wx.showModal({
          title: '提示',
          content: '请先登录',
          showCancel: false,
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../Login/Login'
              })
            }
          }
        });
      }
    });
  },
  // 标题输入处理
  textinput(e) {
    const value = e.detail.value;
    // 限制标题字数
    if (value.length <= this.data.maxTitleLength) {
      this.setData({
        zptext: value
      });
    }
  },
  // 内容输入处理
  contentinput(e) {
    const value = e.detail.value;
    // 限制内容字数
    if (value.length <= this.data.maxContentLength) {
      this.setData({
        zpcontent: value
      });
    }
  },
  // 选择图片
  postImg() {
    wx.chooseImage({
      count: 1, // 选择一张图片
      sizeType: ['compressed'], // 压缩图片
      sourceType: ['album', 'camera'], // 可从相册或相机选择
      success: (res) => {
        // 选择图片成功后，将图片路径设置到盒子中
        const tempFilePaths = res.tempFilePaths;
        this.setData({
          addImg: tempFilePaths[0]
        });
        
        // 显示图片选择成功提示
        wx.showToast({
          title: '图片已选择',
          icon: 'none',
          duration: 1000
        });
      },
      fail: (err) => {
        console.log('选择图片失败', err);
        if (err.errMsg !== 'chooseImage:fail cancel') {
          wx.showToast({
            title: '选择图片失败',
            icon: 'none',
            duration: 1500
          });
        }
      }
    });
  },
  // 表单验证
  validateForm() {
    if (!this.data.zptext.trim()) {
      wx.showToast({
        title: '请输入作品标题',
        icon: 'none',
        duration: 1500
      });
      return false;
    }
    
    if (!this.data.zpcontent.trim()) {
      wx.showToast({
        title: '请输入作品内容',
        icon: 'none',
        duration: 1500
      });
      return false;
    }
    
    if (!this.data.addImg) {
      wx.showToast({
        title: '请选择作品图片',
        icon: 'none',
        duration: 1500
      });
      return false;
    }
    
    return true;
  },
  // 提交表单
  postAll() {
    // 检查表单
    if (!this.validateForm()) {
      return;
    }
    
    // 设置加载状态
    this.setData({
      loading: true
    });
    
    wx.uploadFile({
      url: this.data.pre + '/setzp',
      filePath: this.data.addImg,
      name: 'file',
      formData: {
        'id': this.data.id,
        'title': this.data.zptext.trim(),
        'content': this.data.zpcontent.trim()
      },
      success: (res) => {
        try {
          const fanhui = JSON.parse(res.data);
          console.log('发布结果:', fanhui);
          
          if (fanhui.code === 0) {
            wx.showToast({
              title: '发布成功！',
              icon: 'success',
              duration: 1500,
              complete: function() {
                // 发布成功后跳转到社区界面
                setTimeout(function() {
                  wx.switchTab({
                    url: '/pages/find/find'
                  });
                }, 1500);
              }
            });
          } else {
            wx.showToast({
              title: fanhui.msg || '发布失败！',
              icon: 'none',
              duration: 2000
            });
          }
        } catch (e) {
          console.error('解析返回数据失败:', e);
          wx.showToast({
            title: '服务器返回数据异常',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: function (res) {
        console.error('上传失败', res);
        wx.showToast({
          title: '网络异常，请重试',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        // 无论成功失败，都关闭加载状态
        this.setData({
          loading: false
        });
      }
    });
  }
});