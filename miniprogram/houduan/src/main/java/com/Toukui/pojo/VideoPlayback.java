package com.Toukui.pojo;

import lombok.Data;
import java.util.Date;

/**
 * 视频回放实体类
 */
@Data
public class VideoPlayback {
    private Integer id;
    private String name;
    private String url;
    private String thumbnail;
    private String date; // 使用String类型存储日期，格式：yyyy-MM-dd
    private String time; // 时间段，格式：HH:MM - HH:MM
    private String duration; // 时长，格式：HH:MM:SS
    private Integer isNew; // 0-否 1-是
    private Date createTime;
    private Date updateTime;
}