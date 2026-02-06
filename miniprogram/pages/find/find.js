// pages/find/find.js
var app = getApp()
Page({
  data: {
    pre: app.globalData.pre,
    Allzp: [],
    id: "",
    dzList: [],
    loading: false, // 加载状态
    hasMore: true, // 是否还有更多数据
    currentFilter: 'latest', // 当前筛选条件: latest/hot/follow
    refreshing: false, // 下拉刷新状态
    pageSize: 10, // 每页数据量
    userInfo: null, // 用户信息
    showEmptyState: false, // 是否显示空状态
    showCommentInput: false, // 是否显示评论输入框
    currentWorkId: '', // 当前正在评论的作品ID
    commentContent: '' // 评论内容
  },
 
  onLoad(options) {
    // 获取用户登录状态
    this.getUserInfo();
    // 初始化页面数据
    this.setData({
      Allzp: []
    });
    this.initDzStatus();
    this.loadData(0, 0, true);
  },
  
  onShow: function () {
    // 初始化点赞状态
    this.initDzStatus();
    
    // 检查是否显示空状态
    this.checkEmptyState();
  },
  
  // 获取用户信息和登录状态
  getUserInfo: function() {
    try {
      const id = wx.getStorageSync('id');
      if (id) {
        this.setData({ id: id });
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
          this.setData({ userInfo: userInfo });
        }
      } else {
        this.setData({ id: "", dzList: [], userInfo: null });
      }
    } catch (e) {
      console.error('获取用户信息失败', e);
      this.setData({ id: "", dzList: [], userInfo: null });
    }
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    if (this.data.refreshing) return; // 防止重复刷新
    
    this.setData({
      refreshing: true,
      Allzp: [],
      hasMore: true
    });
    
    this.loadData(0, 0, true).then(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新成功',
        duration: 800
      });
    }).catch(() => {
      wx.stopPullDownRefresh();
      wx.showToast({
        title: '刷新失败',
        icon: 'none',
        duration: 1500
      });
    }).finally(() => {
      this.setData({ refreshing: false });
    });
  },
  
  // 上拉加载更多
  onReachBottom: function() {
    // 由于使用getallzp获取全部数据，无需上拉加载更多
    if (this.data.loading || !this.data.hasMore) return;
    
    wx.showToast({
      title: '已获取全部数据',
      icon: 'none',
      duration: 1500
    });
    this.setData({ hasMore: false });
  },
  
  // 初始化点赞状态
  initDzStatus() {
    // 简单处理，将dzList初始化为空数组
    this.setData({ dzList: [] });
  },
  
  // 跳转到发布页面
  goSetZp() {
    if(this.data.id) {
      wx.navigateTo({
        url: '../setnewzp/setnewzp',
      });
    } else {
      wx.showToast({
        title: '请您先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
    }
  },
  
  // 跳转到作品详情页面
  goToWorkDetail(e) {
    const id = e.currentTarget.dataset.id;
    console.log('跳转到作品详情，ID:', id);
    wx.navigateTo({
      url: '../zpDetail/zpDetail?id=' + id
    });
  },
  

  
  // 安全隐藏loading的工具方法
  safeHideLoading: function() {
    try {
      wx.hideLoading();
    } catch (e) {
      // 忽略已经隐藏的错误
      console.warn('隐藏loading时出现异常:', e);
    }
  },
  
  // 处理点赞
  HandleDz: function(e) {
    console.log('点赞操作触发，事件数据:', e);
    const id = e.currentTarget.dataset.id;
    console.log('作品ID:', id);
    
    if (!this.data.id) {
      wx.showToast({
        title: '请您先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }
    
    // 显示操作中状态
    wx.showLoading({
      title: '处理中...',
      mask: true
    });
    
    // 直接调用后端API，不进行本地乐观更新
    wx.request({
      url: this.data.pre + '/dz',
      method: 'POST',
      data: {
        id: this.data.id, // 添加用户ID参数
        zpid: id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('点赞响应:', res);
        
        if (res.data && res.data.code === 0) {
          // 调用成功后，重新从后端获取最新数据
          this.loadData(0, 0, true);
          wx.showToast({
            title: '操作成功',
            duration: 800
          });
        } else {
          wx.showToast({
            title: (res.data && res.data.msg) || '操作失败',
            icon: 'none',
            duration: 1500
          });
        }
      },
      fail: (err) => {
        console.error('点赞请求失败', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none',
          duration: 1500
        });
      },
      complete: () => {
        // 确保在所有情况下loading都会被隐藏
        this.safeHideLoading();
      }
    });
  },
  
  // 处理评论点击
  HandleCommentClick: function(e) {
    const id = e.currentTarget.dataset.id;
    
    if (!this.data.id) {
      wx.showToast({
        title: '请您先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }
    
    // 打开评论输入框
    this.setData({
      showCommentInput: true,
      currentWorkId: id,
      commentContent: ''
    });
  },
  
  // 关闭评论输入框
  closeCommentInput: function() {
    this.setData({
      showCommentInput: false,
      currentWorkId: '',
      commentContent: ''
    });
  },
  
  // 输入评论内容
  onCommentInput: function(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  
  // 发送评论
  sendComment: function() {
    const { commentContent, currentWorkId } = this.data;
    
    if (!commentContent.trim()) {
      wx.showToast({
        title: '请输入评论内容',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    wx.showLoading({
      title: '发送评论中...',
      mask: true
    });
    
    // 直接调用后端API发送评论
    wx.request({
      url: this.data.pre + '/pl',
      method: 'POST',
      data: {
          zpid: currentWorkId,
          userid: this.data.id,
          content: commentContent.trim()
        },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('发送评论响应:', res);
        
        if (res.data && res.data.code === 0) {
          // 调用成功后，重新从后端获取最新数据
          this.loadData(0, 0, true);
          wx.showToast({
            title: '评论成功',
            duration: 800
          });
          this.closeCommentInput();
        } else {
          // 处理服务器错误或其他失败情况
          if (res.statusCode === 500) {
            wx.showToast({
              title: '服务器暂时无法处理请求，请稍后重试',
              icon: 'none',
              duration: 2000
            });
          } else {
            wx.showToast({
              title: (res.data && res.data.msg) || '评论失败',
              icon: 'none',
              duration: 1500
            });
          }
        }
      },
      fail: (err) => {
        console.error('发送评论请求失败', err);
        this.safeHideLoading();
        wx.showToast({
          title: '网络错误，请检查网络连接后重试',
          icon: 'none',
          duration: 1500
        });
      },
      complete: () => {
        // 确保在所有情况下loading都会被隐藏
        this.safeHideLoading();
      }
    });
  },
  
  // 分享功能
  onShareAppMessage: function() {
    return {
      title: '智安盾头盔 - 车友圈',
      path: '/pages/find/find',
      imageUrl: '../../static/images/tkimg.png'
    };
  },
  
  // 加载数据
  loadData: function(start, limit, isRefresh) {
    // 避免重复加载
    if (this.data.loading) {
      return Promise.resolve();
    }
    
    // 如果没有更多数据，直接返回
    if (!this.data.hasMore && !isRefresh) {
      return Promise.resolve();
    }
    
    this.setData({ loading: true });
    
    return new Promise((resolve, reject) => {
      wx.request({
        url: this.data.pre + '/getallzp',
        data: {},
        success: (res) => {
          console.log('获取作品数据响应完整:', res);
          console.log('响应数据:', res.data);
          
          // 兼容不同的响应格式
          let newData = [];
          
          // 1. 处理Spring Boot的Result格式响应
          if (res.data && typeof res.data === 'object') {
            console.log('响应类型检查 - code:', res.data.code);
            console.log('响应类型检查 - data存在性:', res.data.data !== undefined);
            
            if (res.data.code === 0) {
              // 成功响应，code为0
              newData = res.data.data || [];
              console.log('通过code=0获取数据，长度:', newData.length);
            } else if (res.data.success) {
              // 另一种成功格式
              newData = res.data.data || [];
              console.log('通过success标志获取数据，长度:', newData.length);
            }
          } else if (Array.isArray(res.data)) {
            // 如果直接返回数组
            newData = res.data;
            console.log('直接返回数组，长度:', newData.length);
          }
          
          // 输出原始数据结构
          if (newData.length > 0) {
            console.log('数据项示例:', newData[0]);
          }
          
          // 去重处理
          const uniqueData = this.removeDuplicatesByZpid(newData);
          
          // 直接设置数据，使用后端返回的'pl'字段
          this.setData({ 
            Allzp: uniqueData,
            hasMore: false // 全部数据已获取
          });
          
          // 检查是否显示空状态
          this.checkEmptyState();
          
          // 打印加载的数据量
          console.log('成功加载作品数据，原始数据:', newData.length, '条，去重后:', uniqueData.length, '条');
          
          // 显示加载成功的toast提示
          wx.showToast({
            title: `加载了${uniqueData.length}条作品`,
            icon: 'none',
            duration: 1500
          });
          
          resolve();
        },
        fail: (err) => {
          console.error('网络请求失败:', err);
          wx.showToast({
            title: '获取数据失败，请检查网络',
            icon: 'none',
            duration: 2000
          });
          reject(new Error('网络错误，请重试'));
        },
        complete: () => {
          this.setData({ loading: false });
        }
      });
    });
  },
  
  // 根据id去重
  removeDuplicatesByZpid: function(data) {
    const seen = new Set();
    return data.filter(item => {
      // 确保使用id作为唯一标识（主键从zpid改为id）
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  },
  
  // 检查是否显示空状态
  checkEmptyState: function() {
    this.setData({
      showEmptyState: this.data.Allzp.length === 0
    });
  },
  
  // 切换筛选条件
  switchFilter: function(e) {
    const filter = e.currentTarget.dataset.filter;
    if (filter === this.data.currentFilter) return;
    
    this.setData({
      currentFilter: filter,
      loading: true
    });
    
    // 重新加载全部数据
    this.loadData(0, 0, true).then(() => {
      // 在前端进行数据筛选处理
      let filteredData = [...this.data.Allzp];
      
      switch(filter) {
        case 'hot':
          // 按点赞数降序排列
          filteredData.sort((a, b) => (b.zpdz || 0) - (a.zpdz || 0));
          break;
        case 'latest':
        default:
          // 按时间降序排列（默认）
          // 时间字段从zptime改为zpsj，优先使用zpsj
          filteredData.sort((a, b) => new Date(b.zpsj) - new Date(a.zpsj));
          break;
      }
      
      // 更新筛选后的数据
      this.setData({
        Allzp: filteredData,
        loading: false
      });
      
      // 检查空状态
      this.checkEmptyState();
    });
  },
  
  // 重新加载数据
  reloadData: function() {
    this.setData({
      Allzp: [],
      hasMore: true
    });
    this.loadData(0, this.data.pageSize, true);
  }
});