package com.Toukui.mapper;

import com.Toukui.pojo.Markers;
import org.apache.ibatis.annotations.*;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.List;

@Mapper
public interface MarkersMapper {

   @Insert("insert into markers(userid, id, latitude, longitude, iconPath, width, height, localname, isGone) VALUES ( #{userid}, #{id}, #{latitude}, #{longitude}, #{iconPath}, #{width}, #{height} , #{localname}, #{isGone})")
   int addMarker(Markers markers);

   /**
    * 获取用户标记
    */
   @Select("select id, latitude, longitude, iconPath, width, height, localname, isGone from markers where userid=#{id}")
   List<Markers> getMarkersById(Integer id);

   @Delete("delete from markers where userid=#{userid} And id=#{id}")
   int deleteMarker(@Param("userid") Integer userid, @Param("id") Integer id);

   /**
    * 修改标记值为1
    */
   @Update("update markers set isGone=1,iconPath='../../static/images/zj.png' where id=#{id}")
   int addFootPrint(Integer id);

}
