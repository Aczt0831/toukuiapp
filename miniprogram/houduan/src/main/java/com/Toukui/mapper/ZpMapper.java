package com.Toukui.mapper;

import com.Toukui.pojo.Pl;
import com.Toukui.pojo.Zp;
import org.apache.ibatis.annotations.*;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@Mapper
public interface ZpMapper {

    /*
    新增用户作品
     */
    @Insert("insert into zptable(userid, zptitle, zpcontent, zpimg, zpsj, zpdz, pl) values (#{id}, #{title}, #{content}, #{zpimg}, #{zptime}, 0, 0)"
)
    int setNewZp(@Param("id")String id, @Param("title")String title, @Param("content")String content, @Param("zpimg")byte[] zpimg, @Param("zptime")String zptime);

    /**
     * 获取所有作品信息
     */
    @Select("SELECT z.*, u.username, u.usertx FROM zptable z INNER JOIN userinfo u ON z.userid = u.id ORDER BY z.zpsj DESC")
    List<Zp> getAllZp();

    @Select("SELECT z.*, u.username, u.usertx FROM zptable z INNER JOIN userinfo u ON z.userid = u.id ORDER BY z.zpsj DESC LIMIT #{start}, #{limit}")
    List<Zp> getMoreZp(@Param("start") int start, @Param("limit") int limit);

    /**
     * 通过zpid获取作品信息
     * @return
     */
    @Select("select z.*, u.username, u.usertx from zptable z inner join userinfo u on z.userid = u.id where z.id=#{zpid}")
    List<Zp> getZpByZpid(String zpid);

    @Update("UPDATE zptable SET zpdz = zpdz + 1 where id = #{zpid}")
    int HandleDz(String zpid);

    /**
     * 在dz表中添加点赞信息
     * @param id
     * @param zpid
     * @return
     */
    @Insert("INSERT INTO dz (id, zpid) VALUES (#{id}, #{zpid});")
    int HandleAddDz(@Param("id") String id, @Param("zpid") String zpid);

    @Select("select zpid from dz where id=#{id}")
    List<String> getDz(String id);

    /**
     * 用户取消点赞
     */
    @Update("UPDATE zptable SET zpdz = zpdz - 1 where id = #{zpid}")
    int CancleDz(String zpid);

    @Insert("DELETE FROM dz WHERE id=#{id} And zpid=#{zpid};")
    int DeleteDzInfo(@Param("id") String id, @Param("zpid") String zpid);

    /**
     * 添加作品评论
     * @param zpid
     * @param userid
     * @param content
     * @param time
     * @return
     */
    @Insert("INSERT INTO pl (zpid, userid, content, time) VALUES (#{zpid}, #{userid}, #{content}, #{time});")
    int HandlePl(@Param("zpid") String zpid, @Param("userid") String userid, @Param("content") String content, @Param("time") String time);

    /**
     * 评论数量自增1
     * @param zpid
     * @return
     */
    @Update("UPDATE zptable set pl = pl + 1 where id = #{zpid}")
    int AddPlNum(String zpid);

    /**
     * 获取作品评论
     * @param zpid
     * @return
     */
    @Select("select z.*, u.username, u.usertx from pl z inner join userinfo u on z.userid = u.id where z.zpid=#{zpid} ORDER BY z.time DESC")
    List<Pl> getPlByZpid(String zpid);

}
