package com.Toukui.service;

import com.Toukui.pojo.VideoPlayback;
import java.util.List;

/**
 * 视频回放Service接口
 */
public interface VideoPlaybackService {
    
    /**
     * 获取所有视频列表
     * @return 视频列表
     */
    List<VideoPlayback> getAllVideos();
    
    /**
     * 根据ID获取视频详情
     * @param id 视频ID
     * @return 视频对象
     */
    VideoPlayback getVideoById(Integer id);
    
    /**
     * 添加视频
     * @param videoPlayback 视频对象
     * @return 是否成功
     */
    boolean addVideo(VideoPlayback videoPlayback);
    
    /**
     * 标记视频为已查看
     * @param id 视频ID
     * @return 是否成功
     */
    boolean markVideoAsViewed(Integer id);
    
    /**
     * 删除视频
     * @param id 视频ID
     * @return 是否成功
     */
    boolean deleteVideo(Integer id);
}