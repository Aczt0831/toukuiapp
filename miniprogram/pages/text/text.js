const app = getApp()

let myDeviceID

//添加点1： 初始化全局蓝牙状态
if (!app.globalData.bluetoothStatus) {
  app.globalData.bluetoothStatus = {
    connected: false,
    deviceId: null
  };
}

Page({
  data: {
  },
  onLoad() {
  },
  BLE_INIT() {
    wx.openBluetoothAdapter({
      success: () => {
        console.log("蓝牙初始化 OK")
        wx.showToast({
          title: '蓝牙初始化成功!',
          duration: 1000
        })
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
          wx.stopBluetoothDevicesDiscovery({
            success: () => {
              console.log("停止扫描 OK")
              wx.showToast({
                title: '找到设备，自动停止扫描!',
                duration: 1000
              })
            },
            fail: () => {
              console.error("停止扫描失败")
            },
            complete: () => {
              console.log("接口调用结束")
            }
          })
        }
      }
    })
  },
  BLE_StopScan() {
    wx.stopBluetoothDevicesDiscovery({
      success: () => {
        console.log("停止扫描 OK")
        wx.showToast({
          title: '停止扫描!',
          duration: 1000
        })
      },
      fail: () => {
        console.error("停止扫描失败")
      },
      complete: () => {
        console.log("接口调用结束")
      }
    })
  },
  BLE_Connect() {
    if(!myDeviceID) {
      console.error("未找到设备")
      return
    }
    wx.createBLEConnection({
      deviceId:myDeviceID,
      timeout: 5000,
      success: () => {
        console.log("设备连接成功 OK")
        // 添加点2： 更新全局蓝牙连接状态
        if (app.globalData.bluetoothStatus) {
          app.globalData.bluetoothStatus.connected = true;
          app.globalData.bluetoothStatus.deviceId = myDeviceID;
        }
        wx.showToast({
          title: '设备连接成功!',
          duration: 1000
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
        // 添加点2：更新全局蓝牙连接状态
        if (app.globalData.bluetoothStatus) {
          app.globalData.bluetoothStatus.connected = false;
          app.globalData.bluetoothStatus.deviceId = null;
        }
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
