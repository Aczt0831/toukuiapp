package com.Toukui.service;

import com.Toukui.pojo.Product;
import java.util.List;

/**
 * 商品Service接口
 */
public interface ProductService {
    
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
     * @return 是否成功
     */
    boolean addProduct(Product product);
    
    /**
     * 更新商品
     * @param product 商品对象
     * @return 是否成功
     */
    boolean updateProduct(Product product);
    
    /**
     * 删除商品
     * @param id 商品ID
     * @return 是否成功
     */
    boolean deleteProduct(Integer id);
    
    /**
     * 批量添加商品
     * @param products 商品列表
     * @return 成功添加的数量
     */
    int batchAddProducts(List<Product> products);
}