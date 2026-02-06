package com.Toukui.test;

import java.util.Arrays;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

import com.Toukui.mapper.ProductMapper;
import com.Toukui.pojo.Product;

@SpringBootTest
@ExtendWith(org.springframework.test.context.junit.jupiter.SpringExtension.class)
public class ProductDataInit {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Test
    public void initProductData() {
        // 初始化商品数据
        List<Product> products = Arrays.asList(
            new Product(1, "防雾头盔镜片 - 透明", 89.9, "../../static/images/tkimg.png", 100, 25),
            new Product(2, "夏季透气头盔内衬", 59.9, "../../static/images/tkimg.png", 150, 42),
            new Product(3, "头盔安全气囊 - 标准版", 129.9, "../../static/images/tkimg.png", 80, 18),
            new Product(4, "炫酷头盔贴纸套装", 29.9, "../../static/images/tkimg.png", 200, 75),
            new Product(5, "头盔下巴网 - 可拆卸", 19.9, "../../static/images/tkimg.png", 120, 36),
            new Product(6, "头盔清洁护理套装", 49.9, "../../static/images/tkimg.png", 180, 51)
        );
        
        // 插入数据
        for (Product product : products) {
            try {
                productMapper.addProduct(product);
                System.out.println("成功插入商品: " + product.getName());
            } catch (Exception e) {
                System.out.println("插入商品失败: " + product.getName() + ", 错误: " + e.getMessage());
            }
        }
    }
}