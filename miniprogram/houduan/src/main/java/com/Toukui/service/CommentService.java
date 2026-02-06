package com.Toukui.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;

/**
 * 评论服务类
 * 直接使用JdbcTemplate操作pl表
 */
@Service
public class CommentService {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    /**
     * 获取指定作品的评论列表
     * @param zpid 作品ID
     * @return 评论列表
     */
    public List<Map<String, Object>> getCommentsByZpid(String zpid) {
        try {
            // 使用JOIN查询获取评论和用户信息
            String sql = "SELECT p.id, p.zpid, p.userid, p.content, p.time, " +
                        "u.username, u.usertx " +
                        "FROM pl p " +
                        "LEFT JOIN userinfo u ON p.userid = u.id " +
                        "WHERE p.zpid = ? " +
                        "ORDER BY p.time DESC";
            
            List<Map<String, Object>> comments = jdbcTemplate.queryForList(sql, zpid);
            
            // 处理用户头像数据
            for (Map<String, Object> comment : comments) {
                Object usertx = comment.get("usertx");
                if (usertx instanceof byte[]) {
                    // 将byte[]转换为Base64字符串
                    byte[] avatarBytes = (byte[]) usertx;
                    String base64Avatar = java.util.Base64.getEncoder().encodeToString(avatarBytes);
                    comment.put("usertx", base64Avatar);
                }
            }
            
            return comments;
        } catch (Exception e) {
            System.err.println("获取评论列表失败: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * 添加评论
     * @param zpid 作品ID
     * @param userid 用户ID
     * @param content 评论内容
     * @param time 评论时间
     * @return 是否成功
     */
    public boolean addComment(String zpid, String userid, String content, String time) {
        try {
            String sql = "INSERT INTO pl (zpid, userid, content, time) VALUES (?, ?, ?, ?)";
            int result = jdbcTemplate.update(sql, zpid, userid, content, time);
            return result > 0;
        } catch (Exception e) {
            System.err.println("添加评论失败: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 获取评论总数
     * @param zpid 作品ID
     * @return 评论数量
     */
    public int getCommentCount(String zpid) {
        try {
            String sql = "SELECT COUNT(*) FROM pl WHERE zpid = ?";
            Integer count = jdbcTemplate.queryForObject(sql, Integer.class, zpid);
            return count != null ? count : 0;
        } catch (Exception e) {
            System.err.println("获取评论数量失败: " + e.getMessage());
            e.printStackTrace();
            return 0;
        }
    }

    /**
     * 获取所有评论内容（用于调试）
     * @return 所有评论内容
     */
    public List<String> getAllCommentContents() {
        try {
            String sql = "SELECT content FROM pl ORDER BY time DESC";
            return jdbcTemplate.queryForList(sql, String.class);
        } catch (Exception e) {
            System.err.println("获取所有评论内容失败: " + e.getMessage());
            e.printStackTrace();
            return List.of();
        }
    }

    /**
     * 检查pl表是否存在
     * @return 表是否存在
     */
    public boolean checkPlTableExists() {
        try {
            String sql = "SHOW TABLES LIKE 'pl'";
            List<String> tables = jdbcTemplate.queryForList(sql, String.class);
            return !tables.isEmpty();
        } catch (Exception e) {
            System.err.println("检查pl表是否存在失败: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * 创建pl表
     * @return 是否成功
     */
    public boolean createPlTable() {
        try {
            String createTableSql = "CREATE TABLE IF NOT EXISTS pl (" +
                    "id INT AUTO_INCREMENT PRIMARY KEY, " +
                    "zpid VARCHAR(255) NOT NULL COMMENT '作品ID', " +
                    "userid VARCHAR(255) NOT NULL COMMENT '用户ID', " +
                    "content TEXT NOT NULL COMMENT '评论内容', " +
                    "time VARCHAR(255) NOT NULL COMMENT '评论时间', " +
                    "INDEX idx_zpid (zpid), " +
                    "INDEX idx_userid (userid), " +
                    "INDEX idx_time (time)" +
                    ") ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='评论表'";
            
            jdbcTemplate.execute(createTableSql);
            System.out.println("pl表创建成功！");
            return true;
        } catch (Exception e) {
            System.err.println("创建pl表失败: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}