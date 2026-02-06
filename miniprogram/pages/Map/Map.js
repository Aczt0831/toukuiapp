// pages/Map/Map.js
var app = getApp()
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';
Page({
  data: {
    pre: app.globalData.pre,
    markersNum: 0,
    id: "",
    latitude: 0,   // 纬度
    longitude: 0,  // 经度
    userlatitude: 0,
    userlongitude: 0,
    markers: [],
    wishLocation: [],
    wishLocationNum: 0,
    foots: [],
    footsNum: 0,
    list: [],
    locations: [],
    isSearch: false,
    SearchValue: "",
    localCity: "全国",
    isLocal: false,
    show: false,
    footshow: false,
    focus: false,
    show2: false,
    show3: false,
    mapsize: 14,
    actions: [],
    actions3:[],
    getmarkerid: 0,
    // 路线规划相关数据
    startPoint: null,  // 起点
    endPoint: null,    // 终点
    polyline: [],      
    isRoutePlanning: false, // 是否处于路线规划模式
    routeMode: 0,      // 0: 驾车 1: 步行 2: 公交
    showRoutePanel: false, // 是否显示路线规划面板
    // 动画和状态控制
    mapAnimating: false, // 地图是否正在动画中
    loading: false, 
    toastMsg: '', 
    showToast: false // 是否显示提示
  },
  
  // 显示自定义提示
  showToast(msg, duration = 2000) {
    this.setData({
      toastMsg: msg,
      showToast: true
    });
    setTimeout(() => {
      this.setData({ showToast: false });
    }, duration);
  },
  onClose() {
    this.setData({ show2: false });
  },
  onClose3() {
    this.setData({ show3: false });
  },
  onSelect(event) {
    console.log(event.detail);
    const that = this;
    const id = this.data.getmarkerid;
    const data = {
      id: id
    }

    if (event.detail.name === '已完成心愿') {
      wx.request({
        url: this.data.pre + '/addfootprint',
        method: 'POST',
        data: data,
        header: {
          'content-type': 'application/x-www-form-urlencoded' // 设置 content-type
        },
        success: (res) => {
          console.log(res);
          if(res.data.code == 0) {
            wx.showToast({
              title: '已完成！',
              duration: 500
            });
          }
          that.setData({
            show2: false
          })
          that.getUserMarkers(this.data.id)
        }
      })
    } else if (event.detail.name === '删除该标记') {
      const formData = {
        userid: parseInt(this.data.id),
        id: id
      };
      this.deleteMarkerMeth(formData);
    }
  },
  onSelect3(event) {
    const id = this.data.getmarkerid;
    
    if (event.detail.name === '删除该标记') {
      const formData = {
        userid: parseInt(this.data.id),
        id: id
      };
      this.deleteMarkerMeth(formData);
    }
  },
  
  // 切换到路线规划模式
  switchToRoutePlanning() {
    this.setData({
      isRoutePlanning: !this.data.isRoutePlanning,
      startPoint: null,
      endPoint: null,
      polyline: []
    });
    if (this.data.isRoutePlanning) {
      wx.showToast({
        title: '请先选择起点',
        icon: 'none'
      });
    }
  },
  
  // 选择起点或终点
  selectRoutePoint(e) {
    if (!this.data.isRoutePlanning) return;
    
    const marker = this.data.markers.find(m => m.id === e.markerId);
    if (!marker) return;
    
    if (!this.data.startPoint) {
      // 选择起点
      this.setData({
        startPoint: marker,
        markers: this.data.markers.map(m => {
          if (m.id === marker.id) {
            return { ...m, iconPath: '../../static/images/start.png' };
          }
          return m;
        })
      });
      wx.showToast({
        title: '请选择终点',
        icon: 'none'
      });
    } else if (!this.data.endPoint && this.data.startPoint.id !== marker.id) {
      // 选择终点
      this.setData({
        endPoint: marker,
        markers: this.data.markers.map(m => {
          if (m.id === marker.id) {
            return { ...m, iconPath: '../../static/images/end.png' };
          }
          return m;
        })
      });
      // 规划路线
      this.planRoute();
    } else {
      // 重置选择
      this.setData({
        startPoint: marker,
        endPoint: null,
        polyline: [],
        markers: this.data.markers.map(m => {
          // 恢复原始图标
          if (m.isGone === 0) {
            return { ...m, iconPath: '../../static/images/wz2.png' };
          } else {
            return { ...m, iconPath: '../../static/images/zj.png' };
          }
        }).map(m => {
          if (m.id === marker.id) {
            return { ...m, iconPath: '../../static/images/start.png' };
          }
          return m;
        })
      });
      wx.showToast({
        title: '请选择终点',
        icon: 'none'
      });
    }
  },
  
  // 规划路线
  planRoute() {
    const { startPoint, endPoint, routeMode } = this.data;
    
    if (!startPoint || !endPoint) {
      wx.showToast({
        title: '请先选择起点和终点',
        icon: 'none'
      });
      return;
    }
    
    console.log('起点:', startPoint);
    console.log('终点:', endPoint);
    
    // 路线规划API - 使用驾车模式作为默认，更稳定
    const mode = 'driving'; // 暂时固定为驾车模式，更可靠
    
    wx.showLoading({
      title: '正在规划路线...',
    });
    
    wx.request({
      url: `https://apis.map.qq.com/ws/direction/v1/${mode}`,
      data: {
        from: `${startPoint.latitude},${startPoint.longitude}`,
        to: `${endPoint.latitude},${endPoint.longitude}`,
        key: '',
        //这个api不能实现真实的路径规划，需要更换商业版的api才能真实实现路径规划
        // 备用密钥: 0oQNbl9ekIe4ItwBWKhgMZVyeKmHkQfv
        output: 'json'
      },
      success: (res) => {
        wx.hideLoading();
        console.log('路线规划API返回:', res.data);
        
        if (res.data && res.data.status === 0) {
          try {
            const polylinePoints = this.parseRouteData(res.data.result, mode);
            console.log('解析后的路线点数量:', polylinePoints.length);
            
            if (polylinePoints.length > 0) {
              this.setData({
                polyline: [{
                  points: polylinePoints,
                  color: '#0080ff',
                  width: 6,
                  dottedLine: false
                }],
                showRoutePanel: true
              });
              
              // 调整地图视野以显示完整路线
              this.includePoints(polylinePoints);
            } else {
              wx.showToast({
                title: '无法生成有效路线',
                icon: 'none'
              });
            }
          } catch (error) {
            console.error('路线数据解析错误:', error);
            wx.showToast({
              title: '路线数据解析失败',
              icon: 'none'
            });
          }
        } else {
          const errorMsg = res.data && res.data.message ? res.data.message : '路线规划失败';
          console.error('路线规划失败:', errorMsg);
          wx.showToast({
            title: errorMsg,
            icon: 'none',
            duration: 3000
          });
          
          // 当API返回错误时（如调用量上限），自动使用备用路线
          this.useSimpleRoute();
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('网络请求失败:', err);
        wx.showToast({
          title: '网络连接失败，请检查网络',
          icon: 'none'
        });
        
        // 备用方案：如果API调用失败，使用简单的两点连线
        this.useSimpleRoute();
      }
    });
  },
  
  // 调整地图视野以包含所有路线点
  includePoints(points) {
    if (points.length === 0) return;
    
    let minLat = points[0].latitude;
    let maxLat = points[0].latitude;
    let minLng = points[0].longitude;
    let maxLng = points[0].longitude;
    
    points.forEach(point => {
      minLat = Math.min(minLat, point.latitude);
      maxLat = Math.max(maxLat, point.latitude);
      minLng = Math.min(minLng, point.longitude);
      maxLng = Math.max(maxLng, point.longitude);
    });
    
    // 计算中心点
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    
    // 设置地图中心点
    this.setData({
      latitude: centerLat,
      longitude: centerLng
    });
  },
  
  // 备用简单路线（当API调用失败时）
  useSimpleRoute() {
    const { startPoint, endPoint } = this.data;
    if (!startPoint || !endPoint) return;
    
    const simplePoints = [
      { latitude: startPoint.latitude, longitude: startPoint.longitude },
      { latitude: endPoint.latitude, longitude: endPoint.longitude }
    ];
    
    this.setData({
      polyline: [{
        points: simplePoints,
        color: '#ff4d4f',
        width: 4,
        dottedLine: true
      }],
      showRoutePanel: true
    });
    
    wx.showToast({
      title: '使用简易路线，建议检查网络',
      icon: 'none'
    });
  },
  
  // 解析路线数据
  parseRouteData(result, mode) {
    const polylinePoints = [];
    
    try {
      // 检查result结构
      if (!result || !result.routes || result.routes.length === 0) {
        console.error('无效的路线数据结构');
        return polylinePoints;
      }
      
      const route = result.routes[0];
      
      if (mode === 'driving' || mode === 'walking') {
        // 驾车和步行路线解析
        if (route.steps && route.steps.length > 0) {
          route.steps.forEach(step => {
            if (step.polyline) {
              const polyline = step.polyline.split(';');
              polyline.forEach(point => {
                const [lng, lat] = point.split(',');
                if (lng && lat) {
                  polylinePoints.push({
                    longitude: parseFloat(lng),
                    latitude: parseFloat(lat)
                  });
                }
              });
            }
          });
        }
      } else if (mode === 'transit') {
        // 公交路线解析 - 暂时不处理，因为驾车模式更稳定
        console.log('公交模式暂时不支持');
      }
      
      // 如果没有解析到点，添加起终点作为备用
      if (polylinePoints.length === 0 && this.data.startPoint && this.data.endPoint) {
        polylinePoints.push(
          { latitude: this.data.startPoint.latitude, longitude: this.data.startPoint.longitude },
          { latitude: this.data.endPoint.latitude, longitude: this.data.endPoint.longitude }
        );
      }
      
    } catch (error) {
      console.error('路线解析错误:', error);
    }
    
    return polylinePoints;
  },
  
  // 切换出行方式
  changeRouteMode(e) {
    const mode = e.currentTarget.dataset.mode;
    this.setData({ routeMode: mode });
    
    // 提示用户当前主要使用驾车模式
    if (mode !== 0) {
      wx.showToast({
        title: '当前主要支持驾车路线',
        icon: 'none'
      });
    }
    
    if (this.data.startPoint && this.data.endPoint) {
      this.planRoute();
    }
  },
  
  // 开始导航
  startNavigation() {
    const { startPoint, endPoint } = this.data;
    
    if (!startPoint || !endPoint) {
      wx.showToast({
        title: '请先选择起点和终点',
        icon: 'none'
      });
      return;
    }
    
    console.log('开始导航，终点坐标:', endPoint);
    
    // 调用微信内置地图导航
    wx.openLocation({
      latitude: endPoint.latitude,
      longitude: endPoint.longitude,
      name: endPoint.localname || '终点',
      address: endPoint.localname || '',
      scale: 18
    });
  },
  
  // 重置路线规划
  resetRoute() {
    this.setData({
      startPoint: null,
      endPoint: null,
      polyline: [],
      showRoutePanel: false,
      markers: this.data.markers.map(m => {
        // 恢复原始图标
        if (m.isGone === 0) {
          return { ...m, iconPath: '../../static/images/wz2.png' };
        } else {
          return { ...m, iconPath: '../../static/images/zj.png' };
        }
      })
    });
    wx.showToast({
      title: '请先选择起点',
      icon: 'none'
    });
  },

  //逆地址解析当前地址
  reverseGeocoding() {
    this.cancleAdd();
    this.getDetailedLocation();
    console.log(this.data.latitude);
    const latitude = this.data.userlatitude;
    const longitude = this.data.userlongitude;
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1',
      data: {
        location: latitude + ',' + longitude,
        key: 'TQ4BZ-YHACG-JC4QK-QOS37-FGAUF-GIFZ7' 
      },
      success: (res) => {
        console.log(res);
        if (res.data && res.data.result) {
          const address = res.data.result.address;
          const formattedAddress = res.data.result.formatted_addresses.recommend;
  
          // 输出逆地址解析结果
          console.log('经度:', longitude, '纬度:', latitude);
          console.log('推荐地址:', formattedAddress);
          console.log('详细地址:', address);

          Dialog.confirm({
            title: '是否添加该地点至足迹',
            message: formattedAddress
          }).then(() => {
            const data = {
              userid: this.data.id,
              latitude: latitude,
              longitude: longitude,
              iconPath: '../../static/images/zj.png', 
              width: 30,
              height: 30,
              localname: formattedAddress,
              isGone: 1
            };
            wx.request({
              url: this.data.pre + '/addmarker',
              method: 'POST',
              data: data,
              success: (res) => {
                if (res.data.code === 0) {
                  wx.showToast({
                    title: '添加成功！',
                    duration: 500
                  });
                  this.setData({
                    SearchValue: "",
                    isLocal: false
                  })
                  this.getUserMarkers(this.data.id)
                } else {
                  wx.showToast({
                    title: res.data.msg,
                    image: "../../static/images/!.png",
                    duration: 2000
                  });
                }
              },
              fail: (res) => {
                console.error('请求失败', res);
              }
            })
          }).catch(() => {
            // on cancel
          });
          
          // 可以将地址信息保存在data中，或者进行其他操作
        } else {
          console.error('未找到逆地址解析结果');
        }
      },
      fail: (err) => {
        console.error('逆地址解析失败:', err);
      }
    });
  },

  addScale() {
    wx.vibrateShort({
      success:(res)=> {
        if(this.data.mapsize != 20) {
          this.setData({
            mapsize: this.data.mapsize+1
          })
        }
      }
    })
  },
  minusScale() {
    wx.vibrateShort({
      success:(res)=> {
        if(this.data.mapsize != 3) {
          this.setData({
            mapsize: this.data.mapsize-1
          })
        }
      }
    })
  },
  

  //取消搜索
  cancleAdd() {
    wx.vibrateShort({
      success:(res)=> {
        this.getUserMarkers(this.data.id);
        this.setData({
          SearchValue: "",
          isSearch: false,
          isLocal: false
        })
      }
    })
    
  },

  //定位用户当前位置
  getuserlocal() {
    wx.vibrateShort({
      success:(res)=> {
        this.getDetailedLocation();
      }
    })
  },

  //点击地图标记
  markerTap: function(e) {
    var markerid = e.markerId;
    console.log('Marker Id:', markerid);
    
    // 如果处于路线规划模式，执行路线点选择
    if (this.data.isRoutePlanning) {
      this.selectRoutePoint(e);
      return;
    }
    
    this.setData({
      getmarkerid: markerid
    })
    const marker = this.data.markers.find(marker => marker.id === e.markerId);
    if (marker) {
      console.log('Marker Title:', marker.localname);
      console.log(marker.isGone);
      // 在这里可以根据 marker.title 执行相应的逻辑
    }
    if(marker.isGone === 0) {
      this.setData({
        actions: [
          {
            name: marker.localname,
            disabled: true
          },
          {
            name: '已完成心愿'
          },
          {
            name: '删除该标记'
          }
        ],
      })
      this.setData({
        show2: true
      })
    } else if(marker.isGone === 1) {
      this.setData({
        actions3: [
          {
            name: marker.localname,
            disabled: true
          },
          {
            name: '删除该标记'
          }
        ],
      })
      console.log(this.data.actions3);
      this.setData({
        show3: true
      })
    }
  },

  //页面加载时获取用户id
  onLoad() {
    let self = this;
    // 尝试从缓存获取用户ID
    wx.getStorage({
      key: 'id',
      success: function (res) {
        if (res.data) {
          self.setData({
            id: res.data
          })
          self.getUserMarkers(self.data.id);
        } else {
          console.log('缓存中没有数据');
          // 尝试从全局变量获取用户ID
          if (app.globalData.userInfo && app.globalData.userInfo.id) {
            self.setData({
              id: app.globalData.userInfo.id
            });
            self.getUserMarkers(self.data.id);
          } else {
            self.setData({
              markers: []
            });
            wx.showToast({
              title: '请先登录',
              icon: 'none',
              duration: 2000
            });
          }
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        // 尝试从全局变量获取用户ID
        if (app.globalData.userInfo && app.globalData.userInfo.id) {
          self.setData({
            id: app.globalData.userInfo.id
          });
          self.getUserMarkers(self.data.id);
        } else {
          self.setData({
            markers: []
          });
        }
      }
    });
  },
  
  //页面显示时刷新用户id
  onShow() {
    let self = this;
    wx.getStorage({
      key: 'id',
      success: function (res) {
        if (res.data) {
          self.setData({
            id: res.data
          })
          self.getUserMarkers(self.data.id);
        } else {
          console.log('缓存中没有数据');
          self.setData({
            markers: []
          })
          
        }
      },
      fail: function (err) {
        console.log('获取缓存失败', err);
        self.setData({
          markers: []
        })
      }
    });
  },
  //删除标记
  deleteMarker(event) {
    const id = event.currentTarget.dataset.id;
    const formData = {
      userid: parseInt(this.data.id),
      id: id
    };
    this.deleteMarkerMeth(formData);
  },   

  //删除标记的方法
  deleteMarkerMeth(formData) {
    const that = this; // 存储正确的 this

Dialog.confirm({
    message: '确认删除该标记吗'
}).then(function() {
    // 发起请求
    wx.request({
        url: that.data.pre + '/deletemarker',
        method: 'POST',
        data: formData,
        header: {
            'content-type': 'application/x-www-form-urlencoded' // 设置 content-type
        },
        success: (res) => {
            console.log(res);
            if (res.data.code === 0) {
                wx.showToast({
                    title: '删除成功！',
                    duration: 500
                });
                that.getUserMarkers(that.data.id)

                that.setData({
                  show2: false,
                  show3: false
                })
                console.log(1);
            } else {
                wx.showToast({
                    title: res.data.msg,
                    image: "../../static/images/!.png",
                    duration: 2000
                });
            }
        },
        fail: (res) => {
            console.error('请求失败', res);
        }
    });
}).catch(() => {
    // on cancel
});
  },

  closeMarkers() {
    this.setData({ show: false });
  },
  openMarkers() {
    this.setData({
      show: true
    })
  },
  openFoots() {
    this.setData({
      footshow: true
    })
  },
  closeFoots() {
    this.setData({
      footshow: false
    })
  },

  //获取用户标记地点
  getUserMarkers(id) {
    let self = this;
    console.log(id);
    wx.request({
      url: this.data.pre + '/getmarkers?id=' + id,
      method: 'GET',
      success: (res) => {
        if (res.data.code === 0) {
          console.log(res);
          const markers = res.data.data;
          // 设置标记的图标
          const formattedMarkers = markers.map(marker => ({
            ...marker,
            iconPath: marker.isGone === 0 ? '../../static/images/wz2.png' : '../../static/images/zj.png',
            width: 30,
            height: 30
          }));
          const filteredMarkers = formattedMarkers.filter(marker => marker.isGone === 0);
          const filteredFoots = formattedMarkers.filter(marker => marker.isGone === 1);
          const filteredMarkersNum = filteredMarkers.length;
          const filteredFootsNum = filteredFoots.length;
          self.setData({
            markers: formattedMarkers,
            wishLocation: filteredMarkers,
            foots: filteredFoots,
            wishLocationNum: filteredMarkersNum,
            footsNum: filteredFootsNum
          });
          console.log(self.data.wishLocation);
          console.log(self.data.foots);
        } else {
          self.setData({
            markers: [],
            wishLocation: [],
            foots: [],
            wishLocationNum: 0,
            footsNum: 0
          })
        }
      },
      fail: (res) => {
        console.error('请求失败', res);
      }
    })
  },
  
  //添加标记
  addMarkers: function(event) {
    // 检查用户ID是否存在
    if (!this.data.id) {
      // 尝试重新获取用户ID
      let self = this;
      wx.getStorage({
        key: 'id',
        success: function (res) {
          if (res.data) {
            self.setData({
              id: res.data
            });
            self.doAddMarker();
          } else {
            // 尝试从全局变量获取
            if (app.globalData.userInfo && app.globalData.userInfo.id) {
              self.setData({
                id: app.globalData.userInfo.id
              });
              self.doAddMarker();
            } else {
              wx.showToast({
                title: '请先登录',
                icon: 'none',
                duration: 2000
              });
            }
          }
        },
        fail: function () {
          wx.showToast({
            title: '获取用户信息失败',
            icon: 'none',
            duration: 2000
          });
        }
      });
      return;
    }
    
    this.doAddMarker();
  },
  
  //实际执行添加标记的方法
  doAddMarker: function() {
    const data = {
      userid: this.data.id,
      latitude: this.data.latitude,
      longitude: this.data.longitude,
      iconPath: '../../static/images/wz2.png', 
      width: 30,
      height: 30,
      localname: this.data.SearchValue
    };
    
    wx.request({
      url: this.data.pre + '/addmarker',
      method: 'POST',
      data: data,
      success: (res) => {
        if (res.data.code === 0) {
          wx.showToast({
            title: '添加成功！',
            duration: 500
          });
          this.setData({
            SearchValue: "",
            isLocal: false
          })
          this.getUserMarkers(this.data.id)
        } else {
          wx.showToast({
            title: res.data.msg || '添加失败',
            image: "../../static/images/!.png",
            duration: 2000
          });
        }
      },
      fail: (res) => {
        console.error('请求失败', res);
        wx.showToast({
          title: '网络请求失败',
          image: "../../static/images/!.png",
          duration: 2000
        });
      }
    })
  },

  //关闭搜索框页
  goBack() {
    this.setData({
      isSearch: false
    })
    if(this.data.SearchValue=="") {
      this.setData({
        locations: [],
        mapsize: 14
      })
    }
  },

  //打开搜索框页
  goSearch() {
    this.setData({
      isSearch: true,
      isLocal: false,
      SearchValue: ""
    })
    this.getUserMarkers(this.data.id)
    // 使用setTimeout延迟设置焦点，确保在视图渲染完成后再聚焦
    setTimeout(() => {
      this.setData({
        focus: true
      })
    }, 100)
  },

  //点击查找的结果并返回该地点的坐标
  selectLocation: function (e) {
    const index = e.currentTarget.dataset.index;
    const selectedLocation = this.data.locations[index];

    this.setData({
      SearchValue: selectedLocation,
    });
    const keyword = this.data.SearchValue.trim();
    console.log(selectedLocation);
    
    // 显示加载提示
    wx.showLoading({
      title: '定位中...',
    });
    
    wx.request({
      url: 'https://apis.map.qq.com/ws/geocoder/v1',
      data: {
        address: selectedLocation,
        key: 'TQ4BZ-YHACG-JC4QK-QOS37-FGAUF-GIFZ7' // 替换为您申请的地图API密钥
      },
      success: (res) => {
        console.log(res);
        wx.hideLoading();
        if (res.data && res.data.result) {
          const location = res.data.result.location;
          const latitude = location.lat;
          const longitude = location.lng;
  
          // 输出经纬度信息
          console.log('地名:', selectedLocation, '经度:', longitude, '纬度:', latitude);
          
          //做标记
          let currentMarkers = this.data.markers;
          // 清除之前的临时标记
          currentMarkers = currentMarkers.filter(marker => marker.id !== 1);
          let newMarker = {
            id: 1, // 临时标记ID
            latitude: latitude,
            longitude: longitude,
            iconPath: '../../static/images/wz3.png', // 如果需要显示自定义图标，可以设置iconPath
            width: 30,
            height: 30
          };
          currentMarkers.push(newMarker);

          // 可以将经纬度信息保存在data中，或者进行其他操作
          this.setData({
            latitude: latitude,
            longitude: longitude,
            isSearch: false,
            markers: currentMarkers,
            isLocal: true,
            mapsize: 14
          })
          console.log(this.data.mapsize);
          
          // 显示提示，指导用户点击添加按钮
          wx.showToast({
            title: '点击添加按钮保存心愿地点',
            icon: 'none',
            duration: 2000
          });
        } else {
          console.error('未找到地名对应的经纬度信息');
          wx.showToast({
            title: "未找到该地点坐标！",
            image: "../../static/images/!.png",
            duration: 2000
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('查询地名失败:', err);
        wx.showToast({
          title: "未找到该地点坐标！",
          image: "../../static/images/!.png",
          duration: 2000
        });
      }
    });
  
    
  },

  //输入框输入内容
  onInput: function (e) {
    this.setData({
      SearchValue: e.detail.value
    })
    const keyword = this.data.SearchValue.trim();
    this.getLocall(keyword);
  },

  //获取模糊查询后的数据
  getLocall(keyword) {
    if (keyword.length > 0) {
      // 调用微信小程序提供的地理位置服务接口进行查询
      wx.request({
        url: 'https://apis.map.qq.com/ws/place/v1/suggestion',
        data: {
          keyword: keyword,
          region: this.data.localCity,
          key: 'TQ4BZ-YHACG-JC4QK-QOS37-FGAUF-GIFZ7' // 替换为您申请的地图API密钥
        },
        success: (res) => {
          if (res.data && res.data.data) {
            const locations = res.data.data.map((item) => {
              return item.title;
            });
        
            this.setData({
              locations: locations
            });
          } else {
            console.error('查询地名失败: 返回数据格式不正确', res.data);
          }
        },
        fail: (err) => {
          console.error('查询地名失败:', err);
        }
      });
    } else {
      this.setData({
        locations: []
      });
    }
  },

  onReady: function () {
    // 页面加载完成后立即获取用户位置
    this.getLocation();
  },

  //获取用户当前位置
  getLocation: function () {
    let that = this;
    // 获取用户当前的授权设置
    wx.getSetting({
      success: (res) => {
        // 如果用户还没有做出决定，则请求位置权限
        if (res.authSetting['scope.userLocation'] === undefined) {
          wx.authorize({
            scope: 'scope.userLocation',
            success: () => {
              // 用户同意授权，获取详细位置信息
              that.getDetailedLocation();
            },
            fail: () => {
              // 用户拒绝授权，显示提示弹窗
              that.showLocationSettingModal();
            }
          });
        } else if (res.authSetting['scope.userLocation']) {
          // 用户已经同意授权，直接获取详细位置信息
          that.getDetailedLocation();
        } else {
          // 用户拒绝授权，显示提示弹窗
          that.showLocationSettingModal();
        }
      },
      fail: () => {
        // 处理获取用户设置失败的情况
        console.log('获取用户设置失败');
      }
    });
  },


  showLocationSettingModal: function () {
    // 显示提示弹窗，引导用户打开位置权限设置
    wx.showModal({
      title: '提示',
      content: '需要获取您的地理位置，请手动开启位置权限',
      success: function (res) {
        if (res.confirm) {
          // 用户点击确认，打开设置页面
          wx.openSetting({
            success: (settingRes) => {
              // 如果用户在设置页面同意了位置权限，获取详细位置信息
              if (settingRes.authSetting['scope.userLocation']) {
                that.getDetailedLocation();
              }
            }
          });
        }
      }
    });
  },
  getDetailedLocation: function () {
    // 使用 wx.getLocation 获取用户详细位置信息
    let self = this;
    wx.getLocation({
      type: 'gcj02', // 使用 'gcj02' 以获取中国精确坐标
      success: function (locationRes) {
        // 更新页面数据，使地图中心为用户当前位置
        self.setData({
          latitude: locationRes.latitude,
          longitude: locationRes.longitude,
          userlatitude: locationRes.latitude,
          userlongitude: locationRes.longitude,
          mapsize: 14
        });
        // 输出位置信息
        console.log('用户位置信息:', locationRes);
      },
      fail: function (locationErr) {
        console.log('获取用户位置失败:', locationErr);
        // 处理错误，例如向用户显示错误消息
      }
    });
  }
});
