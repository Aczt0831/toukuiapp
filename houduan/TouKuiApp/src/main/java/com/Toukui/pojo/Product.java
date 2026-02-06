package com.Toukui.pojo;

import lombok.Data;

/**
 * 商品实体类
 */
@Data
public class Product {
    private Integer id;
    private String name;
    private Double price;
    private String image;
    private Integer totalCount; // 总数量
    private Integer soldCount; // 卖出数量
    
    // 无参构造函数
    public Product() {
    }
    
    // 有参构造函数
    public Product(Integer id, String name, Double price, String image, Integer totalCount, Integer soldCount) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.totalCount = totalCount;
        this.soldCount = soldCount;
    }
    
    // getter和setter方法
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getName() {
        return name;
    }
    
    public void setName(String name) {
        this.name = name;
    }
    
    public Double getPrice() {
        return price;
    }
    
    public void setPrice(Double price) {
        this.price = price;
    }
    
    public String getImage() {
        return image;
    }
    
    public void setImage(String image) {
        this.image = image;
    }
    
    public Integer getTotalCount() {
        return totalCount;
    }
    
    public void setTotalCount(Integer totalCount) {
        this.totalCount = totalCount;
    }
    
    public Integer getSoldCount() {
        return soldCount;
    }
    
    public void setSoldCount(Integer soldCount) {
        this.soldCount = soldCount;
    }
    
    @Override
    public String toString() {
        return "Product{" +
                "id=" + id +
                ", name='" + name + '\'' +
                ", price=" + price +
                ", image='" + image + '\'' +
                ", totalCount=" + totalCount +
                ", soldCount=" + soldCount +
                '}';
    }
}