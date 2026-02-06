// pages/networkDate/networkDate.js
var app = getApp()
const { request } = require('../../utils/api.js')
Page({
  data: {
    pre: app.globalData.pre,
    userId: '',
    networkInfo: {
      startDate: '',
      endDate: '',
      status: ''
    },
    formattedDate: '',
    isLoading: false,
    hasData: true
  },

  onLoad: function() {
    // 尝试获取缓存中的用户ID
    try {
      const userId = wx.getStorageSync('id');
      if (userId) {
        this.setData({
          userId: userId,
          isLoading: true
        })
        console.log('成功获取缓存中的用户ID:', this.data.userId);
        this.getNetworkDateInfo();
      } else {
        // 未登录状态
        this.setData({
          hasData: false,
          isLoading: false
        });
      }
    } catch (e) {
      console.error('获取缓存失败:', e);
      this.setData({
        isLoading: false
      });
    }
  },

  // 获取联网日期信息
  getNetworkDateInfo: function() {
    if (this.data.userId) {
      // 使用项目封装的request方法获取联网日期数据
      request('/networkDate', { userId: this.data.userId }, 'GET')
        .then((res) => {
          console.log('获取联网日期信息成功:', res);
          
          // 根据项目API返回格式处理数据
          const networkData = {
            startDate: res.startDate || '',
            endDate: res.endDate || '',
            status: res.status || 'inactive'
          };
          
          this.setData({
            networkInfo: networkData,
            formattedDate: this.formatDateRange(networkData.startDate, networkData.endDate),
            isLoading: false,
            hasData: true
          });
        })
        .catch((err) => {
          console.error('获取联网日期信息失败:', err);
          // api.js中已经处理了错误提示，这里只需要更新加载状态
          this.setData({
            isLoading: false
          });
        });
    }
  },

  // 格式化日期范围显示
  formatDateRange: function(start, end) {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const now = new Date();
    
    // 格式化开始日期
    const startYear = startDate.getFullYear();
    const startMonth = startDate.getMonth() + 1;
    const startDay = startDate.getDate();
    
    // 格式化结束日期
    const endYear = endDate.getFullYear();
    const endMonth = endDate.getMonth() + 1;
    const endDay = endDate.getDate();
    
    // 计算剩余天数
    const remainingDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
    
    return {
      start: `${startYear}年${startMonth}月${startDay}日`,
      end: `${endYear}年${endMonth}月${endDay}日`,
      remainingDays: remainingDays > 0 ? remainingDays : 0
    };
  },

  // 返回到用户页面
  goBack: function() {
    wx.navigateBack({
      delta: 1
    });
  },
  
  // 立即续费按钮点击事件
  goRenew: function() {
    // 显示续费套餐选择
    this.showRenewalPackages();
  },
  
  // 显示续费套餐选择
  showRenewalPackages: function() {
    const packages = [
      {id: 1, name: '基础套餐', period: '3个月', price: 39, desc: '包含基本定位和数据同步功能'},
      {id: 2, name: '标准套餐', period: '6个月', price: 69, desc: '包含全部功能，性价比最高'},
      {id: 3, name: '高级套餐', period: '12个月', price: 129, desc: '一年服务，额外赠送1个月'}
    ];
    
    // 创建套餐选择弹窗
    wx.showModal({
      title: '选择续费套餐',
      content: `\n1. ${packages[0].name}：¥${packages[0].price}/${packages[0].period}\n   ${packages[0].desc}\n\n2. ${packages[1].name}：¥${packages[1].price}/${packages[1].period}\n   ${packages[1].desc}\n\n3. ${packages[2].name}：¥${packages[2].price}/${packages[2].period}\n   ${packages[2].desc}`,
      confirmText: '选择套餐',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          // 弹出输入框让用户选择套餐
          wx.showModal({
            title: '确认套餐',
            content: '',
            editable: true,
            placeholderText: '请输入套餐编号(1-3)',
            success: (inputRes) => {
              if (inputRes.confirm && inputRes.content) {
                const packageIndex = parseInt(inputRes.content) - 1;
                if (packageIndex >= 0 && packageIndex < packages.length) {
                  this.selectedPackage = packages[packageIndex];
                  this.confirmRenewal(packages[packageIndex]);
                } else {
                  wx.showToast({
                    title: '请输入正确的套餐编号',
                    icon: 'none'
                  });
                }
              }
            }
          });
        }
      }
    });
  },
  
  // 确认续费
  confirmRenewal: function(selectedPackage) {
    wx.showModal({
      title: '确认订单',
      content: `您确定要购买${selectedPackage.name}吗？\n套餐周期：${selectedPackage.period}\n价格：¥${selectedPackage.price}`,
      confirmText: '确认支付',
      cancelText: '取消',
      success: (res) => {
        if (res.confirm) {
          this.processPayment(selectedPackage);
        }
      }
    });
  },
  
  // 处理支付
  processPayment: function(selectedPackage) {
    wx.showLoading({
      title: '处理支付中...',
    });
    
    // 模拟支付请求
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟支付成功
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 支付成功后更新状态
          setTimeout(() => {
            this.renewalSuccess(selectedPackage);
          }, 2000);
        }
      });
    }, 2000);
  },
  
  // 续费成功处理
  renewalSuccess: function(selectedPackage) {
    // 模拟更新网络服务状态
    const now = new Date();
    let additionalMonths = 0;
    
    // 根据套餐确定添加的月份
    if (selectedPackage.period.includes('3')) {
      additionalMonths = 3;
    } else if (selectedPackage.period.includes('6')) {
      additionalMonths = 6;
    } else if (selectedPackage.period.includes('12')) {
      additionalMonths = 13; // 高级套餐额外赠送1个月
    }
    
    const newEndDate = new Date(now.getFullYear(), now.getMonth() + additionalMonths, now.getDate());
    
    // 更新本地数据
    const updatedNetworkInfo = {
      ...this.data.networkInfo,
      startDate: now.toISOString(),
      endDate: newEndDate.toISOString(),
      status: 'active'
    };
    
    this.setData({
      networkInfo: updatedNetworkInfo,
      formattedDate: this.formatDateRange(now.toISOString(), newEndDate.toISOString())
    });
    
    // 显示成功信息
    wx.showModal({
      title: '续费成功',
      content: `您已成功续费${selectedPackage.name}！\n新的服务期限：${this.data.formattedDate.start} 至 ${this.data.formattedDate.end}`,
      showCancel: false,
      success: () => {
        // 可以在这里调用API保存到服务器
        console.log('续费信息应保存到服务器:', {
          userId: this.data.userId,
          package: selectedPackage,
          startDate: now.toISOString(),
          endDate: newEndDate.toISOString()
        });
      }
    });
  },
  
  // 联系客服按钮点击事件
  goCustomerService: function() {
    // 跳转到客服页面
    wx.navigateTo({
      url: '/pages/customerService/customerService',
      animationType: 'pop-in',
      animationDuration: 200
    });
  },
  
  // 去登录按钮点击事件
  goToLogin: function() {
    wx.navigateTo({
      url: '/pages/Login/Login',
      animationType: 'pop-in',
      animationDuration: 200
    });
  }
})