package com.Toukui.controller;

import com.Toukui.pojo.Pl;
import com.Toukui.pojo.Result;
import com.Toukui.pojo.Zp;
import com.Toukui.service.ZpService;
import com.Toukui.service.CommentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import net.coobird.thumbnailator.Thumbnails;
import org.apache.ibatis.annotations.Param;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(produces = "application/json")
@CrossOrigin
public class ZpController {
    private static final Logger log = LoggerFactory.getLogger(ZpController.class);
    @Autowired
    private ZpService zpService;
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    @Autowired
    private CommentService commentService;

    /**
     * 发布作品
     */
    @PostMapping("/setzp")
    @CrossOrigin
    public Result setNewZp(@RequestParam("id") String id, @RequestParam("title") String title, @RequestParam("content") String content, @RequestParam("file") MultipartFile file) {
        try {
            log.info("开始处理作品发布请求，用户ID: {}", id);
            
            // 将文件转换为byte[]数组
            byte[] zpimg = file.getBytes();
            log.info("图片文件已读取，大小: {}字节", zpimg.length);
            
            // 获取当前时间
            String zptime = getCurrentTime();
            
            // 添加作品到数据库
            log.info("准备将作品信息保存到数据库");
            int res = zpService.setNewZp(id, title, content, zpimg, zptime);
            
            if (res > 0) {
                log.info("作品发布成功，用户ID: {}", id);
                return Result.success();
            } else {
                log.warn("作品发布失败：数据库操作失败，用户ID: {}", id);
                return Result.error("发布失败：数据库操作失败");
            }
        } catch (Exception e) {
            // 记录错误信息
            log.error("作品发布异常，用户ID: {}", id, e);
            return Result.error("发布失败：" + e.getMessage());
        }
    }

    /**
     * 获取全部作品
     * @return
     */
    @GetMapping("/getallzp")
    @CrossOrigin
    public Result getAllZp() {
        List<Zp> zpList = zpService.getAllZp();
        if (zpList.size() > 0) {
            return Result.success(zpList);
        } else {
            return Result.error("暂无作品");
        }
    }

    /**
     *更新5条数据
     */
    @GetMapping("/getMore")
    @CrossOrigin
    public Result getMoreZp(@RequestParam int start, @RequestParam int limit) {
        List<Zp> zpList = zpService.getMoreZp(start, limit);
        if (zpList.size() > 0) {
            return Result.success(zpList);
        } else {
            return Result.error("暂无更多作品");
        }
    }

    /**
     * 通过作品id获取单个作品信息
     * 使用JdbcTemplate直接查询数据库，返回标准格式响应
     */
    @GetMapping("/getzpinfo")
    @CrossOrigin
    public Map<String, Object> getZpByZpid(String zpid) {
        Map<String, Object> response = new HashMap<>();
        try {
            log.info("查询作品详情，作品ID: {}", zpid);
            
            // 使用JdbcTemplate直接查询作品信息，包含用户信息和评论数
            // 添加pl字段查询评论数量，如果为null则设为0
            String sql = "select z.id, z.userid, z.zptitle, z.zpcontent, z.zpimg, z.zpdz, COALESCE(z.pl, 0) as pl, u.username, u.usertx from zptable z inner join userinfo u on z.userid = u.id where z.id=?";
            List<Map<String, Object>> results = jdbcTemplate.queryForList(sql, zpid);
            
            if (results != null && !results.isEmpty()) {
                Map<String, Object> zpItem = results.get(0);
                
                // 处理图片数据，将byte[]转换为Base64字符串（如果需要）
                // 注意：前端可能期望直接使用byte[]，这里保持原样返回
                
                response.put("code", 0);
                response.put("msg", "true");
                response.put("data", zpItem);
                log.info("查询作品详情成功，作品ID: {}, 评论数: {}", zpid, zpItem.get("pl"));
            } else {
                response.put("code", 1);
                response.put("msg", "暂无作品");
                response.put("data", null);
                log.warn("未找到作品，作品ID: {}", zpid);
            }
        } catch (Exception e) {
            log.error("查询作品详情异常，作品ID: {}", zpid, e);
            response.put("code", 1);
            response.put("msg", "查询失败：" + e.getMessage());
            response.put("data", null);
        }
        return response;
    }

    /**
     * 作品点赞
     */
    @PostMapping("/dz")
    @CrossOrigin
    private Result HandleDz(String id, String zpid) {
        int res = zpService.HandleDz(zpid);
        int res2 = zpService.HandleAddDz(id, zpid);
        if (res > 0 && res2 > 0) {
            return Result.success();
        } else {
            return Result.error("评论失败");
        }
    }

    /**
     * 获取用户点赞的作品id
     */
    @GetMapping("/getdz")
    @CrossOrigin
    private Result GetDz(String id) {
        List<String> res = zpService.getDz(id);
        if (res.size() > 0) {
            return Result.success(res);
        } else {
            return Result.error("获取失败");
        }
    }

    /**
     * 用户取消点赞
     */
    @PostMapping("/cancledz")
    @CrossOrigin
    private Result CancleDz(String id, String zpid) {
        int res = zpService.CancleDz(zpid);
        int res2 = zpService.DeleteDzInfo(id, zpid);
        if (res > 0 && res2 > 0) {
            return Result.success();
        } else {
            return Result.error("点赞失败");
        }
    }

    /**
     * 添加作品评论
     * 直接插入pl表
     */
    @PostMapping("/pl")
    @CrossOrigin
    private Result HandlePl(String zpid, String userid, String content) {
        try {
            String zptime = getCurrentTime();
            
            // 使用CommentService直接添加评论到pl表
            boolean commentAdded = commentService.addComment(zpid, userid, content, zptime);
            
            if (commentAdded) {
                // 更新作品的评论数量
                int res2 = zpService.AddPlNum(zpid);
                if (res2 > 0) {
                    return Result.success();
                } else {
                    log.warn("评论添加成功，但更新评论数量失败，作品ID: {}", zpid);
                    return Result.success(); // 评论已添加，仍然返回成功
                }
            } else {
                return Result.error("评论添加失败");
            }
        } catch (Exception e) {
            log.error("添加评论失败，作品ID: {}, 用户ID: {}", zpid, userid, e);
            return Result.error("评论添加失败：" + e.getMessage());
        }
    }

    /**
     * 获取作品评论
     * 直接从pl表获取评论数据
     */
    @GetMapping (value = "/getpl", produces = "application/json")
    @CrossOrigin
    public Result getPlByZpid(@RequestParam String zpid) {
        try {
            // 使用CommentService直接从pl表获取评论数据
            List<Map<String, Object>> comments = commentService.getCommentsByZpid(zpid);
            if (comments.size() > 0) {
                return Result.success(comments);
            } else {
                return Result.success(comments); // 返回空列表而不是错误
            }
        } catch (Exception e) {
            log.error("获取评论失败，作品ID: {}", zpid, e);
            return Result.error("获取评论失败：" + e.getMessage());
        }
    }



    /**
     * 压缩图片
     * @param originalImageData
     * @return
     * @throws IOException
     */
    private byte[] compressImage(byte[] originalImageData) throws IOException {
    
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        Thumbnails.of(new ByteArrayInputStream(originalImageData))
                .scale(1) // 不改变图片尺寸
                .outputQuality(0.4) // 设置压缩后的图片质量
                .outputFormat("jpg") // 设置输出格式，可根据需要修改
                .toOutputStream(outputStream);

        return outputStream.toByteArray();
    }

    /**
     * 测试接口：直接查看pl表中的content数据
     */
    @GetMapping("/test/plcontents")
    @CrossOrigin
    public Result testGetPlContents() {
        try {
            // 直接使用JdbcTemplate查询pl表中的content数据
            String sql = "SELECT id, zpid, userid, content, time FROM pl ORDER BY time DESC";
            List<Map<String, Object>> plData = jdbcTemplate.queryForList(sql);
            
            // 获取所有评论内容
            List<String> contents = commentService.getAllCommentContents();
            
            Map<String, Object> result = new HashMap<>();
            result.put("totalComments", plData.size());
            result.put("allContents", contents);
            result.put("detailData", plData);
            
            return Result.success(result);
        } catch (Exception e) {
            log.error("测试获取pl表content数据失败", e);
            return Result.error("测试失败：" + e.getMessage());
        }
    }

    /**
     * 获取当前时间 - 返回数据库兼容的格式
     * @return
     */
    public String getCurrentTime() {
        LocalDateTime now = LocalDateTime.now();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");
        return now.format(formatter);
    }
}
