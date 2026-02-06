package com.Toukui.mapper;

import com.Toukui.pojo.VideoPlayback;
import org.apache.ibatis.annotations.Mapper;
import java.util.List;

/**
 * 视频回放Mapper接口
 */
@Mapper
public interface VideoPlaybackMapper {
    
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
     * @return 影响行数
     */
    int addVideo(VideoPlayback videoPlayback);
    
    /**
     * 更新视频状态（标记为已查看）
     * @param id 视频ID
     * @return 影响行数
     */
    int updateVideoStatus(Integer id);
    
    /**
     * 删除视频
     * @param id 视频ID
     * @return 影响行数
     */
    int deleteVideo(Integer id);
}