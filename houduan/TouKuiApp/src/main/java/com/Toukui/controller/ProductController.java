package com.Toukui.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 商品控制器
 */
@RestController
@CrossOrigin
@RequestMapping("/products")
public class ProductController {
    
    @Autowired
    private JdbcTemplate jdbcTemplate;
    
    /**
     * 获取所有商品列表
     * @return 商品列表
     */
    @GetMapping
    public Map<String, Object> getAllProducts() {
        Map<String, Object> response = new HashMap<>();
        try {
            // 查询商品数据
            String sql = "SELECT id, name, price, image, total_count, sold_count FROM product";
            List<Map<String, Object>> products = jdbcTemplate.queryForList(sql);
            
            // 转换字段名为驼峰命名法，确保前端能正确显示库存和已售数量
            List<Map<String, Object>> formattedProducts = products.stream().map(product -> {
                Map<String, Object> formatted = new HashMap<>();
                formatted.put("id", product.get("id"));
                formatted.put("name", product.get("name"));
                formatted.put("price", product.get("price"));
                formatted.put("image", product.get("image"));
                formatted.put("totalCount", product.get("total_count")); // 转换为驼峰命名
                formatted.put("soldCount", product.get("sold_count")); // 转换为驼峰命名
                return formatted;
            }).collect(java.util.stream.Collectors.toList());
            
            response.put("code", 0);
            response.put("msg", "true");
            response.put("data", formattedProducts);
            
            System.out.println("商品列表查询成功，共 " + formattedProducts.size() + " 条数据");
        } catch (Exception e) {
            e.printStackTrace();
            response.put("code", 500);
            response.put("msg", "获取商品列表失败: " + e.getMessage());
            System.err.println("商品列表查询失败: " + e.getMessage());
        }
        return response;
    }
}