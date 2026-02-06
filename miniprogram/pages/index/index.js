const app = getApp();

// 主页面逻辑
Page({
  data: {
    // 头盔产品数据列表
    swiperList: [
      {bgi: '../../static/images/tkindex1.png', text: 'MasTer F', text2: '安全旗舰', tag1: '主动+被动安全', tag2: '续航时长15h+', weight: '1.3kg', batteryLife: '15h+', protectionLevel: 'IP67'},
      {bgi: '../../static/images/tkindex2.png', text: 'MasTer S', text2: '高性能全智能', tag1: '安全+科技', tag2: '续航时长10h+', weight: '1.4kg', batteryLife: '10h+', protectionLevel: 'IP65'},
      {bgi: '../../static/images/tkindex3.png', text: 'MasTer P', text2: '安全先锋', tag1: '重量仅1.2kg', tag2: '续航时长17h+', weight: '1.2kg', batteryLife: '17h+', protectionLevel: 'IP66'},
    ],
    // 轮播配置
    indicatorDots: true,
    interval: 5000, // 5秒切换一次
    duration: 500,  // 动画持续时间
    currentIndex: 0,
    swiperItemList: [], // 当前显示的头盔信息
    showParams: false // 控制参数面板显示状态
  },
  
  onLoad() {
    // 默认显示第一个头盔信息
    this.setData({
      swiperItemList: this.data.swiperList[0]
    });
    
    // 初始化全局蓝牙连接状态 - 避免未定义的情况
    if (!app.globalData.bluetoothStatus) {
      app.globalData.bluetoothStatus = {
        connected: false,
        deviceId: null
      };
    }
  },
  
  // 获取指定索引的头盔数据
  getCurrentItem(i) {
    return this.data.swiperList[i];
  },
  
  // 轮播切换时更新显示内容
  swiperChange(e) {
    this.setData({
      swiperItemList: this.getCurrentItem(e.detail.current),
      showParams: false // 切换到新头盔时先隐藏参数面板
    });
  },
  
  // 点击"了解更多"时切换参数面板显示状态
  showHelmetParams() {
    // 简单的取反操作，实现显示/隐藏切换
    this.setData({
      showParams: !this.data.showParams
    });
  },

  // 检查当前蓝牙设备连接状态
  checkBluetoothConnection() {
    return new Promise((resolve) => {
      // 判断是否已连接的逻辑 - 这里简单检查deviceId
      const isConnected = app.globalData.bluetoothStatus && 
                        app.globalData.bluetoothStatus.connected && 
                        app.globalData.bluetoothStatus.deviceId;
      
      // 加个小延迟让体验更自然
      setTimeout(() => {
        resolve(isConnected);
      }, 300);
    });
  },

  // "立即佩戴"按钮的点击处理
  async handleWearHelmet() {
    try {
      // 显示加载状态
      wx.showLoading({
        title: '检查连接中...',
      });

      // 异步检查蓝牙状态
      const isConnected = await this.checkBluetoothConnection();
      
      // 关闭加载动画
      wx.hideLoading();

      if (isConnected) {
        // 连接正常，显示成功提示
        wx.showToast({
          title: '佩戴成功',
          icon: 'success',
          duration: 2000
        });
      } else {
        // 未连接，提示用户
        wx.showModal({
          title: '佩戴失败',
          content: '请先连接头盔蓝牙',
          showCancel: false,
          confirmText: '知道了'
        });
      }
    } catch (error) {
      console.error('检查蓝牙连接时出错:', error);
      wx.hideLoading();
      wx.showToast({
        title: '检查失败，请重试',
        icon: 'none',
        duration: 2000
      });
    }
  },

  /**
   * 显示参数信息
   */
  goToDetail() {
    this.showHelmetParams();
  },

  
});
