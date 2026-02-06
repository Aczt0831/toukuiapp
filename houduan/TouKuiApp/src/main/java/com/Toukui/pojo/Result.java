package com.Toukui.pojo;

public class Result {
    private Integer code;
    private String msg;
    private Object data;
    
    // 无参构造函数
    public Result() {
    }
    
    // 三参构造函数
    public Result(Integer code, String msg, Object data) {
        this.code = code;
        this.msg = msg;
        this.data = data;
    }
    
    // Getter和Setter方法
    public Integer getCode() {
        return code;
    }
    
    public void setCode(Integer code) {
        this.code = code;
    }
    
    public String getMsg() {
        return msg;
    }
    
    public void setMsg(String msg) {
        this.msg = msg;
    }
    
    public Object getData() {
        return data;
    }
    
    public void setData(Object data) {
        this.data = data;
    }
    
    public static Result success() {
        return new Result(0, "true", null);
    }
    
    public static Result success(Object data) {
        return new Result(0, "true", data);
    }
    
    public static Result error(String msg) {
        return new Result(40000, msg, null);
    }
}
