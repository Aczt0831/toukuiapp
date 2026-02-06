// pages/maintenance/maintenance.js
var app = getApp();
Page({
  data: {
    pre: app.globalData.pre,
    // 保养知识数据
    maintenanceKnowledge: [
      {
        id: 1,
        title: '定期清洁保养',
        category: '基础维护',
        content: '头盔气囊的定期清洁非常重要，建议每周进行一次简单清洁，每月进行一次深度清洁。\n\n清洁步骤：\n1. 使用温和的肥皂和温水轻轻擦拭气囊表面\n2. 避免使用刺激性清洁剂或漂白剂\n3. 自然晾干，避免阳光直射\n4. 保持通风干燥，防止异味产生',
        image: '../../static/images/tkimg.png',
        tips: '清洁时不要过度用力，以免损伤气囊材质。'
      },
      {
        id: 2,
        title: '气囊检查方法',
        category: '安全检查',
        content: '定期检查头盔气囊的完整性和使用状态是确保安全的关键。\n\n检查要点：\n1. 检查气囊是否有明显的磨损或撕裂\n2. 检查气囊的弹性是否正常\n3. 检查气囊与头盔的连接是否牢固\n4. 检查气囊是否有老化现象（如变硬、变色等）',
        image: '../../static/images/tkimg.png',
        tips: '检查频率建议为每周一次，骑行前必检。'
      },
      {
        id: 3,
        title: '更换周期指南',
        category: '使用建议',
        content: '头盔气囊有一定的使用寿命，及时更换是保障安全的重要措施。\n\n更换周期：\n1. 正常使用情况下，建议每2-3年更换一次\n2. 如果头盔经历过碰撞，应立即检查并考虑更换\n3. 长期不使用（超过6个月）后再次使用前应检查\n4. 如发现气囊有明显老化或损坏，应立即更换',
        image: '../../static/images/tkimg.png',
        tips: '即使未使用，头盔气囊也会随时间老化，建议定期检查。'
      }
    ],
    // 当前显示的详情知识
    currentKnowledge: null,
    // 是否显示详情页
    showDetail: false
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('头盔气囊保养页面加载');
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 查看保养详情
  viewMaintenanceDetail: function(e) {
    const knowledgeId = e.currentTarget.dataset.id;
    const knowledge = this.getKnowledgeById(knowledgeId);
    
    if (knowledge) {
      // 将内容按换行符分割为数组，便于在页面中渲染
      const contentArray = knowledge.content.split('\n');
      knowledge.contentArray = contentArray.filter(line => line.trim() !== '');
      
      this.setData({
        currentKnowledge: knowledge,
        showDetail: true
      });
    }
  },

  // 关闭详情页
  closeDetail: function() {
    this.setData({
      showDetail: false,
      currentKnowledge: null
    });
  },

  // 预约保养服务
  makeAppointment: function() {
    wx.navigateTo({
      url: '/pages/maintenance/appointment',
      success: function() {
        console.log('预约保养页面跳转成功');
      },
      fail: function(error) {
        console.error('预约保养页面跳转失败:', error);
        wx.showToast({
          title: '跳转失败，请重试',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  // 根据ID获取知识
  getKnowledgeById: function(id) {
    return this.data.maintenanceKnowledge.find(item => item.id === id);
  },
  
  // 分享保养知识
  shareKnowledge: function() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    });
  },
  
  // 收藏保养知识
  favoriteKnowledge: function() {
    wx.showToast({
      title: '收藏成功',
      icon: 'success',
      duration: 2000
    });
  }
});