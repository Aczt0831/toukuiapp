package com.Toukui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 视频回放控制器
 */
@RestController
@CrossOrigin
@RequestMapping("/video-playback")
public class VideoPlaybackController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 获取所有视频列表
     * @return 视频列表
     */
    @GetMapping
    public Map<String, Object> getAllVideos() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 直接使用JdbcTemplate查询视频列表
            String sql = "SELECT id, name, url, thumbnail, date, time, duration, is_new as isNew FROM video_playback";
            List<Map<String, Object>> videos = jdbcTemplate.queryForList(sql);
            
            // 构造成功响应
            response.put("code", 0);
            response.put("msg", true);
            response.put("data", videos);
            
            System.out.println("视频列表查询成功，共 " + videos.size() + " 条数据");
        } catch (Exception e) {
            // 构造错误响应
            response.put("code", -1);
            response.put("msg", "获取视频列表失败: " + e.getMessage());
            response.put("data", null);
            
            System.err.println("视频列表查询失败: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }
    
    /**
     * 根据ID获取视频详情
     * @param id 视频ID
     * @return 视频对象
     */
    @GetMapping("/{id}")
    public Map<String, Object> getVideoById(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            String sql = "SELECT id, name, url, thumbnail, date, time, duration, is_new as isNew FROM video_playback WHERE id = ?";
            Map<String, Object> video = jdbcTemplate.queryForMap(sql, id);
            
            response.put("code", 0);
            response.put("msg", true);
            response.put("data", video);
        } catch (Exception e) {
            response.put("code", -1);
            response.put("msg", "视频不存在: " + e.getMessage());
            response.put("data", null);
        }
        return response;
    }
    
    /**
     * 标记视频为已查看
     * @param id 视频ID
     * @return 操作结果
     */
    @PutMapping("/{id}/viewed")
    public Map<String, Object> markVideoAsViewed(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            // 直接更新数据库
            String sql = "UPDATE video_playback SET is_new = 0 WHERE id = ?";
            int rows = jdbcTemplate.update(sql, id);
            
            if (rows > 0) {
                response.put("code", 0);
                response.put("msg", "标记成功");
                System.out.println("视频ID " + id + " 已标记为已查看");
            } else {
                response.put("code", -1);
                response.put("msg", "视频不存在或已被标记");
            }
        } catch (Exception e) {
            response.put("code", -1);
            response.put("msg", "标记失败: " + e.getMessage());
            System.err.println("标记视频失败: " + e.getMessage());
            e.printStackTrace();
        }
        return response;
    }
    
    /**
     * 添加视频
     * @param videoData 视频数据
     * @return 操作结果
     */
    @PostMapping
    public Map<String, Object> addVideo(@RequestBody Map<String, Object> videoData) {
        Map<String, Object> response = new HashMap<>();
        try {
            String sql = "INSERT INTO video_playback (name, url, thumbnail, date, time, duration, is_new) VALUES (?, ?, ?, ?, ?, ?, ?)";
            int rows = jdbcTemplate.update(
                sql,
                videoData.get("name"),
                videoData.get("url"),
                videoData.get("thumbnail"),
                videoData.get("date"),
                videoData.get("time"),
                videoData.get("duration"),
                videoData.getOrDefault("isNew", 0)
            );
            
            if (rows > 0) {
                response.put("code", 0);
                response.put("msg", "添加成功");
            } else {
                response.put("code", -1);
                response.put("msg", "添加失败");
            }
        } catch (Exception e) {
            response.put("code", -1);
            response.put("msg", "添加失败: " + e.getMessage());
        }
        return response;
    }
    
    /**
     * 删除视频
     * @param id 视频ID
     * @return 操作结果
     */
    @DeleteMapping("/{id}")
    public Map<String, Object> deleteVideo(@PathVariable Integer id) {
        Map<String, Object> response = new HashMap<>();
        try {
            String sql = "DELETE FROM video_playback WHERE id = ?";
            int rows = jdbcTemplate.update(sql, id);
            
            if (rows > 0) {
                response.put("code", 0);
                response.put("msg", "删除成功");
            } else {
                response.put("code", -1);
                response.put("msg", "删除失败");
            }
        } catch (Exception e) {
            response.put("code", -1);
            response.put("msg", "删除失败: " + e.getMessage());
        }
        return response;
    }
}