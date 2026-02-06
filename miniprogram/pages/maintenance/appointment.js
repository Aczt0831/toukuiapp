// pages/maintenance/appointment.js
Page({
  data: {
    // 用户信息
    userName: '',
    phoneNumber: '',
    
    // 头盔信息
    helmetModels: ['智安盾TK-01', '智安盾TK-02', '智安盾TK-03', '智安盾TK-04', '其他型号'],
    modelIndex: 0,
    purchaseDate: '',
    
    // 保养类型
    maintenanceTypes: ['清洁保养', '气囊检查', '固件升级', '零部件更换', '故障维修'],
    selectedTypes: [false, false, false, false, false],
    
    // 预约信息
    appointmentDate: '',
    appointmentTime: '',
    remark: '',
    
    // 日期范围
    currentDate: '',
    maxDate: ''
  },

  onLoad: function(options) {
    // 初始化日期范围
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const currentDate = `${year}-${month}-${day}`;
    
    // 最大日期为3个月后
    const maxDateObj = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    const maxYear = maxDateObj.getFullYear();
    const maxMonth = (maxDateObj.getMonth() + 1).toString().padStart(2, '0');
    const maxDay = maxDateObj.getDate().toString().padStart(2, '0');
    const maxDate = `${maxYear}-${maxMonth}-${maxDay}`;
    
    this.setData({
      currentDate: currentDate,
      maxDate: maxDate
    });
    
    console.log('预约保养页面加载');
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 姓名输入
  onNameInput: function(e) {
    this.setData({
      userName: e.detail.value
    });
  },

  // 手机号码输入
  onPhoneInput: function(e) {
    this.setData({
      phoneNumber: e.detail.value
    });
  },

  // 头盔型号选择
  onModelChange: function(e) {
    this.setData({
      modelIndex: e.detail.value
    });
  },

  // 购买时间选择
  onPurchaseDateChange: function(e) {
    this.setData({
      purchaseDate: e.detail.value
    });
  },

  // 切换保养类型
  toggleMaintenanceType: function(e) {
    const index = e.currentTarget.dataset.index;
    const selectedTypes = [...this.data.selectedTypes];
    selectedTypes[index] = !selectedTypes[index];
    
    this.setData({
      selectedTypes: selectedTypes
    });
  },

  // 预约日期选择
  onAppointmentDateChange: function(e) {
    this.setData({
      appointmentDate: e.detail.value
    });
  },

  // 预约时间选择
  onAppointmentTimeChange: function(e) {
    this.setData({
      appointmentTime: e.detail.value
    });
  },

  // 备注输入
  onRemarkInput: function(e) {
    this.setData({
      remark: e.detail.value
    });
  },

  // 表单验证
  validateForm: function() {
    const { userName, phoneNumber, modelIndex, purchaseDate, selectedTypes, appointmentDate, appointmentTime } = this.data;
    
    // 验证姓名
    if (!userName.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    // 验证手机号码
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    // 验证购买时间
    if (!purchaseDate) {
      wx.showToast({
        title: '请选择购买时间',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    // 验证保养类型
    const hasSelectedType = selectedTypes.some(type => type);
    if (!hasSelectedType) {
      wx.showToast({
        title: '请至少选择一种保养类型',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    // 验证预约日期和时间
    if (!appointmentDate) {
      wx.showToast({
        title: '请选择预约日期',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    if (!appointmentTime) {
      wx.showToast({
        title: '请选择预约时间',
        icon: 'none',
        duration: 2000
      });
      return false;
    }
    
    return true;
  },

  // 提交预约
  submitAppointment: function() {
    // 表单验证
    if (!this.validateForm()) {
      return;
    }
    
    // 构造预约数据
    const { userName, phoneNumber, helmetModels, modelIndex, purchaseDate, maintenanceTypes, selectedTypes, appointmentDate, appointmentTime, remark } = this.data;
    
    // 获取选中的保养类型
    const selectedMaintenanceTypes = [];
    selectedTypes.forEach((selected, index) => {
      if (selected) {
        selectedMaintenanceTypes.push(maintenanceTypes[index]);
      }
    });
    
    const appointmentData = {
      userName,
      phoneNumber,
      helmetModel: helmetModels[modelIndex],
      purchaseDate,
      maintenanceTypes: selectedMaintenanceTypes,
      appointmentDate,
      appointmentTime,
      remark,
      submitTime: new Date().toISOString() // 预约提交时间
    };
    
    console.log('预约数据:', appointmentData);
    
    // 显示加载提示
    wx.showLoading({
      title: '提交中...',
      mask: true
    });
    
    // 模拟API请求
    setTimeout(() => {
      // 隐藏加载提示
      wx.hideLoading();
      
      // 显示预约成功提示
      wx.showModal({
        title: '预约成功',
        content: `您的预约已提交成功！\n\n预约时间：${appointmentDate} ${appointmentTime}\n预约服务：${selectedMaintenanceTypes.join(', ')}\n\n我们会在预约时间前与您联系确认。`,
        showCancel: false,
        success: (res) => {
          if (res.confirm) {
            // 返回上一页
            wx.navigateBack();
          }
        }
      });
    }, 1500);
    
    // 在实际应用中，这里应该调用后端API提交预约数据
    /*
    wx.request({
      url: 'https://api.example.com/appointments',
      method: 'POST',
      data: appointmentData,
      success: (res) => {
        wx.hideLoading();
        // 处理成功响应
      },
      fail: (err) => {
        wx.hideLoading();
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
    */
  }
});