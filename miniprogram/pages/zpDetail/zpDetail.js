// 作品详情页面逻辑
const app = getApp()

Page({
  // 页面数据
  data: {
    pre: app.globalData.pre,  // API前缀
    workDetail: null,        // 作品详情数据
    loading: true,           // 加载状态标志
    id: '',                  // 作品ID
    userId: '',              // 当前用户ID
    userInfo: null,          // 用户信息
    dzList: [],              // 存储已点赞的作品ID列表
    showCommentInput: false, // 评论输入框显示状态
    commentContent: '',      // 评论内容
    imageError: false,       // 图片加载错误标志
    imageLoading: false,     // 图片加载中状态
    comments: []             // 存储评论列表数据
  },

  // 图片数据调试函数
  debugImageData: function(imageData) {
    if (!imageData) {
      console.log(' 调试信息：无图片数据');
      return;
    }
    
    console.log('图片数据详细调试信息:');
    console.log('1. 数据类型:', typeof imageData);
    console.log('2. 数据长度:', imageData.length);
    console.log('3. 前50字符:', imageData.substring(0, 50));
    console.log('4. 后50字符:', imageData.substring(imageData.length - 50));
    console.log('5. 是否以data:image开头:', imageData.startsWith('data:image'));
    console.log('6. 是否包含base64:', imageData.includes('base64'));
    
    if (imageData.startsWith('data:image')) {
      const matches = imageData.match(/data:image\/([^;]+);base64,(.+)/);
      if (matches) {
        console.log('7. 图片格式:', matches[1]);
        console.log('8. Base64数据长度:', matches[2].length);
        console.log('9. Base64前50字符:', matches[2].substring(0, 50));
        
        // 验证base64格式
        const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
        const isValidBase64 = base64Pattern.test(matches[2]);
        console.log('10. Base64格式有效性:', isValidBase64);
        
        if (!isValidBase64) {
          console.warn('⚠️Base64数据格式可能有问题');
          // 检查常见的无效字符
          const invalidChars = matches[2].match(/[^A-Za-z0-9+/=]/g);
          if (invalidChars) {
            console.warn('发现无效字符:', [...new Set(invalidChars)]);
          }
        }
      } else {
        console.warn(' Data URL格式解析失败');
      }
    } else {
      console.log('7. 非Data URL格式，检查是否为纯base64:');
      const base64Pattern = /^[A-Za-z0-9+/]+={0,2}$/;
      const isValidBase64 = base64Pattern.test(imageData);
      console.log('8. 纯Base64格式有效性:', isValidBase64);
      
      if (!isValidBase64) {
        console.warn('可能不是有效的base64数据');
        // 检查常见的无效字符
        const invalidChars = imageData.match(/[^A-Za-z0-9+/=]/g);
        if (invalidChars) {
          console.warn('发现无效字符:', [...new Set(invalidChars)].slice(0, 10)); // 只显示前10个
        }
      }
    }
    
    console.log('调试信息结束');
  },

  // 页面加载时执行
  onLoad(options) {
    console.log('收到的页面参数:', options);
    
    // 检查是否有作品ID
    if (options.id) {
      this.setData({ id: options.id });
      
      // 初始化数据加载
    this.getUserInfo();       // 获取用户信息
    this.initDzStatus();      // 初始化点赞状态
    this.loadComments();      // 加载评论列表
    
    // 先尝试从API获取数据
    this.getWorkDetail();
      
      // 设置备用机制：如果5秒后页面仍是loading状态，使用模拟数据
      this.loadingTimer = setTimeout(() => {
        if (this.data.loading) {
          console.log('API请求超时，使用模拟数据');
          this.getBackupData();
        }
      }, 5000);
    } else {
      // 没有ID时给出提示
      wx.showToast({
        title: '作品ID不存在',
        icon: 'none',
        duration: 2000
      });
      this.setData({ loading: false });
    }
  },
  
  // 页面卸载时清除定时器
  onUnload() {
    if (this.loadingTimer) {
      clearTimeout(this.loadingTimer);
    }
  },
  
  // 从本地缓存获取用户信息
  getUserInfo() {
    try {
      const userId = wx.getStorageSync('id');
      
      if (userId) {
        this.setData({ userId: userId });
        
        // 尝试获取用户详细信息
        const userInfo = wx.getStorageSync('userInfo');
        if (userInfo) {
          this.setData({ userInfo: userInfo });
        }
      }
    } catch (e) {
      console.error('读取用户信息时出错', e);
    }
  },
  
  // 从服务器获取作品详细信息
  getWorkDetail() {
    const { id } = this.data;
    
    // 显示加载提示
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    
    // 使用正确的接口路径和参数格式
    const apiUrl = `${this.data.pre}/getzpinfo?zpid=${id}`;
    console.log(`尝试请求接口: ${apiUrl}`);
    
    try {
      wx.request({
        url: apiUrl,
        method: 'GET',
        // 超时设置
        timeout: 10000,
        success: (res) => {
          console.log('作品详情数据:', res);
          
          try {
            // 检查响应是否成功，处理Map<String, Object>格式的响应数据
            if (res.data && res.data.code === 0 && res.data.data) {
              // 直接使用Map<String, Object>格式的响应数据
              let workDetail = res.data.data;
              
              // 处理不同字段名称的兼容 - 后端可能返回不同的字段名
              if (workDetail.zpbt && !workDetail.zptitle) {
                workDetail.zptitle = workDetail.zpbt; // 标题字段映射
              }
              if (workDetail.zpnr && !workDetail.zpcontent) {
                workDetail.zpcontent = workDetail.zpnr; // 内容字段映射
              }
              if (workDetail.zptp && !workDetail.zpimg) {
                workDetail.zpimg = workDetail.zptp; // 图片字段映射
              }
              
              // 特别处理点赞数字段 - 确保正确从MySQL数据库获取点赞数
              if (typeof workDetail.zpdz === 'undefined' || workDetail.zpdz === null) {
                // 检查其他可能的字段名
                if (typeof workDetail.dzcount === 'number') {
                  workDetail.zpdz = workDetail.dzcount;
                } else if (typeof workDetail.likeCount === 'number') {
                  workDetail.zpdz = workDetail.likeCount;
                } else if (typeof workDetail.likes === 'number') {
                  workDetail.zpdz = workDetail.likes;
                } else {
                  // 如果没有任何点赞数字段，默认设置为0
                  workDetail.zpdz = 0;
                }
                console.log('点赞数字段处理完成，当前点赞数:', workDetail.zpdz);
              }
              
              // 评论数字段使用后端返回的'pl'字段
              if (typeof workDetail.pl === 'undefined' || workDetail.pl === null) {
                // 如果没有评论数字段，默认设置为0
                workDetail.pl = 0;
                console.log('未找到评论数字段，默认设置pl=0');
              }
              
              console.log('图片数据检查:', {
                hasZpimg: !!workDetail.zpimg,
                zpimgType: typeof workDetail.zpimg,
                zpimgLength: workDetail.zpimg ? workDetail.zpimg.length : 0,
                hasZptp: !!workDetail.zptp,
                zptpType: typeof workDetail.zptp,
                zptpLength: workDetail.zptp ? workDetail.zptp.length : 0,
                // 添加点赞数信息到日志
                dzCount: workDetail.zpdz
              });
              
              // 统一图片字段处理 - 确保zpimg字段可用
              if (!workDetail.zpimg && workDetail.zptp) {
                workDetail.zpimg = workDetail.zptp;
                console.log('使用zptp替换zpimg');
              }
              
              // 检查图片数据格式，确保是正确的data URL格式
              if (workDetail.zpimg) {
                // 确保数据不为空
                workDetail.zpimg = workDetail.zpimg.trim();
                
                console.log('原始图片数据详情:', {
                  length: workDetail.zpimg.length,
                  isString: typeof workDetail.zpimg === 'string',
                  first50: workDetail.zpimg.substring(0, 50),
                  last50: workDetail.zpimg.substring(workDetail.zpimg.length - 50),
                  hasDataPrefix: workDetail.zpimg.startsWith('data:image'),
                  hasBase64Prefix: workDetail.zpimg.includes('base64')
                });
                
                // 处理MySQL BLOB数据转换的问题
                // 检查是否是有效的base64数据
                if (!workDetail.zpimg.startsWith('data:image')) {
                  // 如果不是data URL格式，尝试添加前缀
                  if (workDetail.zpimg.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
                    // 纯base64字符串
                    console.log('检测到纯base64数据，添加data:image前缀');
                    workDetail.zpimg = 'data:image/jpeg;base64,' + workDetail.zpimg;
                  } else if (workDetail.zpimg.length > 100) {
                    // 可能是其他格式的二进制数据，尝试转换
                    console.log('检测到可能的二进制数据，尝试转换为base64');
                    try {
                      // 如果数据看起来像被错误编码的字符串，尝试清理
                      let cleanedData = workDetail.zpimg.replace(/[^\w\s+=\/]/g, '').trim();
                      if (cleanedData.length > 0 && cleanedData.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
                        workDetail.zpimg = 'data:image/jpeg;base64,' + cleanedData;
                        console.log('成功清理并转换图片数据');
                      } else {
                        console.warn('图片数据格式无法识别，使用默认图片');
                        workDetail.zpimg = null;
                      }
                    } catch (err) {
                      console.error('图片数据转换失败:', err);
                      workDetail.zpimg = null;
                    }
                  } else {
                    console.warn('图片数据太短，可能无效');
                    workDetail.zpimg = null;
                  }
                }
                
                // 验证最终的图片数据格式
                if (workDetail.zpimg && workDetail.zpimg.startsWith('data:image')) {
                  console.log('最终图片数据详情:', {
                    length: workDetail.zpimg.length,
                    hasDataPrefix: workDetail.zpimg.startsWith('data:image'),
                    first100: workDetail.zpimg.substring(0, 100)
                  });
                } else {
                  console.warn('图片数据格式验证失败');
                  workDetail.zpimg = null;
                }
              }
              console.log('图片数据处理完成，最终状态:', workDetail.zpimg ? '有图片' : '无图片');
              
              // 更新页面数据
              this.setData({
                workDetail: workDetail,
                imageLoading: !!workDetail.zpimg, // 如果有图片则设置为加载中状态
                imageError: false // 重置错误状态
              });

              // 添加图片数据调试信息
              this.debugImageData(workDetail.zpimg);
              
              // 作品详情加载完成后，重新初始化点赞状态（从本地缓存恢复）
              this.initDzStatus();
              
              // 作品详情加载完成后，重新加载评论列表
              this.loadComments();
              
              console.log('页面数据已更新，作品信息应该显示，点赞数:', workDetail.zpdz);
            } else if (res.statusCode === 404) {
              // 特别处理404错误
              console.error('API接口不存在:', apiUrl);
              wx.showToast({
                title: '请求的接口不存在',
                icon: 'none',
                duration: 2000
              });
            } else {
              // 显示错误提示，使用Map格式中的msg字段
              wx.showToast({
                title: (res.data && res.data.msg) || '获取作品详情失败',
                icon: 'none',
                duration: 2000
              });
            }
          } catch (error) {
            console.error('处理响应数据时出错:', error);
            wx.showToast({
              title: '数据处理异常',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          // 请求失败处理
          console.error('网络请求失败:', err);
          wx.showToast({
            title: '网络错误，请重试',
            icon: 'none',
            duration: 2000
          });
          // 请求失败时也尝试恢复点赞状态
          this.initDzStatus();
        },
        complete: () => {
          // 确保在所有情况下loading都会被隐藏
          try {
            wx.hideLoading();
          } catch (e) {
            // 忽略已经隐藏的错误
          }
          this.setData({ loading: false });
        }
      });
    } catch (unexpectedError) {
      console.error('获取作品详情时发生意外错误:', unexpectedError);
      // 确保在所有异常情况下都隐藏loading
      try {
        wx.hideLoading();
      } catch (e) {
        // 忽略已经隐藏的错误
      }
      this.setData({ loading: false });
      // 异常情况下也尝试恢复点赞状态
      this.initDzStatus();
      wx.showToast({
        title: '获取作品详情失败',
        icon: 'none',
        duration: 2000
      });
    }
  },
  
  // 获取备用数据，用于接口不可用时的模拟展示
  getBackupData() {
    // 提供模拟数据，确保页面至少能显示基本内容
    // 添加一个简单的base64示例图片（一个1x1的灰色像素）
    const sampleBase64Img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
    
    const mockData = {
      id: this.data.id,
      zptitle: '示例作品标题',
      zpcontent: '这是一个示例作品内容。由于API接口暂时不可用，这里显示模拟数据。',
      zpimg: sampleBase64Img,
      zptp: sampleBase64Img,
      zpsj: new Date().toLocaleString(),
      username: '示例用户',
      usertx: sampleBase64Img,
      zpdz: 0,
      zppl: 0
    };
    
    this.setData({
      workDetail: mockData,
      loading: false
    });
    
    wx.showToast({
      title: '使用模拟数据展示',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 返回作品列表
  backToFind: function() {
    wx.navigateBack();
  },
  
  // 初始化点赞状态 - 从本地缓存恢复
  initDzStatus() {
    try {
      // 从本地缓存获取已点赞的作品ID列表
      const likedWorks = wx.getStorageSync('likedWorks') || [];
      
      // 如果有当前作品信息，检查是否已点赞
      const { workDetail } = this.data;
      const currentDzList = [];
      
      if (workDetail && workDetail.id) {
        const workIdStr = workDetail.id.toString();
        // 如果当前作品在本地缓存的点赞列表中，添加到dzList
        if (likedWorks.includes(workIdStr)) {
          currentDzList.push(workIdStr);
        }
      } else {
        // 如果还没有作品信息，先设置为空数组
        console.log('作品信息尚未加载，点赞状态暂时初始化为空');
      }
      
      this.setData({ dzList: currentDzList });
      console.log('点赞状态初始化完成，当前点赞列表:', currentDzList);
    } catch (e) {
      console.error('初始化点赞状态失败:', e);
      this.setData({ dzList: [] });
    }
  },
  
  // 处理点赞
  handleDz: function() {
    const { workDetail, userId, dzList } = this.data;
    
    // 登录检查
    if (!userId) {
      wx.showToast({
        title: '请您先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }
    
    // 作品信息检查
    if (!workDetail || !workDetail.id) {
      console.error('作品详情数据不存在或不完整');
      wx.showToast({
        title: '作品信息异常',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    const workIdStr = workDetail.id.toString();
    const isLiked = dzList.includes(workIdStr);
    
    // 立即进行本地乐观更新，提供即时反馈
    this.updateLikedStateLocally(isLiked, workIdStr);
    
    // 显示加载提示
    wx.showLoading({
      title: isLiked ? '取消点赞中...' : '点赞中...',
      mask: true
    });
    
    // 隐藏loading的统一函数
    const safeHideLoading = () => {
      try {
        wx.hideLoading();
      } catch (e) {
        // 忽略已经隐藏的错误
        console.warn('隐藏loading时出现异常:', e);
      }
    };
    
    const endpoint = isLiked ? '/cancledz' : '/dz';
    const queryParams = `?zpid=${workDetail.id}`;
    
    try {
      wx.request({
        url: this.data.pre + endpoint + queryParams,
        method: 'POST',
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          console.log('点赞/取消点赞响应:', res);
          
              // 本地状态已在点击时更新，这里只处理服务器反馈
          safeHideLoading();
            
    // 移除重复的Toast调用，避免与下面的success回调冲突
          
          // 检查响应状态码
          if (res.statusCode !== 200) {
            console.error('服务器返回错误状态码:', res.statusCode);
            // 即使服务器错误，UI也已经更新，只显示提示
            wx.showToast({
              title: `服务器错误(${res.statusCode})，已在本地更新状态`,
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          // 检查响应数据格式
          if (!res.data || typeof res.data !== 'object') {
            console.error('无效的响应数据格式');
            wx.showToast({
              title: '响应格式异常，已在本地更新状态',
              icon: 'none',
              duration: 2000
            });
            return;
          }
          
          // 处理成功响应
          if (res.data.code === 0) {
            wx.showToast({
              title: isLiked ? '取消点赞成功' : '点赞成功',
              duration: 800
            });
            
            // 如果后端返回了点赞数，则使用后端数据更新
            if (res.data.data && typeof res.data.data.zpdz === 'number') {
              this.setData({
                'workDetail.zpdz': res.data.data.zpdz
              });
            }
          } else {
            // 服务器返回了业务错误，显示具体错误信息但保持本地更新
            wx.showToast({
              title: res.data.msg || '操作异常',
              icon: 'none',
              duration: 2000
            });
          }
        },
        fail: (err) => {
          console.error('点赞请求失败:', err);
          
          // 请求失败时也进行本地乐观更新
          optimisticUpdateUI();
          safeHideLoading();
          
          wx.showToast({
            title: '网络异常，已在本地更新状态',
            icon: 'none',
            duration: 2000
          });
        },
        complete: () => {
          // 移除重复的safeHideLoading调用，避免重复隐藏loading
          console.log('点赞请求完成');
        }
      });
    } catch (unexpectedError) {
      console.error('点赞操作发生意外错误:', unexpectedError);
      
      // 代码异常时也进行本地更新
      optimisticUpdateUI();
      safeHideLoading();
      
      wx.showToast({
        title: '操作异常，已在本地更新状态',
        icon: 'none',
        duration: 1500
      });
    }
  },
  
  // 更新点赞状态到本地
  updateLikedStateLocally: function(isLiked, workIdStr) {
    try {
      // 更新点赞列表
      if (isLiked) {
        this.setData({
          dzList: this.data.dzList.filter(item => item !== workIdStr)
        });
      } else {
        this.setData({
          dzList: [...this.data.dzList, workIdStr]
        });
      }
      
      // 本地计算点赞数
      this.setData({
        'workDetail.zpdz': Math.max(0, (this.data.workDetail.zpdz || 0) + (isLiked ? -1 : 1))
      });
      
      // 保存点赞状态到本地缓存
      const likedWorks = wx.getStorageSync('likedWorks') || [];
      if (isLiked) {
        wx.setStorageSync('likedWorks', likedWorks.filter(id => id !== workIdStr));
      } else {
        if (!likedWorks.includes(workIdStr)) {
          likedWorks.push(workIdStr);
          wx.setStorageSync('likedWorks', likedWorks);
        }
      }
      console.log('点赞状态本地更新成功:', !isLiked ? '已点赞' : '已取消点赞');
    } catch (e) {
      console.error('本地状态更新失败:', e);
    }
  },
  
  // 打开评论输入框
  handleCommentClick: function() {
    const { userId } = this.data;
    
    if (!userId) {
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
      commentContent: ''
    });
  },
  
  // 关闭评论输入框
  closeCommentInput: function() {
    this.setData({
      showCommentInput: false,
      commentContent: ''
    });
  },
  
  // 输入评论内容
  onCommentInput: function(e) {
    this.setData({
      commentContent: e.detail.value
    });
  },
  
  // 安全隐藏loading的函数
  safeHideLoading: function() {
    try {
      wx.hideLoading();
    } catch (e) {
      // 忽略已经隐藏的错误
    }
  },

  // 关闭评论输入框并显示发送状态
  closeCommentAndShowLoading: function() {
    // 关闭评论输入框并清空内容
    this.setData({
      commentContent: '',
      showCommentInput: false
    });
    
    // 显示评论发送中提示
    wx.showLoading({
      title: '发送中...',
      mask: true
    });
  },
  
  // 格式化时间
  formatTime: function(date) {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    
    return `${year}-${month}-${day} ${hour}:${minute}`;
  },

  // 发送评论
  sendComment: function() {
    const { workDetail, userId, commentContent } = this.data;
    const trimmedComment = commentContent.trim();
    
    // 基本检查
    if (!userId) {
      wx.showToast({
        title: '请您先登录',
        image: "../../static/images/!.png",
        duration: 2000
      });
      return;
    }
    
    if (!trimmedComment) {
      wx.showToast({
        title: '评论内容不能为空',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    if (!workDetail || !workDetail.id) {
      console.error('作品信息不完整');
      wx.showToast({
        title: '作品信息异常',
        icon: 'none',
        duration: 1500
      });
      return;
    }
    
    // 立即进行乐观UI更新 - 提供即时反馈
    this.optimisticUpdateUI();
    
    // 添加本地缓存 - 存储评论内容，确保即使服务器返回500错误，也能在本地记录
    try {
      // 获取现有评论缓存
      let cachedComments = wx.getStorageSync('userComments') || [];
      
      // 添加新评论到缓存
      cachedComments.push({
        id: Date.now(),
        zpid: workDetail.id,
        content: trimmedComment,
        timestamp: new Date().toISOString(),
        synced: false // 标记为未同步
      });
      
      // 保存回缓存
      wx.setStorageSync('userComments', cachedComments);
      console.log('评论已保存到本地缓存');
    } catch (e) {
      console.error('保存评论到本地缓存失败:', e);
    }
    
    // 显示loading，提示正在发送评论
    wx.showLoading({
      title: '发送评论中...',
      mask: true
    });
    
    try {
      wx.request({
        url: `${this.data.pre}/pl`,
        method: 'POST',
        data: {
          zpid: workDetail.id,
          userid: userId,
          content: trimmedComment // 使用正确的参数名content，匹配后端API要求
        },
        header: {
          'content-type': 'application/x-www-form-urlencoded'
        },
        success: (res) => {
          console.log('发送评论响应:', res);
          try {
            // 处理Map<String, Object>格式的响应数据
            if (res.statusCode === 200 && res.data && res.data.code === 0) {
              // 服务器同步成功
              console.log('评论已成功同步到服务器');
              
              // 从响应的Map中获取数据，使用服务器返回的准确评论数更新
              const commentData = res.data.data || {};
              
              if (typeof commentData.zpComment === 'number') {
                this.setData({
                  'workDetail.zpComment': commentData.zpComment
                });
              } else if (typeof commentData.zppl === 'number') {
                this.setData({
                  'workDetail.zppl': commentData.zppl
                });
              }
              
              // 重新加载评论列表
              this.loadComments();
            } else {
              // 服务器返回非成功状态，但评论已在本地完成
              console.warn('服务器返回非成功状态，但评论已在本地完成:', res.statusCode, res.data);
              
              // 特殊处理500错误
              if (res.statusCode === 500) {
                setTimeout(() => {
                  wx.showToast({
                    title: '服务器暂时无法处理请求，评论已保存',
                    icon: 'none',
                    duration: 2500
                  });
                }, 800);
              } else {
                // 其他错误
                setTimeout(() => {
                  wx.showToast({
                    title: '评论已保存，正在重试同步',
                    icon: 'none',
                    duration: 2000
                  });
                }, 800);
              }
            }
          } catch (e) {
            console.error('处理评论响应异常:', e);
          } finally {
            // 确保在响应处理完成后隐藏loading
            this.safeHideLoading();
          }
        },
        fail: (err) => {
          console.error('评论请求失败:', err);
          
          // 确保在请求失败时隐藏loading
          this.safeHideLoading();
          
          // 网络请求失败，但评论已在本地完成
          setTimeout(() => {
            wx.showToast({
              title: '网络异常，评论已保存',
              icon: 'none',
              duration: 2000
            });
          }, 800);
        },
        complete: () => {
          // 移除重复的safeHideLoading调用，避免重复隐藏loading
          console.log('评论请求完成');
        }
      });
    } catch (unexpectedError) {
      console.error('评论操作发生意外错误:', unexpectedError);
      // 确保在所有异常情况下都隐藏loading
      this.safeHideLoading();
      
      // 即使发生意外错误，也告知用户评论已在本地完成
      setTimeout(() => {
        wx.showToast({
          title: '操作异常，评论已保存',
          icon: 'none',
          duration: 2000
        });
      }, 800);
    }
  },
  
  // 处理图片加载失败
  handleImageError: function(e) {
    console.error('图片加载失败，详细信息:', {
      error: e,
      target: e.target,
      currentTarget: e.currentTarget,
      timeStamp: e.timeStamp,
      type: e.type,
      detail: e.detail,
      mark: e.mark,
      dataset: e.currentTarget.dataset,
      src: e.currentTarget.dataset.src || this.data.workDetail.zpimg
    });
    
    // 获取当前图片URL进行调试
    const currentImageSrc = this.data.workDetail.zpimg;
    console.log('当前失败的图片URL:', currentImageSrc);
    
    if (currentImageSrc) {
      console.log('图片URL分析:', {
        length: currentImageSrc.length,
        prefix: currentImageSrc.substring(0, 50),
        suffix: currentImageSrc.substring(currentImageSrc.length - 50),
        hasDataPrefix: currentImageSrc.startsWith('data:image'),
        hasBase64: currentImageSrc.includes('base64'),
        imageType: currentImageSrc.match(/data:image\/([^;]+)/)?.[1] || 'unknown'
      });
    }
    
    // 尝试修复图片数据格式
    try {
      if (this.data.workDetail && this.data.workDetail.zpimg) {
        let fixedImgData = this.data.workDetail.zpimg.trim();
        // 确保添加了正确的data URL前缀
        if (!fixedImgData.startsWith('data:image')) {
          // 检查是否是有效的base64数据
          if (fixedImgData.match(/^[A-Za-z0-9+/]+={0,2}$/)) {
            const workDetail = {...this.data.workDetail};
            workDetail.zpimg = 'data:image/jpeg;base64,' + fixedImgData;
            console.log('尝试修复后的图片URL:', workDetail.zpimg.substring(0, 100) + '...');
            
            // 更新图片URL并重试
            this.setData({ 
              workDetail: workDetail, 
              imageError: false,
              imageLoading: true
            });
            
            // 延迟一点时间再重试，给小程序一些缓冲时间
            setTimeout(() => {
              console.log('图片格式修复后重新加载...');
            }, 100);
            return;
          }
        }
      }
    } catch (err) {
      console.error('修复图片格式失败:', err);
    }
    
    // 如果修复失败或无法修复，设置错误状态
    this.setData({ 
      imageError: true,
      imageLoading: false 
    });
    
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
  },
  
  // 图片加载成功处理
  handleImageLoad: function(e) {
    console.log('图片加载成功，详细信息:', {
      event: e,
      target: e.target,
      currentTarget: e.currentTarget,
      timeStamp: e.timeStamp,
      type: e.type,
      detail: e.detail,
      width: e.detail?.width,
      height: e.detail?.height
    });
    
    const currentImageSrc = this.data.workDetail.zpimg;
    if (currentImageSrc) {
      console.log('成功加载的图片信息:', {
        length: currentImageSrc.length,
        prefix: currentImageSrc.substring(0, 50),
        imageType: currentImageSrc.match(/data:image\/([^;]+)/)?.[1] || 'unknown',
        hasDataPrefix: currentImageSrc.startsWith('data:image')
      });
    }
    
    this.setData({
      imageError: false,
      imageLoading: false
    });
  },
  
  // 获取评论列表
  loadComments: function() {
    const { workDetail } = this.data;
    if (!workDetail || !workDetail.id) {
      console.log('作品详情不存在，无法加载评论');
      this.setData({
        comments: []
      });
      return;
    }

    console.log('开始加载评论，作品ID:', workDetail.id);
    
    // 使用正确的API地址 - 使用app.globalData.pre而不是apiBaseUrl
    const apiUrl = `${app.globalData.pre}/getpl`;
    console.log('请求评论接口:', apiUrl);
    
    // 从pl表获取真实评论数据
    wx.request({
      url: apiUrl,
      method: 'GET',
      data: {
        zpid: workDetail.id
      },
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      success: (res) => {
        console.log('获取评论响应:', res);
        console.log('响应状态码:', res.statusCode);
        console.log('响应数据:', res.data);
        
        if (res.statusCode === 200 && res.data) {
          // 检查后端返回的数据格式
          if (res.data.code === 0 && res.data.data) {
            console.log('评论数据获取成功，数据条数:', res.data.data.length);
            
            // 处理评论数据，转换为前端需要的格式
            const comments = res.data.data.map((item, index) => {
              console.log(`处理第${index + 1}条评论:`, item);
              
              // 构建评论对象 - 修正字段映射
              const comment = {
                id: item.id || `${item.userid}_${item.time}_${index}`, // 确保有唯一ID
                username: item.username || '匿名用户',
                avatar: item.usertx ? `data:image/jpeg;base64,${item.usertx}` : '../../static/images/userempty.png',
                content: item.content || '',
                createTime: item.time || new Date().toISOString()
              };
              
              console.log('处理后的评论对象:', comment);
              return comment;
            });
            
            console.log('最终评论列表:', comments);
            
            this.setData({
              comments: comments
            });
            
            // 显示成功提示
            if (comments.length > 0) {
              wx.showToast({
                title: `加载了${comments.length}条评论`,
                icon: 'none',
                duration: 1500
              });
            } else {
              console.log('该作品暂无评论');
            }
          } else {
            console.warn('评论数据格式异常:', res.data);
            this.setData({
              comments: []
            });
            
            // 显示错误提示
            wx.showToast({
              title: '评论数据格式异常',
              icon: 'none',
              duration: 2000
            });
          }
        } else {
          console.error('评论请求失败，状态码:', res.statusCode);
          this.setData({
            comments: []
          });
          
          // 显示错误提示
          wx.showToast({
            title: `请求失败: ${res.statusCode}`,
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('获取评论网络请求失败:', error);
        // 网络错误时设置为空评论
        this.setData({
          comments: []
        });
        
        // 显示网络错误提示
        wx.showToast({
          title: '网络异常，无法加载评论',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },
  
  // 安全的隐藏loading方法，确保showLoading和hideLoading正确配对
  safeHideLoading: function() {
    try {
      // 调用wx.hideLoading()隐藏加载提示
      wx.hideLoading();
      console.log('Loading已安全隐藏');
    } catch (error) {
      // 如果hideLoading()失败（例如没有对应的showLoading），记录错误但不中断执行
      console.warn('隐藏loading时出现异常:', error);
    }
  },

  
  onReady() {

  },
  onShow() {

  },
  onHide() {

  },
  onUnload() {

  },
  onPullDownRefresh() {

  },
  onReachBottom() {

  },
  onShareAppMessage() {

  }
})