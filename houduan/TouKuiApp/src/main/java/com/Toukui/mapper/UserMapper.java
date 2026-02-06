package com.Toukui.mapper;

import com.Toukui.pojo.User;
import org.apache.ibatis.annotations.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Mapper
public interface UserMapper {

    @Insert("insert into toukuiinfo.userinfo(username, account, password) values (#{username}, #{account}, #{password}) ")
    void register(User user);


    @Select("select account from userinfo where account = #{account}")
    List<String> AllAccount(String account);

    @Select("select * from userinfo where id = #{id}")
    List<User> getUserInfoByZh(String id);

    @Select("select id from userinfo where account = #{account} && password = #{password}")
    String HandlePassword(User user);

    @Update("update userinfo set styleList = #{stylelist} where id = #{id}")
    int changeStyleList(@Param("id") String id, @Param("stylelist") String stylelist);

    @Update("update userinfo set username = #{username} where id = #{id}")
    int changeName(@Param("id") String id, @Param("username") String username);

    @Update("update userinfo set usertx = #{tximg} where id = #{id}")
    int changeTx(@Param("id") String id, @Param("tximg") byte[] tximg);

}
