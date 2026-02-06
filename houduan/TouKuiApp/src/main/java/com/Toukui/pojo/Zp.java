package com.Toukui.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Zp {
    private Integer id;    // 主键
    private Integer userid; // 用户id
    private String zptitle;
    private String zpcontent;
    private Integer zpdz;
    private Integer pl;
    private byte[] zpimg;
    private String zpsj;   // 时间字段，对应数据库中的zpsj
    private String zpfj;
    private String zphref;
    private String username;
    private byte[] usertx;
}
