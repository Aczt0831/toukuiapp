// pages/cart/cart.js
var app = getApp();
Page({
  data: {
    pre: app.globalData.pre,
    cartItems: [],
    recommendedProducts: [
      {
        id: 1,
        name: "防雾头盔镜片 - 透明",
        price: 89.9,
        image: "../../static/images/tkimg.png"
      },
      {
        id: 2,
        name: "夏季透气头盔内衬",
        price: 59.9,
        image: "../../static/images/tkimg.png"
      },
      {
        id: 3,
        name: "头盔安全气囊 - 标准版",
        price: 129.9,
        image: "../../static/images/tkimg.png"
      },
      {
        id: 4,
        name: "炫酷头盔贴纸套装",
        price: 29.9,
        image: "../../static/images/tkimg.png"
      }
    ],
    totalPrice: 0,
    totalQuantity: 0
  },

  onLoad: function(options) {
    console.log('购物车页面加载');
    this.loadCartItems();
  },

  onShow: function() {
    // 每次显示页面时重新加载购物车数据
    this.loadCartItems();
  },

  // 从本地存储加载购物车数据
  loadCartItems: function() {
    try {
      const cartItems = wx.getStorageSync('cartItems') || [];
      console.log('购物车数据加载结果:', cartItems);
      this.setData({ cartItems });
      this.calculateTotals();
      console.log('购物车加载完成，商品数量:', this.data.cartItems.length);
      console.log('结算按钮显示条件:', this.data.cartItems.length > 0);
    } catch (e) {
      console.error('加载购物车数据失败:', e);
      this.setData({ cartItems: [] });
      this.calculateTotals();
    }
  },

  // 保存购物车数据到本地存储
  saveCartItems: function() {
    try {
      wx.setStorageSync('cartItems', this.data.cartItems);
      this.calculateTotals();
    } catch (e) {
      console.error('保存购物车数据失败:', e);
    }
  },

  // 计算总价和总数量
  calculateTotals: function() {
    let totalPrice = 0;
    let totalQuantity = 0;
    
    this.data.cartItems.forEach(item => {
      totalPrice += item.price * item.quantity;
      totalQuantity += item.quantity;
    });
    
    this.setData({
      totalPrice,
      totalQuantity
    });
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 去购物
  goShopping: function() {
    wx.navigateTo({
      url: '/pages/store/store'
    });
  },

  // 增加商品数量
  increaseQuantity: function(e) {
    const productId = e.currentTarget.dataset.id;
    const cartItems = [...this.data.cartItems];
    const item = cartItems.find(i => i.id === productId);
    
    if (item) {
      item.quantity += 1;
      this.setData({ cartItems });
      this.saveCartItems();
    }
  },

  // 减少商品数量
  decreaseQuantity: function(e) {
    const productId = e.currentTarget.dataset.id;
    let cartItems = [...this.data.cartItems];
    const itemIndex = cartItems.findIndex(i => i.id === productId);
    
    if (itemIndex !== -1) {
      if (cartItems[itemIndex].quantity > 1) {
        cartItems[itemIndex].quantity -= 1;
      } else {
        // 数量为1时再次点击减少，提示是否删除
        wx.showModal({
          title: '提示',
          content: '确定要删除该商品吗？',
          success: (res) => {
            if (res.confirm) {
              cartItems.splice(itemIndex, 1);
              this.setData({ cartItems });
              this.saveCartItems();
            }
          }
        });
        return;
      }
      
      this.setData({ cartItems });
      this.saveCartItems();
    }
  },

  // 从购物车移除商品
  removeFromCart: function(e) {
    const productId = e.currentTarget.dataset.id;
    
    wx.showModal({
      title: '确认删除',
      content: '确定要从购物车中删除该商品吗？',
      success: (res) => {
        if (res.confirm) {
          const cartItems = this.data.cartItems.filter(item => item.id !== productId);
          this.setData({ cartItems });
          this.saveCartItems();
          
          wx.showToast({
            title: '删除成功',
            icon: 'success',
            duration: 1500
          });
        }
      }
    });
  },

  // 添加推荐商品到购物车
  addRecommendedToCart: function(e) {
    const productId = e.currentTarget.dataset.id;
    const product = this.data.recommendedProducts.find(p => p.id === productId);
    
    if (product) {
      let cartItems = [...this.data.cartItems];
      const existingItem = cartItems.find(item => item.id === productId);
      
      if (existingItem) {
        // 商品已在购物车中，增加数量
        existingItem.quantity += 1;
      } else {
        // 添加新商品到购物车
        cartItems.push({
          ...product,
          quantity: 1
        });
      }
      
      this.setData({ cartItems });
      this.saveCartItems();
      
      wx.showToast({
        title: '已加入购物车',
        icon: 'success',
        duration: 1500
      });
    }
  },

  // 结算
  checkout: function() {
    console.log('结算按钮被点击，当前购物车商品:', this.data.cartItems.length);
    
    if (this.data.cartItems.length === 0) {
      wx.showToast({
        title: '购物车为空',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    
    wx.showModal({
      title: '确认结算',
      content: `确认支付 ¥${this.data.totalPrice.toFixed(2)}？`,
      success: (res) => {
        if (res.confirm) {
          // 模拟结算成功
          wx.showToast({
            title: '结算成功',
            icon: 'success',
            duration: 2000
          });
          
          // 清空购物车
          this.setData({ cartItems: [] });
          this.saveCartItems();
          
          // 延迟后刷新页面状态
          setTimeout(() => {
            this.loadCartItems();
          }, 2000);
        }
      }
    });
  }
});