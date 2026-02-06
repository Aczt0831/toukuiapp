package com.Toukui.service.impl;

import com.Toukui.mapper.MarkersMapper;
import com.Toukui.pojo.Markers;
import com.Toukui.service.MarkersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MarkersServiceImpl implements MarkersService {

    @Autowired
    private MarkersMapper markersMapper;
    /**
     * 增加标记
     */
    @Override
    public int addMarker(Markers markers) {
        return markersMapper.addMarker(markers);
    }

    /**
     * 获取用户标记
     */
    @Override
    public List<Markers> getMarkersById(Integer id) {
        return markersMapper.getMarkersById(id);
    }

    @Override
    public int deleteMarker(Integer userid, Integer id) {
        return markersMapper.deleteMarker(userid, id);
    }

    @Override
    public int addFootPrint(Integer id) {
        return markersMapper.addFootPrint(id);
    }

}
