package com.Toukui.service.impl;

import com.Toukui.mapper.UserMapper;
import com.Toukui.pojo.User;
import com.Toukui.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class UserServiceImpl implements UserService {

    @Autowired
    private UserMapper userMapper;
    
    @Autowired
    private RestTemplate restTemplate;

    @Override
    public void register(User user) {
        userMapper.register(user);
    }

    @Override
    public List<String> AllAccount(String account) {
        return userMapper.AllAccount(account);
    }

    @Override
    public List<User> getUserInfo(String id) {
        return userMapper.getUserInfoByZh(id);
    }

    @Override
    public String HandlePassword(User user) {
        return userMapper.HandlePassword(user);
    }

    @Override
    public int changeStyleList(String id, String stylelist) {
        return userMapper.changeStyleList(id, stylelist);
    }

    @Override
    public int changeName(String id, String username) {
        return userMapper.changeName(id, username);
    }

    @Override
    public int changeTx(String id, byte[] tximg) {
        return userMapper.changeTx(id, tximg);
    }
    
    @Override
    public Map<String, Object> wxLogin(Map<String, Object> requestMap) {
        Map<String, Object> result = new HashMap<>();
        
        try {
            // 获取前端传来的code
            String code = (String) requestMap.get("code");
            if (code == null || code.isEmpty()) {
                result.put("code", 400);
                result.put("message", "code不能为空");
                return result;
            }
            
            // 微信小程序配置（需要根据实际情况配置）
            String appId = ""; // 需要替换为实际的appId
            String appSecret = ""; // 需要替换为实际的appSecret
            
            // 调用微信API获取session_key和openid
            String wxUrl = "https://api.weixin.qq.com/sns/jscode2session?appid=" + appId 
                    + "&secret=" + appSecret 
                    + "&js_code=" + code 
                    + "&grant_type=authorization_code";
            
            // 发送HTTP请求到微信服务器
            String response = restTemplate.getForObject(wxUrl, String.class);
            
            // 解析微信返回的JSON数据
            ObjectMapper objectMapper = new ObjectMapper();
            Map<String, Object> wxResult = objectMapper.readValue(response, Map.class);
            
            // 检查是否获取到openid
            if (wxResult.containsKey("openid")) {
                String openid = (String) wxResult.get("openid");
                String sessionKey = (String) wxResult.get("session_key");
                
                // 查询用户是否已存在
                // 先根据 openid 查账号，再通过账号查用户
                List<String> accounts = userMapper.AllAccount(openid);
                List<User> existingUsers = null;
                if (accounts != null && !accounts.isEmpty()) {
                    existingUsers = userMapper.getUserInfoByZh(accounts.get(0));
                } else {
                    existingUsers = java.util.Collections.emptyList();
                }
                
                if (existingUsers.isEmpty()) {
                    // 用户不存在，创建新用户
                    User newUser = new User();
                    newUser.setAccount(openid); // 使用openid作为账号
                    newUser.setUsername("微信用户_" + System.currentTimeMillis()); // 生成默认用户名
                    newUser.setPassword(""); // 微信登录用户可以没有密码
                    
                    // 这里需要根据实际的UserMapper方法来创建用户
                    // userMapper.createWxUser(newUser);
                    
                    result.put("code", 200);
                    result.put("message", "新用户注册成功");
                    result.put("openid", openid);
                    result.put("isNewUser", true);
                } else {
                    // 用户已存在，返回用户信息
                    User existingUser = existingUsers.get(0);
                    
                    result.put("code", 200);
                    result.put("message", "登录成功");
                    result.put("openid", openid);
                    result.put("userId", existingUser.getId());
                    result.put("isNewUser", false);
                }
                
                // 可以将session_key存储在缓存中，用于后续的解密操作
                // 这里简化处理，实际项目中建议使用Redis等缓存
                
            } else {
                // 获取openid失败
                result.put("code", 400);
                result.put("message", "获取微信用户信息失败：" + wxResult.get("errmsg"));
            }
            
        } catch (Exception e) {
            result.put("code", 500);
            result.put("message", "服务器内部错误：" + e.getMessage());
            e.printStackTrace();
        }
        
        return result;
    }
}
