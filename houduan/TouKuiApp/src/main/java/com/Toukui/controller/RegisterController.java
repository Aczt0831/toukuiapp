package com.Toukui.controller;

import com.Toukui.pojo.Result;
import com.Toukui.pojo.User;
import com.Toukui.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import net.coobird.thumbnailator.Thumbnails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;
import java.util.Random;
@RestController
@CrossOrigin
@RequestMapping(produces = "application/json")
public class RegisterController {

    private static final Logger log = LoggerFactory.getLogger(RegisterController.class);
    
    @Autowired
    private UserService userService;

//    登录
    @PostMapping("/login")
    public Result login(@RequestBody User user) {
        log.info("用户账号:{}", user.getAccount());
        log.info("用户密码:{}", user.getPassword());
        List<String> accountList = userService.AllAccount(user.getAccount());
        if (accountList.size() != 0) {
            String handlePassword = userService.HandlePassword(user);
            if (handlePassword != null) {
                return Result.success(handlePassword);
            } else {
                return Result.error("密码错误");
            }
        } else {
            return Result.error("账号错误");
        }
    }



//    添加用户信息
    @PostMapping("/register")
    public Result Register(@RequestBody User user) {
        log.info("员工注册：{}", user);

        List<String> accountList = userService.AllAccount(user.getAccount());
        if (accountList.size() != 0) {
            return Result.error("账号已存在!");
        } else {
            String prefix = "头盔";
            String randomText = prefix + generateRandomString(8);
            user.setUsername(randomText);
            userService.register(user);
            return Result.success();
        }

    }

//    随机生成数字和字母
    private String generateRandomString(int length) {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }

    /*
    获取用户的所有信息
     */
    @GetMapping("/getuserinfo")
    private Result getUserInfoByZh(String id) {
        List<User> userinfo = userService.getUserInfo(id);
        log.info("用户id：{}", id);

        if (userinfo.size() != 0) {
            return Result.success(userinfo);
        } else {
            return Result.error("不存在此用户");
        }
    }

    /*
    更改用户个性签名
     */
    @PostMapping("/stylelist")
    private Result changeStyleList(String id, String stylelist) {
        int res = userService.changeStyleList(id, stylelist);
        if (res > 0) {
            return Result.success();
        } else {
            return Result.error("添加失败");
        }
    }

    /*
    更改用户名
     */
    @PostMapping("/username")
    private Result changeName(String id, String username) {
        int res = userService.changeName(id, username);
        if (res > 0) {
            return Result.success();
        } else {
            return Result.error("添加失败");
        }
    }

    /*
    更改用户头像
     */
    @PostMapping("/usertx")
    private Result changeTx(String id, @RequestParam("file") MultipartFile tximg) {
        try {
            byte[] originalImageData = tximg.getBytes();

            byte[] compressedImageData = compressImage(originalImageData);

            log.info("id:{}",id);
            int res = userService.changeTx(id, compressedImageData);
            if (res > 0) {
                return Result.success();
            } else {
                return Result.error("添加失败");
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

    private byte[] compressImage(byte[] originalImageData) throws IOException {
        // 使用 Thumbnails 库进行图片压缩
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(originalImageData))
                .scale(1) // 不改变图片尺寸
                .outputQuality(0.4) // 设置压缩后的图片质量
                .outputFormat("jpg") // 设置输出格式，可根据需要修改
                .toOutputStream(outputStream);

        return outputStream.toByteArray();
    }

}
