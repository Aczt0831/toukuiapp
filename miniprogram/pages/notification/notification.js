// pages/notification/notification.js
Page({
  data: {
    // 通知总开关
    notificationEnabled: true,
    // 各种通知类型开关
    helmetStatusEnabled: true,
    safetyAlertsEnabled: true,
    maintenanceEnabled: true,
    messagesEnabled: true,
    activitiesEnabled: true,
    // 通知方式开关
    soundEnabled: true,
    vibrationEnabled: true
  },

  onLoad() {
    this.loadNotificationSettings();
  },

  // 从缓存加载通知设置
  loadNotificationSettings() {
    const settings = wx.getStorageSync('notificationSettings') || {};
    
    this.setData({
      notificationEnabled: settings.notificationEnabled !== undefined ? settings.notificationEnabled : true,
      helmetStatusEnabled: settings.helmetStatusEnabled !== undefined ? settings.helmetStatusEnabled : true,
      safetyAlertsEnabled: settings.safetyAlertsEnabled !== undefined ? settings.safetyAlertsEnabled : true,
      maintenanceEnabled: settings.maintenanceEnabled !== undefined ? settings.maintenanceEnabled : true,
      messagesEnabled: settings.messagesEnabled !== undefined ? settings.messagesEnabled : true,
      activitiesEnabled: settings.activitiesEnabled !== undefined ? settings.activitiesEnabled : true,
      soundEnabled: settings.soundEnabled !== undefined ? settings.soundEnabled : true,
      vibrationEnabled: settings.vibrationEnabled !== undefined ? settings.vibrationEnabled : true
    });
  },

  // 保存通知设置到缓存
  saveNotificationSettings() {
    const settings = {
      notificationEnabled: this.data.notificationEnabled,
      helmetStatusEnabled: this.data.helmetStatusEnabled,
      safetyAlertsEnabled: this.data.safetyAlertsEnabled,
      maintenanceEnabled: this.data.maintenanceEnabled,
      messagesEnabled: this.data.messagesEnabled,
      activitiesEnabled: this.data.activitiesEnabled,
      soundEnabled: this.data.soundEnabled,
      vibrationEnabled: this.data.vibrationEnabled
    };
    
    wx.setStorageSync('notificationSettings', settings);
    
    // 可以在这里添加同步到服务器的代码
  },

  // 通知总开关切换
  onNotificationToggle(e) {
    const checked = e.detail;
    this.setData({
      notificationEnabled: checked
    });
    this.saveNotificationSettings();
    
    // 如果关闭总开关，可以显示提示
    if (!checked) {
      wx.showToast({
        title: '已关闭所有通知',
        icon: 'none',
        duration: 1500
      });
    }
  },

  // 头盔状态提醒开关切换
  onHelmetStatusToggle(e) {
    this.setData({
      helmetStatusEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 安全警告开关切换
  onSafetyAlertsToggle(e) {
    this.setData({
      safetyAlertsEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 维护提醒开关切换
  onMaintenanceToggle(e) {
    this.setData({
      maintenanceEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 消息通知开关切换
  onMessagesToggle(e) {
    this.setData({
      messagesEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 活动通知开关切换
  onActivitiesToggle(e) {
    this.setData({
      activitiesEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 声音提醒开关切换
  onSoundToggle(e) {
    this.setData({
      soundEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 振动提醒开关切换
  onVibrationToggle(e) {
    this.setData({
      vibrationEnabled: e.detail
    });
    this.saveNotificationSettings();
  },

  // 生命周期方法 - 页面卸载时保存设置
  onUnload() {
    this.saveNotificationSettings();
  }
})