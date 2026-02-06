package com.Toukui.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pl {
    private String zpid;
    private String userid;
    private String content;
    private String time;
    private String username;
    private byte[] usertx;
}
