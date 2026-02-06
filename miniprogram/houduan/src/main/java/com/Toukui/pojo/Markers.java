package com.Toukui.pojo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Markers {
    private Integer userid;
    private Integer id;
    private double latitude;
    private double longitude;
    private String iconPath;
    private Integer width;
    private Integer height;
    private String localname;
    private int isGone;
}
