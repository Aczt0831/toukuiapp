// pages/chat/chat.js
var app = getApp();
Page({
  data: {
    messages: [], // 消息列表
    inputText: '', // 输入框内容
    isTyping: false, // 是否正在输入
    scrollToMessage: '', // 滚动到指定消息
    apiKey: 'sk-mqkohewgomlymrxxkozbktagvhuxrdhuqzxkuiyifrwkzdlx', // SiliconFlow API Key
    conversationHistory: [], // 对话历史，用于上下文理解
    isLoading: false, // API请求加载状态
    lastRequestTime: 0, // 上次API请求时间
    minRequestInterval: 2000, // 最小请求间隔（毫秒）
    responseCache: {}, // 响应缓存，避免重复请求相同问题
    thinkingProcess: '', // 深度思考过程内容
    isThinking: false, // 是否正在进行深度思考
    manualServiceCount: 0, // 转人工客服次数统计
    hasShowPhoneTip: false // 是否已显示电话提示
  },

  onLoad: function(options) {
    console.log('AI客服页面加载');
    // 可以在这里初始化一些数据或设置
    // 移除欢迎消息，通过wxml中的硬编码消息显示
  },

  onShow: function() {
    // 页面显示时执行
  },

  // 返回上一页
  goBack: function() {
    wx.navigateBack();
  },
  
  // 中断AI生成
  interruptAIResponse: function() {
    // 停止AI生成过程
    this.setData({
      isTyping: false,
      isThinking: false,
      isLoading: false
    });
    
    // 可以给用户一个提示
    wx.showToast({
      title: '已中断AI生成',
      icon: 'none',
      duration: 1000
    });
  },

  // 输入框内容变化
  onInputChange: function(e) {
    this.setData({
      inputText: e.detail.value
    });
  },

  // 检测转人工客服请求
  checkManualServiceRequest: function(message) {
    // 检测包含"转人工客服"的相关表述
    const manualServicePatterns = [
      '转人工客服',
      '人工客服',
      '转接人工',
      '需要人工',
      '找客服',
      '人工服务',
      '人工',
      '转人工',
      '联系客服',
      '在线客服',
      '真人客服',
      '人工接入',
      '转人工服务',
      '人工帮助',
      '我要人工',
      '人工咨询',
      '人工助手',
      '需要人工帮助',
      '转在线客服',
      '转接在线客服'
    ];
    
    for (let pattern of manualServicePatterns) {
      if (message.includes(pattern)) {
        // 增加计数
        let newCount = this.data.manualServiceCount + 1;
        this.setData({ manualServiceCount: newCount });
        
        // 如果是第三次请求且未显示过电话提示
        if (newCount >= 3 && !this.data.hasShowPhoneTip) {
          // 停止AI生成过程
          this.setData({
            isTyping: false,
            isThinking: false,
            isLoading: false
          });
          
          wx.showModal({
            title: '人工客服电话',
            content: '您可以直接拨打客服电话：400-123-4567 获得人工帮助',
            showCancel: false,
            confirmText: '知道了',
            success: () => {
              this.setData({ hasShowPhoneTip: true });
            }
          });
        }
        return true;
      }
    }
    return false;
  },

  // 发送消息
  sendMessage: function() {
    const message = this.data.inputText.trim();
    if (!message) {
      return;
    }
    
    // 允许用户打断AI生成过程
    if (this.data.isTyping || this.data.isLoading) {
      // 取消当前的AI生成
      this.setData({
        isTyping: false,
        isThinking: false,
        isLoading: false
      });
    }

    // 检查请求间隔，防止频繁发送
    const now = Date.now();
    if (now - this.data.lastRequestTime < this.data.minRequestInterval) {
      wx.showToast({
        title: '请不要频繁发送消息',
        icon: 'none',
        duration: 1000
      });
      return;
    }

    // 检查是否请求转人工客服
    this.checkManualServiceRequest(message);

    // 检查是否有缓存的回复
    const cacheKey = message.toLowerCase();
    if (this.data.responseCache[cacheKey]) {
      this.handleCachedResponse(message, this.data.responseCache[cacheKey]);
      return;
    }

    // 更新最后请求时间
    this.setData({
      inputText: '',
      isTyping: true,
      isLoading: true,
      isThinking: false,
      thinkingProcess: '',
      lastRequestTime: now
    });

    // 添加用户消息到列表
    const newMessage = {
      content: message,
      reply: '',
      thinking: '',
      timestamp: now
    };
    
    const messages = [...this.data.messages, newMessage];
    const messageIndex = messages.length - 1;
    
    this.setData({
      messages: messages,
      scrollToMessage: `msg-${messageIndex}`
    });

    // 调用API获取回复
    this.getAIReply(message, messageIndex);
  },
  
  // 处理缓存的回复
  handleCachedResponse: function(message, cachedReply) {
    // 更新最后请求时间
    const now = Date.now();
    this.setData({
      inputText: '',
      lastRequestTime: now
    });

    // 添加用户消息到列表
    const newMessage = {
      content: message,
      reply: cachedReply,
      thinking: '',
      timestamp: now
    };
    
    const messages = [...this.data.messages, newMessage];
    const messageIndex = messages.length - 1;
    
    // 模拟打字延迟效果
    setTimeout(() => {
      this.setData({
        messages: messages,
        scrollToMessage: `msg-${messageIndex}-reply`
      });
    }, 500);
  },

  // 调用SiliconFlow API获取AI回复
  getAIReply: function(message, messageIndex) {
    // 更新对话历史
    this.data.conversationHistory.push({
      role: 'user',
      content: message
    });

    console.log('正在调用SiliconFlow API，用户消息：', message);
    
    // 使用SiliconFlow API调用
    const apiUrl = 'https://api.siliconflow.cn/v1/chat/completions';
    
    // 执行API调用，支持重试
    this.executeAPIRequest(apiUrl, message, messageIndex, 0);
  },
  
  // 执行API请求，带重试机制
  executeAPIRequest: function(apiUrl, message, messageIndex, retryCount) {
    const maxRetries = 2; // 最大重试次数
    const baseDelay = 2000; // 基础延迟时间（毫秒）
    
    // 先模拟深度思考过程（在等待API响应时）
    setTimeout(() => {
      if (this.data.isLoading && this.data.messages[messageIndex]) {
        // 生成模拟的思考过程
        const thinkingTexts = [
          `我需要仔细分析用户的问题："${message}"`,
          "让我回忆一下智安盾头盔的相关信息...",
          "根据用户的问题，我应该从以下几个方面来回答：",
          "首先，了解产品的基本信息...",
          "其次，考虑用户的实际使用场景...",
          "最后，提供专业且实用的建议...",
          "好了，我已经整理好思路，准备回答用户的问题。"
        ];
        
        this.setData({ isThinking: true });
        
        // 逐句显示思考过程
        let currentStep = 0;
        const showNextThinking = () => {
          // 只有在isLoading和isThinking都为true时才继续显示思考过程
          if (currentStep < thinkingTexts.length && this.data.isLoading && this.data.isThinking) {
            const messages = [...this.data.messages];
            messages[messageIndex].thinking = messages[messageIndex].thinking 
              ? messages[messageIndex].thinking + '\n' + thinkingTexts[currentStep]
              : thinkingTexts[currentStep];
            
            this.setData({
              messages: messages,
              thinkingProcess: messages[messageIndex].thinking,
              scrollToMessage: `msg-${messageIndex}-thinking`
            });
            
            currentStep++;
            setTimeout(showNextThinking, 800); // 每800ms显示一句思考
          }
        };
        
        showNextThinking();
      }
    }, 500);
    
    wx.request({
      url: apiUrl,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.data.apiKey}`
      },
      data: {
        model: 'deepseek-ai/DeepSeek-V3',
        messages: [
            { 
              role: 'system', 
              content: '你是智安盾头盔的AI客服助手，专业解答关于头盔的各种问题。回答要简洁明了，专业准确。在回答前，请先展示你的思考过程，帮助用户理解你的分析逻辑。当用户多次请求转人工客服时，友好地告知用户可以拨打客服电话400-123-4567获得人工帮助。' 
            },
            ...this.data.conversationHistory
          ],
        stream: false, // 小程序环境下禁用流式响应
        max_tokens: 1000, // 增加token数量以包含思考过程
        temperature: 0.7,
        top_p: 0.9,
        response_format: {
          type: 'text'
        }
      },
      success: (res) => {
        console.log('SiliconFlow API调用响应:', res);
        
        // 检查状态码
        if (res.statusCode === 200) {
          // 成功响应
          if (res.data && res.data.choices && res.data.choices.length > 0) {
            // 处理JSON格式的响应
            let reply = '';
            try {
              // 安全获取响应内容 - 适配SiliconFlow API响应格式
              if (typeof res.data.choices[0] === 'object' && 
                  res.data.choices[0].message && 
                  typeof res.data.choices[0].message.content === 'string') {
                const messageContent = res.data.choices[0].message.content;
                // 直接使用内容
                reply = messageContent;
              } else {
                reply = '抱歉，无法获取有效回复内容。';
              }
            } catch (e) {
              console.error('处理API响应失败:', e);
              reply = '抱歉，服务暂时不可用。';
            }
            
            console.log('AI回复:', reply);
            
            // 直接同步更新消息列表
            const messages = [...this.data.messages];
            messages[messageIndex].reply = reply;
            
            // 同步设置UI状态
            this.setData({
              messages: messages,
              isTyping: false,
              isLoading: false,
              isThinking: false,
              scrollToMessage: `msg-${messageIndex}-reply`
            });
            
            // 更新对话历史
            try {
              this.data.conversationHistory[this.data.conversationHistory.length - 1] = {
                role: 'assistant',
                content: reply
              };
            } catch (e) {
              // 忽略所有错误，确保UI正常工作
              console.error('更新对话历史失败:', e);
            }
          } else {
            // API返回数据格式异常
            this.handleAPIError(message, messageIndex, 'API返回数据格式异常', res);
          }
        } else {
          // API返回错误状态码
          let errorMsg = `API返回错误状态码: ${res.statusCode}`;
          // 根据常见状态码提供更具体的错误信息
          if (res.statusCode === 401) {
            errorMsg = 'API密钥无效，请检查API密钥';
          } else if (res.statusCode === 402) {
            errorMsg = 'API调用额度不足或需要付费';
          } else if (res.statusCode === 403) {
            errorMsg = 'API权限不足';
          } else if (res.statusCode === 429) {
            errorMsg = 'API调用频率过高，请稍后重试';
            
            // 对于429错误，尝试重试
            if (retryCount < maxRetries) {
              const delay = baseDelay * Math.pow(2, retryCount); // 指数退避
              console.log(`遇到频率限制，${delay}ms后进行第${retryCount + 1}次重试`);
              
              setTimeout(() => {
                this.executeAPIRequest(apiUrl, message, messageIndex, retryCount + 1);
              }, delay);
              return;
            }
          }
          this.handleAPIError(message, messageIndex, errorMsg, res);
        }
      },
      fail: (err) => {
        console.error('API调用请求失败:', err);
        // 对于网络错误，如果还有重试次数，进行重试
        if (retryCount < maxRetries) {
          const delay = baseDelay * Math.pow(2, retryCount);
          console.log(`网络错误，${delay}ms后进行第${retryCount + 1}次重试`);
          
          setTimeout(() => {
            this.executeAPIRequest(apiUrl, message, messageIndex, retryCount + 1);
          }, delay);
        } else {
          // 网络请求失败，所有重试都已用完
          this.handleAPIError(message, messageIndex, '网络连接失败', err);
        }
      }
    });
  },
  
  // 处理API错误，使用备用回复
  handleAPIError: function(message, messageIndex, errorMessage, errorDetails) {
    console.error('API错误:', errorMessage, errorDetails);
    
    // 根据错误类型显示不同的用户提示
    let userMessage = '服务暂时不可用';
    if (errorMessage.includes('429')) {
      userMessage = '当前咨询量较大，请稍后再试';
    } else if (errorMessage.includes('网络')) {
      userMessage = '网络连接不稳定，请检查网络';
    }
    
    // 显示错误提示给用户
    wx.showToast({
      title: userMessage,
      icon: 'none',
      duration: 2000
    });
    
    // 使用备用回复（基于关键词）
    const reply = this.generateMockReply(message);
    
    // 缓存备用回复
    this.data.responseCache[message.toLowerCase()] = reply;
    
    // 更新对话历史
    this.data.conversationHistory.push({
      role: 'assistant',
      content: reply
    });

    // 更新消息列表
    const messages = [...this.data.messages];
    messages[messageIndex].reply = reply;
    messages[messageIndex].thinking = ''; // 清除思考过程
    
    this.setData({
      messages: messages,
      isTyping: false,
      isLoading: false,
      isThinking: false,
      scrollToMessage: `msg-${messageIndex}-reply`
    });
  },

  // 生成模拟回复（用于API调用失败时的备用回复）
  generateMockReply: function(message) {
    // 检查是否包含转人工客服相关关键词
    const manualServicePatterns = [
      '转人工客服',
      '人工客服',
      '转接人工',
      '需要人工',
      '找客服',
      '人工服务'
    ];
    
    for (let pattern of manualServicePatterns) {
      if (message.includes(pattern)) {
        if (this.data.manualServiceCount >= 2) {
          return '非常抱歉，您可以直接拨打我们的客服电话：400-123-4567 获得人工帮助。客服工作时间为9:00-18:00。';
        } else {
          return '我是智安盾AI客服助手，我可以为您解答头盔相关的各类问题。请问您具体需要了解什么信息？如果您确实需要人工客服，请再次说明，我会为您提供联系方式。';
        }
      }
    }
    
    // 这里可以根据关键词生成简单回复
    const keywords = {
      '价格': '智安盾头盔的价格根据型号和功能不同有所差异，基础款价格在199-399元之间，高级款带有摄像头和通话功能的价格在499-899元不等。您可以在我们的商城页面查看具体产品价格。',
      '尺寸': '我们的头盔提供多种尺寸选择，适合不同头围的用户。S码适合54-56cm头围，M码适合57-58cm头围，L码适合59-61cm头围。建议您测量头围后选择合适的尺寸。',
      '保修': '智安盾头盔提供12个月的质量保证。在保修期内，非人为损坏的产品问题可以免费维修或更换。人为损坏可以付费维修。具体保修条款请参考产品说明书。',
      '电池': '头盔内置锂电池，满电状态下可连续使用8-12小时，待机时间长达7天。使用5V/2A充电器，约2小时可充满电。',
      '连接': '头盔通过蓝牙与手机APP连接，支持iOS和Android系统。在APP中点击\"设备管理\"-\"添加新设备\"，按照提示操作即可完成配对。',
      '防水': '智安盾头盔具有IP65级防水能力，可以在小雨天气正常使用，但不建议在暴雨环境下长时间使用。请勿将头盔浸泡在水中。',
      '清洁': '清洁头盔时，请使用软布蘸清水或中性清洁剂轻轻擦拭，避免使用有机溶剂。可拆卸内衬可以单独清洗，自然晾干后再装回。',
      '如何': '关于头盔的使用和维护方法，您可以在APP的\"使用指南\"页面查看详细教程，或者联系我们的在线客服获取专业指导。',
      '哪里': '您可以在我们的官方商城、授权经销商或各大电商平台购买智安盾头盔。如果您需要线下体验，也可以通过APP查询附近的体验店。',
      '多久': '头盔的使用寿命通常为3-5年，即使没有发生碰撞。这是因为头盔材料会随时间老化，特别是在阳光直射和高温环境下。建议定期检查头盔状况。',
      '保养': '定期清洁头盔外壳和内衬，避免长时间暴露在阳光下，存放时避免重压。头盔发生碰撞后，即使外观没有明显损坏，也应该更换，因为内部结构可能已经受损。',
      '功能': '智安盾头盔具备多种智能功能，包括蓝牙通话、音乐播放、语音控制、实时导航、安全提醒等。不同型号的功能可能有所差异，请参考具体产品说明。',
      '故障': '如果您的头盔出现故障，建议先尝试重启设备或重置出厂设置。如果问题依然存在，请联系我们的售后服务或前往授权维修中心进行检查。',
      'app': '智安盾APP是管理头盔的核心工具，您可以通过APP进行设备连接、功能设置、数据查看等操作。APP支持iOS和Android系统，可在应用商店免费下载。'
    };

    // 检查消息中是否包含关键词
    for (const [key, reply] of Object.entries(keywords)) {
      if (message.includes(key)) {
        return reply;
      }
    }

    // 默认回复
    return '感谢您的咨询！智安盾头盔是专业的安全防护装备，我们提供多种型号满足不同用户需求。如果您有具体的问题，请尝试使用更具体的关键词提问，或者拨打我们的客服电话400-123-4567获取帮助。';
  }
});