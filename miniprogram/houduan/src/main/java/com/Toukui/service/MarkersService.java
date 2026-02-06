package com.Toukui.service;

import com.Toukui.pojo.Markers;

import java.util.List;

public interface MarkersService {
    /**
     * 增加标记
     */
    int addMarker(Markers markers);

    /**
     * 获取用户标记
     */
    List<Markers> getMarkersById(Integer id);

    /**
     * 删除用户标记
     */
    int deleteMarker(Integer  userid, Integer id);

    /**
     * 增加用户足迹
     */
    int addFootPrint(Integer id);


}
