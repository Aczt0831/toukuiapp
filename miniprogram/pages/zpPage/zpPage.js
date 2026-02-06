// pages/zpPage/zpPage.js
const app = getApp();

Page({
  data: {
    pre: app.globalData.pre,
    id: "",
    zpid: "",
    userId: "", // 用户ID参数，用于加载用户作品列表
    zp: {},
    userWorks: [], // 用户作品列表
    isUserWorksMode: false, // 是否为用户作品列表模式
    pl: [],
    isShowEmptyComment: true,
    ispl: false,
    isFocus: false,
    plcontent: "",
    plNum: 0,
    dzList: [],
    isdz: false,
    loading: false,
    errorMsg: '',
    isImageLoading: true,
    systemInfo: wx.getSystemInfoSync() || {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    try {
      // 尝试获取缓存中的用户ID
      try {
        const cachedUserId = wx.getStorageSync('id');
        if (cachedUserId) {
          this.setData({ id: cachedUserId });
        }
      } catch (e) {
        console.error('获取缓存失败:', e);
      }
      
      // 初始化页面数据
      this.setData({
        zpid: options.zpid || "",
        userId: options.userId || ""
      });
      
      // 判断是作品详情模式还是用户作品列表模式
      this.setData({
        isUserWorksMode: !!this.data.userId
      });
      
      // 根据模式加载不同内容
      this.loadPageData();
    } catch (error) {
      console.error('页面加载异常:', error);
      this.setData({
        loading: false,
        errorMsg: '页面加载失败，请重试'
      });
    }
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    // 保存更新的数据到本地缓存
    if (this.data.zpid) {
      wx.setStorageSync('updatedZpid', this.data.zpid);
      wx.setStorageSync('updatedDzNum', this.data.zp.zpdz);
      wx.setStorageSync('updatedCommentNum', this.data.plNum);
    }
  },

  /**
   * 加载页面所有数据
   */
  async loadPageData() {
    try {
      this.setData({ loading: true, errorMsg: '' });
      
      if (this.data.isUserWorksMode) {
        // 用户作品列表模式
        await this.getUserWorks();
      } else {
        // 作品详情模式
        if (!this.data.zpid) {
          throw new Error('作品ID不存在');
        }
        await Promise.all([
          this.getZp(),
          this.getPl(),
          this.getdz()
        ]);
      }
    } catch (error) {
      console.error('加载页面数据失败:', error);
      this.setData({ 
        errorMsg: error.message || '数据加载失败，请下拉刷新重试',
        loading: false 
      });
    } finally {
      this.setData({ loading: false });
    }
  },
  
  /**
   * 获取用户的所有作品
   */
  getUserWorks() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.data.userId) {
          throw new Error('用户ID不存在');
        }

        // 添加超时处理
        const timeout = setTimeout(() => {
          this.setData({ 
            errorMsg: '网络请求超时',
            loading: false 
          });
          reject(new Error('网络请求超时'));
        }, 10000); // 10秒超时

        wx.request({
          url: `${this.data.pre}/getUserWorks?userId=${this.data.userId}`,
          method: 'GET',
          success: (res) => {
            clearTimeout(timeout);
            console.log('用户作品列表请求结果:', res);
            if (res.data && Array.isArray(res.data.data)) {
              this.setData({ 
                userWorks: res.data.data,
                errorMsg: ''
              });
            } else {
              this.setData({ 
                errorMsg: '',
                userWorks: []
              });
              console.log('用户作品数据为空');
            }
            resolve();
          },
          fail: (error) => {
            clearTimeout(timeout);
            console.error('获取用户作品失败:', error);
            this.setData({ 
              errorMsg: '网络请求失败，请检查网络连接',
              userWorks: []
            });
            reject(error);
          },
          complete: () => {
            clearTimeout(timeout);
            this.setData({ loading: false });
          }
        });
      } catch (error) {
        console.error('getUserWorks内部错误:', error);
        this.setData({ 
          errorMsg: error.message,
          loading: false,
          userWorks: []
        });
        reject(error);
      }
    });
  },

  /**
   * 获取点赞信息
   */
  getdz() {
    return new Promise((resolve, reject) => {
      if (!this.data.id) {
        this.setData({ dzList: [], isdz: false });
        resolve();
        return;
      }

      wx.request({
        url: `${this.data.pre}/getdz?id=${this.data.id}`,
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.code === 0) {
            const dzList = res.data.data || [];
            const isdz = dzList.includes(this.data.zpid);
            this.setData({ dzList, isdz });
          }
          resolve();
        },
        fail: (error) => {
          console.error('获取点赞信息失败:', error);
          resolve(); // 不阻塞其他请求
        }
      });
    });
  },

  /**
   * 获取作品信息
   */
  getZp() {
    return new Promise((resolve, reject) => {
      if (!this.data.zpid) {
        this.setData({ 
          errorMsg: '作品不存在',
          loading: false 
        });
        reject(new Error('作品不存在'));
        return;
      }

      wx.request({
        url: `${this.data.pre}/getzpinfo?zpid=${this.data.zpid}`,
        method: 'GET',
        success: (res) => {
          console.log('作品信息请求结果:', res);
          if (res.data && res.data.data) {
            this.setData({ 
              zp: res.data.data || {},
              errorMsg: ''
            });
          } else {
            this.setData({ 
              errorMsg: '获取作品信息失败',
              zp: {}
            });
            console.log('作品数据为空');
          }
          this.setData({ loading: false });
          resolve();
        },
        fail: (error) => {
          console.error('获取作品信息失败:', error);
          this.setData({ 
            errorMsg: '网络请求失败',
            loading: false,
            zp: {}
          });
          reject(error);
        }
      });
    });
  },

  /**
   * 获取评论列表
   */
  getPl() {
    return new Promise((resolve, reject) => {
      if (!this.data.zpid) {
        resolve();
        return;
      }

      wx.request({
        url: `${this.data.pre}/getpl?zpid=${this.data.zpid}`,
        method: 'GET',
        success: (res) => {
          if (res.data && res.data.data) {
            // 排序评论，最新的在前面
            const sortedComments = res.data.data.sort((a, b) => {
              return new Date(b.time) - new Date(a.time);
            });
            
            this.setData({
              pl: sortedComments,
              plNum: sortedComments.length,
              isShowEmptyComment: sortedComments.length === 0
            });
          } else {
            this.setData({
              pl: [],
              plNum: 0,
              isShowEmptyComment: true
            });
          }
          resolve();
        },
        fail: (error) => {
          console.error('获取评论列表失败:', error);
          resolve(); // 不阻塞其他请求
        }
      });
    });
  },

  /**
   * 点赞功能
   */
  HandleDz() {
    // 震动反馈
    wx.vibrateShort().catch(() => console.log('震动功能不可用'));
    
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }

    const queryParams = `?id=${this.data.id}&zpid=${this.data.zpid}`;
    wx.request({
      url: `${this.data.pre}/dz${queryParams}`,
      method: 'POST',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '点赞成功',
            icon: 'success',
            duration: 800
          });
          // 更新数据
          this.getZp();
          this.getdz();
        } else {
          wx.showToast({
            title: '点赞失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (res) => {
        console.error('点赞请求失败', res);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 取消点赞
   */
  CancleDz() {
    // 震动反馈
    wx.vibrateShort().catch(() => console.log('震动功能不可用'));
    
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }

    const queryParams = `?id=${this.data.id}&zpid=${this.data.zpid}`;
    wx.request({
      url: `${this.data.pre}/cancledz${queryParams}`,
      method: 'POST',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '取消点赞成功',
            icon: 'success',
            duration: 800
          });
          // 更新数据
          this.getdz();
          this.getZp();
        } else {
          wx.showToast({
            title: '取消点赞失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (res) => {
        console.error('取消点赞请求失败', res);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 处理评论内容输入
   */
  Handleplcontent(e) {
    this.setData({
      plcontent: e.detail.value
    });
  },

  /**
   * 发布评论
   */
  setPl() {
    // 验证评论内容
    const content = this.data.plcontent?.trim();
    if (!content) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none',
        duration: 1500
      });
      return;
    }

    // 验证登录状态
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }

    // 编码评论内容
    const encodedContent = encodeURIComponent(content);
    const queryParams = `?id=${this.data.id}&zpid=${this.data.zpid}&content=${encodedContent}`;

    wx.showLoading({ title: '发布中...' });
    wx.request({
      url: `${this.data.pre}/pl${queryParams}`,
      method: 'POST',
      success: (res) => {
        if (res.data && res.data.code === 0) {
          wx.showToast({
            title: '发布成功',
            icon: 'success',
            duration: 1000
          });
          // 重新获取评论
          this.getPl();
          // 清空输入并关闭
          this.setData({
            ispl: false,
            isFocus: false,
            plcontent: ''
          });
        } else {
          wx.showToast({
            title: res.data?.msg || '发布失败',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('发布评论失败:', error);
        wx.showToast({
          title: '网络请求失败',
          icon: 'none',
          duration: 2000
        });
      },
      complete: () => {
        wx.hideLoading();
      }
    });
  },

  /**
   * 打开评论输入框
   */
  postpl: function (e) {
    if (!this.data.id) {
      wx.showToast({
        title: '请先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }

    let focus = e.currentTarget.dataset.focus;
    if (focus) {
      this.setData({
        ispl: true,
        isFocus: true,
      });
    }
  },

  /**
   * 关闭评论输入框
   */
  closeinput() {
    this.setData({
      ispl: false,
      isFocus: false,
      // 保留评论内容，用户可能希望继续编辑
    });
  },

  /**
   * 返回上一页
   */
  goBack() {
    // 优先使用navigateBack，否则使用switchTab
    const pages = getCurrentPages();
    if (pages.length > 1) {
      wx.navigateBack();
    } else {
      wx.switchTab({
        url: '../find/find',
      });
    }
  },
  
  /**
   * 从作品列表跳转到作品详情
   */
  goWorkDetail(e) {
    try {
      const zpid = e.currentTarget.dataset.zpid;
      if (!zpid) {
        wx.showToast({
          title: '作品信息异常',
          icon: 'none'
        });
        return;
      }
      
      wx.navigateTo({
        url: `/pages/zpPage/zpPage?zpid=${zpid}`,
        success: () => {
          console.log('跳转到作品详情成功');
        },
        fail: (err) => {
          console.error('跳转到作品详情失败:', err);
          if (err.errMsg.includes('timeout')) {
            wx.showToast({
              title: '网络繁忙，请稍后重试',
              icon: 'none'
            });
          } else if (err.errMsg.includes('page stack too deep')) {
            // 处理页面栈过深的情况
            wx.redirectTo({
              url: `/pages/zpPage/zpPage?zpid=${zpid}`,
              success: () => {
                console.log('重定向到作品详情成功');
              },
              fail: (redirectErr) => {
                console.error('重定向到作品详情失败:', redirectErr);
                wx.showToast({
                  title: '跳转失败，请返回后重试',
                  icon: 'none'
                });
              }
            });
          } else {
            wx.showToast({
              title: '跳转失败，请重试',
              icon: 'none'
            });
          }
        }
      });
    } catch (error) {
      console.error('goWorkDetail函数异常:', error);
      wx.showToast({
        title: '操作异常，请重试',
        icon: 'none'
      });
    }
  },

  /**
   * 图片预览
   */
  Motai() {
    if (!this.data.zp || !this.data.zp.zpimg) {
      return;
    }

    wx.previewImage({
      current: `data:image/jpeg;base64,${this.data.zp.zpimg}`,
      urls: [`data:image/jpeg;base64,${this.data.zp.zpimg}`],
      success: () => {
        console.log('预览图片成功');
      },
      fail: (error) => {
        console.error('预览图片失败:', error);
        wx.showToast({
          title: '预览失败',
          icon: 'none'
        });
      }
    });
  },

  /**
   * 图片加载完成
   */
  onImageLoad() {
    this.setData({ isImageLoading: false });
  },

  /**
   * 下拉刷新
   */
  onPullDownRefresh() {
    this.loadPageData().finally(() => {
      wx.stopPullDownRefresh();
    });
  }
});