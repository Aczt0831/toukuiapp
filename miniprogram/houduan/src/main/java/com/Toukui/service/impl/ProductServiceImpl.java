package com.Toukui.service.impl;

import com.Toukui.mapper.ProductMapper;
import com.Toukui.pojo.Product;
import com.Toukui.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 商品Service实现类
 */
@Service
public class ProductServiceImpl implements ProductService {
    
    @Autowired
    private ProductMapper productMapper;
    
    @Override
    public List<Product> getAllProducts() {
        return productMapper.getAllProducts();
    }
    
    @Override
    public Product getProductById(Integer id) {
        return productMapper.getProductById(id);
    }
    
    @Override
    public boolean addProduct(Product product) {
        return productMapper.addProduct(product) > 0;
    }
    
    @Override
    public boolean updateProduct(Product product) {
        return productMapper.updateProduct(product) > 0;
    }
    
    @Override
    public boolean deleteProduct(Integer id) {
        return productMapper.deleteProduct(id) > 0;
    }
    
    @Override
    public int batchAddProducts(List<Product> products) {
        int count = 0;
        for (Product product : products) {
            if (productMapper.addProduct(product) > 0) {
                count++;
            }
        }
        return count;
    }
}