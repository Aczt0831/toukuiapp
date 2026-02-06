package com.Toukui.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.Map;

/**
 * 评论数据初始化器
 * 应用启动时自动执行，直接从pl表获取content数据
 */
@Component
public class CommentDataInitializer implements ApplicationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            System.out.println("开始初始化评论数据...");
            
            // 检查并创建pl表
            checkAndCreatePlTable();
            
            // 直接使用JdbcTemplate查询pl表中的content数据
            queryPlContentData();
            
            System.out.println("评论数据初始化完成！");
        } catch (Exception e) {
            System.out.println("评论数据初始化过程中发生异常: " + e.getMessage());
            e.printStackTrace();
            // 不要抛出异常，允许应用继续启动
        }
    }
    
    /**
     * 检查并创建pl表
     */
    private void checkAndCreatePlTable() {
        try {
            // 检查pl表是否存在
            String checkTableSql = "SHOW TABLES LIKE 'pl'";
            List<String> tables = jdbcTemplate.queryForList(checkTableSql, String.class);
            
            if (tables.isEmpty()) {
                // 创建pl表
                String createPlTableSql = "CREATE TABLE IF NOT EXISTS pl (" +
                        "id INT AUTO_INCREMENT PRIMARY KEY, " +
                        "zpid VARCHAR(255) NOT NULL COMMENT '作品ID', " +
                        "userid VARCHAR(255) NOT NULL COMMENT '用户ID', " +
                        "content TEXT NOT NULL COMMENT '评论内容', " +
                        "time VARCHAR(255) NOT NULL COMMENT '评论时间'" +
                        ")";
                jdbcTemplate.execute(createPlTableSql);
                System.out.println("pl表创建成功！");
                
                // 插入一些示例数据
                insertSamplePlData();
            }
        } catch (Exception e) {
            System.out.println("检查或创建pl表时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 插入示例评论数据
     */
    private void insertSamplePlData() {
        try {
            String insertSql = "INSERT INTO pl (zpid, userid, content, time) VALUES (?, ?, ?, ?)";
            
            List<Object[]> sampleData = List.of(
                new Object[]{"1", "user001", "这个作品很有创意！", "2024-01-15 14:30:00"},
                new Object[]{"1", "user002", "学习了，感谢分享", "2024-01-15 16:45:00"},
                new Object[]{"2", "user003", "非常实用的功能", "2024-01-16 09:20:00"},
                new Object[]{"2", "user001", "期待更多更新", "2024-01-16 11:15:00"},
                new Object[]{"3", "user004", "界面设计很美观", "2024-01-17 08:30:00"}
            );
            
            int[] results = jdbcTemplate.batchUpdate(insertSql, sampleData);
            int successCount = 0;
            for (int result : results) {
                if (result > 0) successCount++;
            }
            
            System.out.println("成功插入 " + successCount + " 条示例评论数据！");
        } catch (Exception e) {
            System.out.println("插入示例评论数据时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 直接查询pl表中的content数据
     */
    private void queryPlContentData() {
        try {
            // 查询pl表中的所有评论内容
            String querySql = "SELECT id, zpid, userid, content, time FROM pl ORDER BY time DESC";
            List<Map<String, Object>> plData = jdbcTemplate.queryForList(querySql);
            
            System.out.println("=== 从pl表获取到的评论数据 ===");
            System.out.println("评论总数: " + plData.size());
            
            for (Map<String, Object> row : plData) {
                System.out.println("ID: " + row.get("id"));
                System.out.println("作品ID: " + row.get("zpid"));
                System.out.println("用户ID: " + row.get("userid"));
                System.out.println("评论内容: " + row.get("content"));
                System.out.println("评论时间: " + row.get("time"));
                System.out.println("-------------------");
            }
            
            // 按作品ID分组统计评论数
            String countSql = "SELECT zpid, COUNT(*) as comment_count FROM pl GROUP BY zpid";
            List<Map<String, Object>> countData = jdbcTemplate.queryForList(countSql);
            
            System.out.println("=== 各作品评论统计 ===");
            for (Map<String, Object> row : countData) {
                System.out.println("作品ID: " + row.get("zpid") + ", 评论数: " + row.get("comment_count"));
            }
            
        } catch (Exception e) {
            System.out.println("查询pl表数据时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 获取指定作品的评论内容
     * @param zpid 作品ID
     * @return 评论列表
     */
    public List<Map<String, Object>> getCommentsByZpid(String zpid) {
        try {
            String sql = "SELECT id, zpid, userid, content, time FROM pl WHERE zpid = ? ORDER BY time DESC";
            return jdbcTemplate.queryForList(sql, zpid);
        } catch (Exception e) {
            System.out.println("获取评论数据失败: " + e.getMessage());
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
            System.out.println("添加评论失败: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}