package com.Toukui.service.impl;

import com.Toukui.mapper.VideoPlaybackMapper;
import com.Toukui.pojo.VideoPlayback;
import com.Toukui.service.VideoPlaybackService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

/**
 * 视频回放Service实现类
 */
@Service
public class VideoPlaybackServiceImpl implements VideoPlaybackService {
    
    @Autowired
    private VideoPlaybackMapper videoPlaybackMapper;
    
    @Override
    public List<VideoPlayback> getAllVideos() {
        return videoPlaybackMapper.getAllVideos();
    }
    
    @Override
    public VideoPlayback getVideoById(Integer id) {
        return videoPlaybackMapper.getVideoById(id);
    }
    
    @Override
    public boolean addVideo(VideoPlayback videoPlayback) {
        return videoPlaybackMapper.addVideo(videoPlayback) > 0;
    }
    
    @Override
    public boolean markVideoAsViewed(Integer id) {
        return videoPlaybackMapper.updateVideoStatus(id) > 0;
    }
    
    @Override
    public boolean deleteVideo(Integer id) {
        return videoPlaybackMapper.deleteVideo(id) > 0;
    }
}