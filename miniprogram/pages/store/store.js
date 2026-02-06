// pages/store/store.js
var app = getApp();
Page({
  data: {
    pre: app.globalData.pre,
    products: [],
    loading: true,
    refreshing: false,
    hasMore: true,
    showEmptyState: false,
    cartItemCount: 0
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('商城页面加载');
    this.setData({
      products: [],
      hasMore: true
    });
    
    // 初始化购物车数量
    this.updateCartItemCount();
    
    // 调用fetchProductList并添加错误处理
    this.fetchProductList().catch(error => {
      console.error('页面加载商品失败:', error);
    });
  },
  
  // 更新购物车数量
  updateCartItemCount: function() {
    try {
      const cartItems = wx.getStorageSync('cartItems') || [];
      const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 0), 0);
      this.setData({ cartItemCount: totalCount });
      console.log('购物车数量更新为:', totalCount);
    } catch (e) {
      console.error('获取购物车数量失败:', e);
    }
  },
  
  onShow: function() {
    // 页面显示时执行
    console.log('商城页面显示');
    // 检查是否显示空状态
    this.checkEmptyState();
  },
  
  // 下拉刷新
  onPullDownRefresh: function() {
    if (this.data.refreshing) return; // 防止重复刷新
    
    this.setData({
      refreshing: true,
      products: [],
      hasMore: true
    });
    
    this.fetchProductList().then(() => {
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

  // 从后端获取商品列表
  fetchProductList: function() {
    const that = this;
    that.setData({ loading: true });
    
    return new Promise((resolve, reject) => {
      // 使用与find.js相同的API前缀模式
      wx.request({
        url: that.data.pre + '/products',
        method: 'GET',
        timeout: 10000, // 设置超时时间为10秒
        header: {
          'content-type': 'application/json'
        },
        success: function(res) {
          console.log('获取商品列表响应完整:', res);
          console.log('响应数据:', res.data);
          
          // 兼容不同的响应格式（与find.js保持一致）
          let productList = [];
          
          // 检查HTTP状态码
          if (res.statusCode === 200) {
            // 处理Spring Boot的Result格式响应
            if (res.data && typeof res.data === 'object') {
              console.log('响应类型检查 - code:', res.data.code);
              console.log('响应类型检查 - data存在性:', res.data.data !== undefined);
              
              if (res.data.code === 0) {
                // 成功响应，code为0
                productList = res.data.data || [];
                console.log('通过code=0获取数据，长度:', productList.length);
              } else if (res.data.success) {
                // 另一种成功格式
                productList = res.data.data || [];
                console.log('通过success标志获取数据，长度:', productList.length);
              } else {
                // 处理错误响应
                console.error('后端返回错误:', res.data.code, res.data.msg);
                // 显示错误提示，但仍保持页面正常加载
                wx.showToast({
                  title: '商品数据获取失败: ' + (res.data.msg || '未知错误'),
                  icon: 'none',
                  duration: 3000
                });
              }
            } else if (Array.isArray(res.data)) {
              // 如果直接返回数组
              productList = res.data;
              console.log('直接返回数组，长度:', productList.length);
            }
          } else {
            console.warn('获取商品列表状态码异常:', res.statusCode);
          }
          
          // 输出原始数据结构示例
          if (productList.length > 0) {
            console.log('商品数据项示例:', productList[0]);
          }
          
          // 更全面的商品属性处理
          const processedProducts = productList.map((item, index) => {
            if (!item || typeof item !== 'object') {
              console.warn('无效的商品数据项:', index, item);
              return null;
            }
            return {
              id: item.id || item.productId || Date.now() + index,
              name: item.name || item.title || item.productName || '未知商品',
              price: item.price || item.cost || item.unitPrice || 0,
              image: item.image || item.img || item.images?.[0] || '',
              totalCount: item.totalCount || item.stock || item.inventory || 0,
              soldCount: item.soldCount || item.sales || item.sold || 0,
              description: item.description || item.desc || '',
              ...item
            };
          }).filter(Boolean);
          
          that.setData({
            products: processedProducts,
            loading: false,
            hasMore: false
          });
          
          // 检查是否显示空状态
          that.checkEmptyState();
          
          console.log('设置商品列表数据:', processedProducts);
          console.log('成功加载商品数据，共', processedProducts.length, '条');
          
          resolve(processedProducts);
        },
        fail: function(err) {
          console.error('获取商品列表失败:', err);
          that.setData({
            loading: false,
            showEmptyState: true
          });
          
          // 更友好的错误提示和重试选项
          let errorMsg = '加载商品失败';
          if (err.errMsg && err.errMsg.includes('request:fail')) {
            errorMsg = '网络请求失败，请检查网络连接';
          }
          
          wx.showModal({
            title: '加载失败',
            content: errorMsg + '，是否重试？',
            showCancel: true,
            confirmText: '重试',
            cancelText: '取消',
            success: function(res) {
              if (res.confirm) {
                // 点击重试按钮，重新获取商品列表
                that.fetchProductList();
              }
            }
          });
          reject(err);
        }
      });
    });
  },
  
  // 检查是否显示空状态
  checkEmptyState: function() {
    this.setData({
      showEmptyState: this.data.products.length === 0
    });
  },

  // 跳转到购物车页面
  goToCart: function() {
    wx.navigateTo({
      url: '/pages/cart/cart',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 加入购物车
  addToCart: function(e) {
    const productId = e.currentTarget.dataset.id;
    console.log('添加商品到购物车:', productId);
    
    // 找到对应的商品信息
    const product = this.data.products.find(p => p.id === productId);
    if (!product) {
      wx.showToast({
        title: '商品信息不存在',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    try {
      // 获取现有购物车数据
      let cartItems = wx.getStorageSync('cartItems') || [];
      
      // 检查商品是否已在购物车中
      const existingItem = cartItems.find(item => item.id === productId);
      
      if (existingItem) {
        // 如果已存在，增加数量
        existingItem.quantity += 1;
      } else {
        // 如果不存在，添加新商品
        cartItems.push({
          id: product.id,
          name: product.name,
          price: product.price,
          image: product.image || '../../static/images/tkimg.png',
          quantity: 1
        });
      }
      
      // 保存到本地存储
      wx.setStorageSync('cartItems', cartItems);
      
      // 更新购物车数量显示
      this.updateCartItemCount();
      
      // 显示成功提示
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 2000
      });
      
    } catch (error) {
      console.error('添加购物车失败:', error);
      wx.showToast({
        title: '添加失败',
        icon: 'none',
        duration: 2000
      });
    }
    
    try {
      // 直接使用wx.request调用本地Spring Boot API添加到购物车
      wx.request({
        url: 'http://127.0.0.1:8080/cart/add',
        method: 'POST',
        data: {
          productId: productId,
          quantity: 1
        },
        success: function(res) {
          console.log('商品加入购物车成功:', res);
          wx.showToast({
            title: '已加入购物车',
            icon: 'success',
            duration: 2000
          });
        },
        fail: function(err) {
          console.error('添加到购物车失败:', err);
          wx.showToast({
            title: '添加失败，请检查后端服务',
            icon: 'none',
            duration: 2000
          });
        }
      });
    } catch (e) {
      console.error('添加到购物车出错:', e);
      wx.showToast({
        title: '添加失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  // 查看商品详情
  viewProductDetail: function(e) {
    const productId = e.currentTarget.dataset.id;
    // 直接使用wx.request调用本地Spring Boot API获取商品详情
    wx.request({
      url: 'http://127.0.0.1:8080/products/' + productId,
      method: 'GET',
      success: function(res) {
        console.log('获取商品详情成功:', res);
        // 这里可以跳转到商品详情页或显示详情信息
        wx.showToast({
          title: '查看商品' + productId + '详情',
          icon: 'none',
          duration: 2000
        });
      },
      fail: function(err) {
        console.error('获取商品详情失败:', err);
        wx.showToast({
          title: '获取详情失败，请检查后端服务',
          icon: 'none',
          duration: 2000
        });
      }
    });
  }
});