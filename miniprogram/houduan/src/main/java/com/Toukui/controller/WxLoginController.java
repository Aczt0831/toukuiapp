package com.Toukui.controller;

import com.Toukui.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * 微信登录接口
 */
@RestController
public class WxLoginController {

    @Autowired
    private UserService userService;

    /**
     * 接口路径：/getOpenId（与小程序前端对应）
     */
    @PostMapping("/getOpenId")
    public Map<String, Object> wxLogin(@RequestBody Map<String, Object> requestMap) {
        return userService.wxLogin(requestMap);
    }
}