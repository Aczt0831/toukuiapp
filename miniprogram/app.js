App({
  onLaunch() {
    // 展示本地存储能力 
    const logs = wx.getStorageSync('logs') || [] 
    logs.unshift(Date.now()) 
    wx.setStorageSync('logs', logs) 
    
    // 初始化环境配置
    this.initEnvironment();
    this.initCloud();

    // 登录：获取code并发送到后端 
    wx.login({ 
      success: res => { 
        if (res.code) { 
          console.log('获取登录code:', res.code) 
          // 发送 res.code 到后台换取 openId, sessionKey, unionId 
          wx.request({ 
            url: this.globalData.pre + '/getOpenId', // 后端接收code的接口地址（需后端对应） 
            method: 'POST', 
            data: { 
              code: res.code // 仅传递code给后端 
            }, 
            header: { 
              'content-type': 'application/json' 
            }, 
            success: (resp) => { 
              console.log('code发送到后端成功:', resp) 
              // 无需额外处理，只要后端接收到即可 
            }, 
            fail: (error) => { 
              console.error('code发送到后端失败:', error) 
            } 
          }) 
        } else { 
          console.error('登录失败，未获取到code:', res.errMsg) 
        } 
      }, 
      fail: (error) => { 
        console.error('wx.login调用失败:', error) 
      } 
    })
  },
  
  /**
   * 初始化环境配置，优先使用本地开发环境，其次使用局域网环境
   */
  initEnvironment: function() {
    this.globalData.isLocalAvailable = true; // 默认假设本地环境可用
    this.globalData.apiBaseUrl = this.globalData.localAddress;
    console.log('优先使用本地开发环境:', this.globalData.apiBaseUrl);
  },
  
  getApiBaseUrl: function() {
    return this.globalData.apiBaseUrl;
  },
  
  switchToBackupEnv: function() {
    if (!this.globalData.isLocalAvailable) {
      return;
    }
    
    this.globalData.isLocalAvailable = false;
    this.globalData.apiBaseUrl = this.globalData.pre;
    console.log('切换到局域网环境:', this.globalData.apiBaseUrl);
  },
  
  initCloud: function() {
    const cloudEnvId = 'cloud1-8gzwn82y09f088ae';
    
    if (wx.cloud) {
      try {
        wx.cloud.init({
          env: cloudEnvId,
          traceUser: true
        });
        
        this.cloud = wx.cloud;
        this.db = wx.cloud.database();
        console.log('云开发环境初始化成功，环境ID:', cloudEnvId);
        this.globalData.cloud = wx.cloud;
        this.globalData.db = this.db;
      } catch (error) {
        console.error('云开发环境初始化失败:', error);
      }
    } else {
      console.error('当前微信版本不支持云开发');
    }
  },
  globalData: {
    localAddress:"http://127.0.0.1:8080",//本地开发环境，端口使用8080端口
       pre:"http://10.223.78.111:8080",//TYUN.5G（不是全称，不想编了，就这样写了）局域网地址配置，自己编的话，开一个热点，查一下ipv4地址
    cloudEnvId: 'cloud1-8gzwn82y09f088ae',// 云开发环境ID
    cloud: null,
    db: null,
    userInfo: null,
    openid: null,
    unionid: null,
    token: null,
    id: null,
    bluetoothStatus: {
      connected: false,
      deviceId: null
    },
    // 环境配置
    isLocalAvailable: true, // 本地环境是否可用
    apiBaseUrl: "http://127.0.0.1:8080" // 当前使用的API基础URL
  }
})
