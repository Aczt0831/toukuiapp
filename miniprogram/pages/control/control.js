import Notify from '../../miniprogram_npm/vant-weapp/notify/notify';
import Dialog from '../../miniprogram_npm/vant-weapp/dialog/dialog';

const app = getApp()

let myDeviceID

Page({
  data: {
    isRotated: false,
    isLight: false,
    isNoise: false,
    isAmbient: false,
    ismute: false,
    isDisturb: false,
    elNum: 70,
    volume: 0,
    isBlueTooth: false,
    show: false,
    actions: [
      {
        name: '断开连接'
      }
    ],
  },
  onChange(event) {
    wx.showToast({
      icon: 'none',
      title: `当前值：${event.detail}`
    });
  },
  goText() {
    wx.navigateTo({
      url: '../text/text',
    })
  },
  Close_BLE() {
    this.setData({ show: true });
  },
  onClose() {
    this.setData({ show: false });
  },
  onSelect(event) {
    const that = this;
    if (event.detail.name === '断开连接') {
      this.setData({ show: false });
      Dialog.confirm({
        title: '确定断开连接'
      }).then(() => {
        that.BLE_DisConnect();
        that.setData({
          isBlueTooth: false
        })
      }).catch(() => {
        //点击取消
      });
      
    }
  },
  BLE_Link() {
    wx.showLoading({
      title: '搜寻设备中...',
      mask: true // 是否显示透明蒙层，防止用户操作
    });
    
    this.BLE_INIT();
  },
  BLE_INIT() {
    wx.openBluetoothAdapter({
      success: () => {
        console.log("蓝牙初始化 OK")
        // wx.showToast({
        //   title: '蓝牙初始化成功!',
        //   duration: 1000
        // })
        this.BLE_Scan();
      },
      fail: () => {
        console.error("蓝牙初始化失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  BLE_Scan() {
    const that = this;
    wx.startBluetoothDevicesDiscovery({
      allowDuplicatesKey: true,
      success: () => {
        console.log("开始扫描 OK")
      },
      fail: () => {
        console.error("扫描失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
    //绑定扫描到设备后的处理函数
    wx.onBluetoothDeviceFound(function(res) {
      let devices = res.devices
      for(let i = 0;i < devices.length;i++)
      {
        console.log(devices[i].name + " " +devices[i].deviceId)
        console.log("--------------------------------------------------")
        if(devices[i].name == "BLE-Device-ZXC") {
          myDeviceID = devices[i].deviceId;
          console.log("找到目标设备 ID:" + myDeviceID)
          /*停止扫描，这里想调用BLE_StopScan，但是我不会调用，就这么写了*/
          that.BLE_StopScan();
          wx.hideLoading();

          Dialog.confirm({
            title: '是否连接该设备',
            message: devices[i].name
          }).then(() => {
            that.BLE_Connect();
          }).catch(() => {
            //点击取消
          });
        }
      }
    })
  },
  BLE_Connect() {
    if(!myDeviceID) {
      console.error("未找到设备")
      return
    }
    const that = this;
    wx.createBLEConnection({
      deviceId:myDeviceID,
      timeout: 5000,
      success: () => {
        console.log("设备连接成功 OK")
        wx.showToast({
          title: '设备连接成功!',
          duration: 1000
        })
        that.setData({
          isBlueTooth: true
        })
        //订阅蓝牙设备的信息
        wx.notifyBLECharacteristicValueChange({
          deviceId: myDeviceID,
          serviceId: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
          characteristicId: "6e400003-b5a3-f393-e0a9-e50e24dcca9e",
          state: true,
          success: () => {
            console.log("订阅设备信息 OK")
            //绑定监听事件
            wx.onBLECharacteristicValueChange((res)=>{
              console.log("来自蓝牙设备的消息:")
              console.log(res.value);
            })
          },
          fail: () => {
            console.error("订阅设备信息是失败")
          },
          complete: () => {
            console.log("接口调用结束")
          }
        })
      },
      fail: () => {
        console.error("设备连接失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  BLE_DisConnect() {
    wx.closeBLEConnection({
      deviceId:myDeviceID,
      success: () => {
        console.log("设备已断开 OK")
        wx.showToast({
          title: '设备已断开',
          duration: 1000
        })
      },
      fail: () => {
        console.error("设备断开失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  BLE_StopScan() {
    wx.stopBluetoothDevicesDiscovery({
      success: () => {
        console.log("停止扫描 OK")
        // wx.showToast({
        //   title: '停止扫描!',
        //   duration: 1000
        // })
      },
      fail: () => {
        console.error("停止扫描失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },

  rotateBox: function() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.isRotated) {
          this.setData({
            isRotated: true
          });
          this.Fan_ON();
        } else {
          this.setData({
            isRotated: false
          });
          this.Fan_OFF();
        }
      }
    })
    
  },
  Light() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.isLight) {
          this.setData({
            isLight: true
          });
          this.LED_ON();
        } else {
          this.setData({
            isLight: false
          });
          this.LED_OFF();
        }
      }
    })
  },
  Noise() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.isNoise) {
          this.setData({
            isNoise: true
          });
          Notify({
            text: '降噪模式开启',
            duration: 1000,
            backgroundColor: '#58BE6A'
          });
        } else {
          this.setData({
            isNoise: false
          });
          Notify({
            text: '降噪模式关闭',
            duration: 1000,
            backgroundColor: '#DA3130'
          });
        }
      }
    })
  },
  Disturb() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.isDisturb) {
          this.setData({
            isDisturb: true
          });
          Notify({
            text: '勿扰模式开启',
            duration: 1000,
            backgroundColor: '#5755C0'
          });
        } else {
          this.setData({
            isDisturb: false
          });
          Notify({
            text: '勿扰模式关闭',
            duration: 1000,
            backgroundColor: '#DA3130'
          });
        }
      }
    })
  },
  mute() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.ismute) {
          this.setData({
            ismute: true
          });
          Notify({
            text: '已静音',
            duration: 1000,
            backgroundColor: '#58BE6A'
          });
        } else {
          this.setData({
            ismute: false
          });
          Notify({
            text: '静音关闭',
            duration: 1000,
            backgroundColor: '#DA3130'
          });
        }
      }
    })
  },
  Ambient() {
    wx.vibrateShort({
      success:(res)=> {
        if (!this.data.isAmbient) {
          this.setData({
            isAmbient: true
          });
          Notify({
            text: '环境声模式开启',
            duration: 1000,
            backgroundColor: '#58BE6A'
          });
        } else {
          this.setData({
            isAmbient: false
          });
          Notify({
            text: '环境声模式关闭',
            duration: 1000,
            backgroundColor: '#DA3130'
          });
        }
      }
    })
  },
  downVolume() {
    wx.vibrateShort({
      success:(res)=> {
        if (this.data.volume > 0) {
          this.setData({
            volume: this.data.volume - 10
          });
        } else {
          wx.showToast({
            title: '已静音',
            image: "../../static/images/!.png",
            duration: 2000
          });
        }
      }
    })
  },
  upVolume() {
    wx.vibrateShort({
      success:(res)=> {
        if (this.data.volume < 100) {
          this.setData({
            volume: this.data.volume + 10
          });
        } else {
          wx.showToast({
            title: '音量已达最大',
            image: "../../static/images/!.png",
            duration: 2000
          });
        }
      }
    })
  },
  Fan_ON() {
    if(!myDeviceID)
    {
      console.error("设备未连接")
      return
    }
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0,48+1)
    wx.writeBLECharacteristicValue({
      deviceId: myDeviceID,
      serviceId: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
      characteristicId: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
      value: buffer,
      success: () => {
        console.log("打开风扇 OK")
      },
      fail: () => {
        console.error("打开风扇失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  Fan_OFF() {
    if(!myDeviceID)
    {
      console.error("设备未连接")
      return
    }
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0,48+0)
    wx.writeBLECharacteristicValue({
      deviceId: myDeviceID,
      serviceId: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
      characteristicId: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
      value: buffer,
      success: () => {
        console.log("关闭风扇 OK")
      },
      fail: () => {
        console.error("关闭风扇失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  LED_ON() {
    if(!myDeviceID)
    {
      console.error("设备未连接")
      return
    }
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0,48+2)
    wx.writeBLECharacteristicValue({
      deviceId: myDeviceID,
      serviceId: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
      characteristicId: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
      value: buffer,
      success: () => {
        console.log("打开灯光 OK")
      },
      fail: () => {
        console.error("打开灯光失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  LED_OFF() {
    if(!myDeviceID)
    {
      console.error("设备未连接")
      return
    }
    let buffer = new ArrayBuffer(1)
    let dataView = new DataView(buffer)
    dataView.setUint8(0,48+3)
    wx.writeBLECharacteristicValue({
      deviceId: myDeviceID,
      serviceId: "6e400001-b5a3-f393-e0a9-e50e24dcca9e",
      characteristicId: "6e400002-b5a3-f393-e0a9-e50e24dcca9e",
      value: buffer,
      success: () => {
        console.log("关闭灯光 OK")
      },
      fail: () => {
        console.error("关闭灯光失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  }

})