package com.Toukui.mapper;

import com.Toukui.pojo.Product;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

/**
 * 商品Mapper接口
 */
@Mapper
public interface ProductMapper {
    
    /**
     * 获取所有商品列表
     * @return 商品列表
     */
    List<Product> getAllProducts();
    
    /**
     * 根据ID获取商品详情
     * @param id 商品ID
     * @return 商品对象
     */
    Product getProductById(Integer id);
    
    /**
     * 添加商品
     * @param product 商品对象
     * @return 影响行数
     */
    int addProduct(Product product);
    
    /**
     * 更新商品
     * @param product 商品对象
     * @return 影响行数
     */
    int updateProduct(Product product);
    
    /**
     * 删除商品
     * @param id 商品ID
     * @return 影响行数
     */
    int deleteProduct(Integer id);
}