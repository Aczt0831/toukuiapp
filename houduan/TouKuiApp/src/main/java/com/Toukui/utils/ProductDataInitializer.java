package com.Toukui.utils;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import java.util.Arrays;
import java.util.List;

/**
 * 商品数据初始化器
 * 应用启动时自动执行，确保数据库中有商品数据
 */
@Component
public class ProductDataInitializer implements ApplicationRunner {

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Override
    public void run(ApplicationArguments args) throws Exception {
        try {
            // 先检查表是否存在，如果不存在则创建
            checkAndCreateProductTable();
            
            // 使用JdbcTemplate直接检查是否有商品数据
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM product", Integer.class);
            if (count == null || count == 0) {
                System.out.println("开始初始化商品数据...");
                
                // 直接使用JdbcTemplate批量插入数据
                String insertSql = "INSERT INTO product (id, name, price, image, total_count, sold_count) VALUES (?, ?, ?, ?, ?, ?)";
                
                // 准备商品数据
                List<Object[]> productData = Arrays.asList(
                    new Object[]{1, "防雾头盔镜片 - 透明", 89.9, "../../static/images/tkimg.png", 100, 25},
                    new Object[]{2, "夏季透气头盔内衬", 59.9, "../../static/images/tkimg.png", 150, 42},
                    new Object[]{3, "头盔安全气囊 - 标准版", 129.9, "../../static/images/tkimg.png", 80, 18},
                    new Object[]{4, "炫酷头盔贴纸套装", 29.9, "../../static/images/tkimg.png", 200, 75},
                    new Object[]{5, "头盔下巴网 - 可拆卸", 19.9, "../../static/images/tkimg.png", 120, 36},
                    new Object[]{6, "头盔清洁护理套装", 49.9, "../../static/images/tkimg.png", 180, 51}
                );
                
                // 批量插入
                int[] results = jdbcTemplate.batchUpdate(insertSql, productData);
                int successCount = 0;
                for (int result : results) {
                    if (result > 0) successCount++;
                }
                
                System.out.println("成功插入 " + successCount + " 条商品数据！");
                System.out.println("商品数据初始化完成！");
            } else {
                System.out.println("数据库中已存在商品数据，共 " + count + " 条，无需初始化。");
            }
        } catch (Exception e) {
            System.out.println("商品数据初始化过程中发生异常: " + e.getMessage());
            e.printStackTrace();
            // 不要抛出异常，允许应用继续启动
        }
    }
    
    /**
     * 检查并创建商品表
     */
    private void checkAndCreateProductTable() {
        try {
            // 检查表是否存在
            String checkTableSql = "SHOW TABLES LIKE 'product'";
            List<String> tables = jdbcTemplate.queryForList(checkTableSql, String.class);
            
            if (tables.isEmpty()) {
                // 创建表
                String createTableSql = "CREATE TABLE IF NOT EXISTS product (" +
                        "id INT PRIMARY KEY, " +
                        "name VARCHAR(255) NOT NULL, " +
                        "price DOUBLE NOT NULL, " +
                        "image VARCHAR(255), " +
                        "total_count INT DEFAULT 0 COMMENT '总数量', " +
                        "sold_count INT DEFAULT 0 COMMENT '卖出数量'" +
                        ")";
                jdbcTemplate.execute(createTableSql);
                System.out.println("商品表创建成功！");
            }
        } catch (Exception e) {
            System.out.println("检查或创建商品表时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    /**
     * 初始化pl表数据并获取content数据
     */
    public void initializePlData() {
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
            }
            
            // 使用JdbcTemplate直接查询pl表中的content数据
            String queryContentSql = "SELECT id, zpid, userid, content, time FROM pl ORDER BY time DESC";
            List<String> plContents = jdbcTemplate.queryForList(queryContentSql, String.class);
            
            System.out.println("从pl表获取到的评论内容数据:");
            for (String content : plContents) {
                System.out.println("评论内容: " + content);
            }
            
            // 获取评论总数
            Integer count = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM pl", Integer.class);
            System.out.println("pl表中评论总数: " + count);
            
        } catch (Exception e) {
            System.out.println("初始化pl表数据时发生异常: " + e.getMessage());
            e.printStackTrace();
        }
    }
}