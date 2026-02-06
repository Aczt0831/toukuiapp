// pages/videoPlayback/videoPlayback.js
var app = getApp();
Page({
  data: {
    pre: app.globalData.pre,
    videos: [],
    selectedVideo: null,
    loading: false
  },
  
  // 获取视频列表
  fetchVideoList: function() {
    const that = this;
    that.setData({
      loading: true
    });
    
    wx.request({
      url: that.data.pre + '/video-playback',
      method: 'GET',
      timeout: 10000,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log('获取视频列表响应:', res);
        
        // 处理响应数据
        if (res.statusCode === 200) {
          const response = res.data;
          // 检查是否是标准的Result格式
          if (response && (response.code === 0 || response.success)) {
            const videoData = response.data || [];
            
            // 转换后端数据格式为前端需要的格式
            const formattedVideos = videoData.map(video => ({
              id: video.id,
              name: video.name,
              url: video.url || '',
              thumbnail: video.thumbnail ? that.data.pre + '/static/images/' + video.thumbnail : '../../static/images/tkimg.png',
              date: video.date,
              time: video.time,
              duration: video.duration,
              isNew: video.isNew === 1
            }));
            
            that.setData({
              videos: formattedVideos
            });
            console.log('格式化后的视频列表:', formattedVideos);
          } else {
            console.error('获取视频列表失败:', response.msg || '未知错误');
            wx.showToast({
              title: '获取视频列表失败',
              icon: 'none'
            });
          }
        } else {
          console.error('请求失败，状态码:', res.statusCode);
          wx.showToast({
            title: '网络请求失败',
            icon: 'none'
          });
        }
      },
      fail: function(error) {
        console.error('请求视频列表失败:', error);
        wx.showToast({
          title: '请求失败，请重试',
          icon: 'none'
        });
      },
      complete: function() {
        that.setData({
          loading: false
        });
      }
    });
  },
  
  // 标记视频为已查看
  markVideoAsViewed: function(videoId) {
    const that = this;
    
    wx.request({
      url: that.data.pre + '/video-playback/' + videoId + '/viewed',
      method: 'PUT',
      timeout: 10000,
      header: {
        'content-type': 'application/json'
      },
      success: function(res) {
        console.log('标记视频已查看响应:', res);
        // 标记成功后不需要特别处理，前端已经更新了状态
      },
      fail: function(error) {
        console.error('标记视频已查看失败:', error);
      }
    });
  },

  onLoad: function(options) {
    // 页面加载时的初始化逻辑
    console.log('摄像头视频回放页面加载');
    // 获取视频列表
    this.fetchVideoList();
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },

  // 选择视频
  selectVideo: function(e) {
    const videoId = e.currentTarget.dataset.id;
    const selectedVideo = this.data.videos.find(video => video.id === videoId);
    
    if (selectedVideo) {
      // 复制对象并移除isNew标记
      const updatedVideo = {...selectedVideo};
      updatedVideo.isNew = false;
      
      // 更新视频列表
      const updatedVideos = this.data.videos.map(video => 
        video.id === videoId ? updatedVideo : video
      );
      
      this.setData({
        selectedVideo: updatedVideo,
        videos: updatedVideos
      });
      
      // 调用后端接口标记视频为已查看
      this.markVideoAsViewed(videoId);
      
      // 在实际应用中，这里可以加载和播放视频
      console.log('选择视频:', updatedVideo.name);
    }
  }
});