// pages/customerService/customerService.js
var app = getApp();
Page({
  data: {
    pre: app.globalData.pre,
    selectedFAQ: null,
    faqList: [
      {
        id: 1,
        question: '头盔如何正确佩戴？',
        answer: '头盔佩戴时应确保头盔水平覆盖额头和后脑勺，固定带调整到舒适且牢固的状态，头盔应紧贴头部但不产生压迫感。头盔佩戴过松会导致在碰撞时移位，无法提供有效保护。'
      },
      {
        id: 2,
        question: '头盔的使用寿命是多久？',
        answer: '一般来说，头盔的有效使用寿命为3-5年，即使没有发生碰撞。头盔材料会随时间老化，特别是暴露在紫外线、高温等环境中。建议定期检查头盔，如果发现裂纹、变形或内部衬垫损坏，应立即更换。'
      },
      {
        id: 3,
        question: '如何清洁和保养头盔？',
        answer: '使用温和的肥皂和清水清洁头盔外壳，避免使用有机溶剂或强效清洁剂。内衬可拆卸的头盔可以将内衬取出清洗并自然晾干。避免将头盔长时间暴露在阳光下或高温环境中，存放时应放在通风干燥处。'
      },
      {
        id: 4,
        question: '如何绑定和同步头盔设备？',
        answer: '在智安盾APP中，点击"设备管理"-"添加新设备"，按照提示开启头盔蓝牙，APP将自动搜索并连接附近的头盔设备。连接成功后，您可以设置个人信息并开始使用各项功能。'
      },
      {
        id: 5,
        question: '摄像头无法正常工作怎么办？',
        answer: '首先检查头盔电量是否充足，其次确保摄像头镜头无遮挡。如果问题仍然存在，可以尝试重启头盔或在APP中重置设备。若多次尝试后仍无法解决，请联系客服寻求进一步帮助。'
      }
    ],
    expandedFAQ: null
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('我的客服页面加载');
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 开始聊天
  startChat: function() {
    wx.navigateTo({
      url: '/pages/chat/chat',
      success: () => {
        console.log('成功跳转到AI客服聊天页面');
      },
      fail: (err) => {
        console.error('跳转失败:', err);
        wx.showToast({
          title: '连接失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 切换FAQ展开/收起状态
  toggleFAQ: function(e) {
    const faqId = e.currentTarget.dataset.id;
    this.setData({
      expandedFAQ: this.data.expandedFAQ === faqId ? null : faqId,
      selectedFAQ: this.data.selectedFAQ === faqId ? null : faqId
    });
  },

  // 拨打电话
  makePhoneCall: function() {
    wx.makePhoneCall({
      phoneNumber: '4001234567',
      success: () => {
        console.log('拨打电话成功');
      },
      fail: (err) => {
        console.error('拨打电话失败:', err);
        wx.showToast({
          title: '拨打电话失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 发送邮件
  sendEmail: function() {
    wx.setClipboardData({
      data: 'service@zhian.com',
      success: () => {
        wx.showToast({
          title: '邮箱已复制',
          icon: 'success',
          duration: 2000
        });
      }
    });
  },

  // 查看公众号
  viewOfficialAccount: function() {
    wx.showModal({
      title: '公众号关注',
      content: '请搜索公众号：智安盾头盔 进行关注',
      showCancel: false,
      confirmText: '知道了'
    });
  }
});