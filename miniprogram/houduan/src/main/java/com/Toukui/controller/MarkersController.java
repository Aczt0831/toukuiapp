package com.Toukui.controller;

import com.Toukui.pojo.Markers;
import com.Toukui.pojo.Result;
import com.Toukui.service.MarkersService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@CrossOrigin
public class MarkersController {
    @Autowired
    private MarkersService markersService;

    /**
     * 添加用户标记
     */
    @PostMapping("/addmarker")
    public Result addMarker(@RequestBody Markers markers) {
        int res = markersService.addMarker(markers);
        if (res > 0) {
            return Result.success();
        } else {
            return Result.error("添加失败");
        }
    }

    /**
     * 获取用户标记
     */
    @GetMapping("/getmarkers")
    public Result getMarkersById(Integer id) {
        List<Markers> markersList = markersService.getMarkersById(id);
        if (markersList.size() > 0) {
            return Result.success(markersList);
        } else {
            return Result.error("暂无作品");
        }
    }


    /**
     * 删除用户标记
     */
    @PostMapping("/deletemarker")
    public Result deleteMarker(Integer  userid, Integer id) {
        int res = markersService.deleteMarker(userid, id);
        System.out.println(userid + "+" + id);
        if (res > 0) {
            return Result.success();
        } else {
            return Result.error("删除失败");
        }
    }

    /**
     * 增加用户足迹
     */
    @PostMapping("/addfootprint")
    public Result addFootPrint(Integer id) {
        int res = markersService.addFootPrint(id);
        if (res > 0) {
            return Result.success();
        } else {
            return Result.error("修改失败");
        }
    }




}
