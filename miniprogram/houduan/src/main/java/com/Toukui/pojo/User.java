package com.Toukui.pojo;

public class User {
    private Integer id;
    private String username;
    private String account;
    private String password;
    private String styleList;
    private byte[] usertx;
    private Integer dz;
    
    // getter and setter methods
    public Integer getId() {
        return id;
    }
    
    public void setId(Integer id) {
        this.id = id;
    }
    
    public String getUsername() {
        return username;
    }
    
    public void setUsername(String username) {
        this.username = username;
    }
    
    public String getAccount() {
        return account;
    }
    
    public void setAccount(String account) {
        this.account = account;
    }
    
    public String getPassword() {
        return password;
    }
    
    public void setPassword(String password) {
        this.password = password;
    }
    
    public String getStyleList() {
        return styleList;
    }
    
    public void setStyleList(String styleList) {
        this.styleList = styleList;
    }
    
    public byte[] getUsertx() {
        return usertx;
    }
    
    public void setUsertx(byte[] usertx) {
        this.usertx = usertx;
    }
    
    public Integer getDz() {
        return dz;
    }
    
    public void setDz(Integer dz) {
        this.dz = dz;
    }
}
