-- 视频回放表结构设计
CREATE TABLE `video_playback` (
  `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '视频ID',
  `name` varchar(255) NOT NULL COMMENT '视频名称',
  `url` varchar(500) DEFAULT NULL COMMENT '视频地址',
  `thumbnail` varchar(500) DEFAULT NULL COMMENT '缩略图地址',
  `date` date NOT NULL COMMENT '日期',
  `time` varchar(50) NOT NULL COMMENT '时间段，格式：HH:MM - HH:MM',
  `duration` varchar(20) NOT NULL COMMENT '时长，格式：HH:MM:SS',
  `is_new` tinyint(1) NOT NULL DEFAULT 1 COMMENT '是否新视频(0-否 1-是)',
  `create_time` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `update_time` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='头盔视频回放记录';

-- 插入示例数据
INSERT INTO `video_playback` (`name`, `url`, `thumbnail`, `date`, `time`, `duration`, `is_new`) VALUES
('头盔使用记录 - 骑行路上', '', 'tkimg.png', '2025-10-15', '14:30 - 15:45', '01:15:30', 1),
('头盔使用记录 - 城市通勤', '', 'tkimg.png', '2025-10-14', '08:15 - 09:00', '00:45:20', 0),
('头盔使用记录 - 周末骑行', '', 'tkimg.png', '2024-10-12', '10:00 - 12:30', '02:30:15', 0),
('头盔使用记录 - 夜骑模式', '', 'tkimg.png', '2023-10-10', '19:00 - 20:15', '01:15:40', 0);