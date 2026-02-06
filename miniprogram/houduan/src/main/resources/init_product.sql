-- 创建商品表
CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DOUBLE NOT NULL,
    image VARCHAR(255),
    total_count INT DEFAULT 0 COMMENT '总数量',
    sold_count INT DEFAULT 0 COMMENT '卖出数量'
);

-- 插入商品数据
INSERT INTO product (id, name, price, image, total_count, sold_count) VALUES
(1, '防雾头盔镜片 - 透明', 89.9, '../../static/images/tkimg.png', 100, 25),
(2, '夏季透气头盔内衬', 59.9, '../../static/images/tkimg.png', 150, 42),
(3, '头盔安全气囊 - 标准版', 129.9, '../../static/images/tkimg.png', 80, 18),
(4, '炫酷头盔贴纸套装', 29.9, '../../static/images/tkimg.png', 200, 75),
(5, '头盔下巴网 - 可拆卸', 19.9, '../../static/images/tkimg.png', 120, 36),
(6, '头盔清洁护理套装', 49.9, '../../static/images/tkimg.png', 180, 51);