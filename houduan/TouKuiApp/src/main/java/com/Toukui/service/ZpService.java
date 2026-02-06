package com.Toukui.service;

import com.Toukui.pojo.Pl;
import com.Toukui.pojo.Zp;

import java.util.List;

public interface ZpService {

    /*
    添加用户作品
     */
    int setNewZp(String id, String title, String content, byte[] zpimg, String zptime);

    /**
     * 获取所有作品信息
     */
    List<Zp> getAllZp();

    /**
     * zpid获取作品信息
     */
    List<Zp> getZpByZpid(String zpid);

    /**
     * 点赞量自增
     */
    int HandleDz(String zpid);

    /**
     * dz表新增
     */
    int HandleAddDz(String id, String zpid);

    /**
     * 获取用户点赞
     */
    List<String> getDz(String id);

    /**
     * 取消点赞
     */
    int CancleDz(String zpid);

    int DeleteDzInfo(String id, String zpid);

    /**
     * 添加作品评论
     */
    int HandlePl(String zpid, String userid, String content, String time);

    /**
     * 评论数量自增1
     */
    int AddPlNum(String zpid);

    /**
     * 通过zpid获取评论
     */
    List<Pl> getPlByZpid(String zpid);

    List<Zp> getMoreZp(int start, int limit);
}
