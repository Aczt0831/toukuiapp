package com.Toukui.service.impl;

import com.Toukui.mapper.ZpMapper;
import com.Toukui.pojo.Pl;
import com.Toukui.pojo.Zp;
import com.Toukui.service.ZpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ZpServiceImpl implements ZpService {

    @Autowired
    private ZpMapper zpMapper;
    @Override
    public int setNewZp(String id, String title, String content, byte[] zpimg, String zptime) {
        return zpMapper.setNewZp(id, title, content, zpimg, zptime);
    }

    @Override
    public List<Zp> getAllZp() {
        return zpMapper.getAllZp();
    }

    @Override
    public List<Zp> getZpByZpid(String zpid) {
        return zpMapper.getZpByZpid(zpid);
    }

    @Override
    public int HandleDz(String zpid) {
        return zpMapper.HandleDz(zpid);
    }

    @Override
    public int HandleAddDz(String id, String zpid) {
        return zpMapper.HandleAddDz(id, zpid);
    }

    @Override
    public List<String> getDz(String id) {
        return zpMapper.getDz(id);
    }

    @Override
    public int CancleDz(String zpid) {
        return zpMapper.CancleDz(zpid);
    }

    @Override
    public int DeleteDzInfo(String id, String zpid) {
        return zpMapper.DeleteDzInfo(id, zpid);
    }

    @Override
    public int HandlePl(String zpid, String userid, String content, String time) {
        return zpMapper.HandlePl(zpid, userid, content, time);
    }

    @Override
    public int AddPlNum(String zpid) {
        return zpMapper.AddPlNum(zpid);
    }

    @Override
    public List<Pl> getPlByZpid(String zpid) {
        return zpMapper.getPlByZpid(zpid);
    }

    @Override
    public List<Zp> getMoreZp(int start, int limit) {
        return zpMapper.getMoreZp(start, limit);
    }


}
