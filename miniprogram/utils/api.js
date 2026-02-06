// api.js - 封装与后端的API交互
const app = getApp();

/**
 * 获取当前应该使用的基础URL
 * @returns {string} 当前API基础URL
 */
const getCurrentBaseUrl = () => {
  // 使用app实例中提供的API基础URL
  return app.getApiBaseUrl && app.getApiBaseUrl() || app.globalData.apiBaseUrl || app.globalData.localAddress;
};

/**
 * 发送HTTP请求，支持环境自动切换
 * @param {string} url - 请求路径
 * @param {object} data - 请求数据
 * @param {string} method - 请求方法
 * @param {object} header - 请求头
 * @param {boolean} retry - 是否为重试请求
 * @returns {Promise} 请求结果Promise
 */
const request = (url, data = {}, method = 'GET', header = {}, retry = false) => {
  const baseURL = getCurrentBaseUrl();
  
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${baseURL}${url}`,
      method,
      data,
      header: {
        'content-type': 'application/json',
        ...header
      },
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data || res.data);
          } else {
            wx.showToast({
              title: res.data.msg || '请求失败',
              icon: 'none'
            });
            reject(new Error(res.data.msg || '请求失败'));
          }
        } else {
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
          reject(new Error('网络请求失败'));
        }
      },
      fail: (err) => {
    // 检测是否是使用127.0.0.1或localhost导致的失败（小程序不允许直接访问本地地址）
    if (!retry && (app.globalData.apiBaseUrl.includes('127.0.0.1') || app.globalData.apiBaseUrl.includes('localhost'))) {
      console.log('检测到使用本地地址，小程序不支持直接访问127.0.0.1，尝试切换到局域网环境');
      app.switchToBackupEnv && app.switchToBackupEnv();
      // 重试请求
      return request(url, data, method, header, true).then(resolve).catch(reject);
    }
    
    wx.showToast({
      title: '网络连接失败',
      icon: 'none'
    });
    reject(err);
  }
    });
  });
};

const api = {
  login: (account, password) => {
    return request('/login', { account, password }, 'POST');
  },
  
  register: (userInfo) => {
    return request('/register', userInfo, 'POST');
  },
  
  getUserInfo: (id) => {
    return request('/getuserinfo', { id }, 'GET');
  },
  
  changeStyleList: (id, stylelist) => {
    return request('/stylelist', { id, stylelist }, 'POST');
  },
  
  changeUsername: (id, username) => {
    return request('/username', { id, username }, 'POST');
  },
  
  uploadAvatar: (id, tempFilePath) => {
    return new Promise((resolve, reject) => {
      const baseURL = getCurrentBaseUrl();
      
      wx.uploadFile({
        url: `${baseURL}/usertx`,
        filePath: tempFilePath,
        name: 'file',
        formData: {
          id: id
        },
        success: (res) => {
          const data = JSON.parse(res.data);
          if (data.code === 0) {
            resolve(data.data || data);
          } else {
            wx.showToast({
              title: data.msg || '上传失败',
              icon: 'none'
            });
            reject(new Error(data.msg || '上传失败'));
          }
        },
        fail: (err) => {
          // 如果上传失败且使用的是本地地址，则尝试切换到局域网环境并重试
          if (app.globalData.apiBaseUrl.includes('127.0.0.1') || app.globalData.apiBaseUrl.includes('localhost')) {
            console.log('检测到使用本地地址，小程序不支持直接访问127.0.0.1，尝试切换到局域网环境');
            app.switchToBackupEnv && app.switchToBackupEnv();
            // 重新获取基础URL并重试
            const backupBaseURL = getCurrentBaseUrl();
            wx.uploadFile({
              url: `${backupBaseURL}/usertx`,
              filePath: tempFilePath,
              name: 'file',
              formData: {
                id: id
              },
              success: (res) => {
                const data = JSON.parse(res.data);
                if (data.code === 0) {
                  resolve(data.data || data);
                } else {
                  wx.showToast({
                    title: data.msg || '上传失败',
                    icon: 'none'
                  });
                  reject(new Error(data.msg || '上传失败'));
                }
              },
              fail: (retryErr) => {
                wx.showToast({
                  title: '上传失败',
                  icon: 'none'
                });
                reject(retryErr);
              }
            });
          } else {
            wx.showToast({
              title: '上传失败',
              icon: 'none'
            });
            reject(err);
          }
        }
      });
    });
  },
  
  wxLogin: (code, userInfo) => {
    return request('/wxlogin', { code, userInfo }, 'POST');
  },
  
  getWxAuthConfig: () => {
    return request('/wxauth', {}, 'GET');
  },
  
  // 获取商品列表
  getProductList: () => {
    return request('/products', {}, 'GET');
  },
  
  // 获取商品详情
  getProductDetail: (productId) => {
    return request('/products/' + productId, {}, 'GET');
  },
  
  // 添加商品到购物车
  addToCart: (productId, quantity = 1) => {
    return request('/cart/add', { productId, quantity }, 'POST');
  },
  
  // 获取购物车列表
  getCartList: () => {
    return request('/cart/list', {}, 'GET');
  }
};

module.exports = {
  request,
  api
};