# 基于 openjdk:8-jre 为基础镜像进行构建
FROM openjdk:8-jre
# 作者
MAINTAINER lzb
# 进入这个容器的目录指定为/app
WORKDIR /usr/local/java
#同步docker内部时间
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone
#设置时区
ENV TZ=Asia/Beijing
#复制jar包到/user/Local/java下
COPY target/TouKuiApp-0.0.1-SNAPSHOT.jar ./TouKuiApp-0.0.1-SNAPSHOT.jar
# 端口
EXPOSE 8080
# ENTRYPOINT 和 CMD 结合使用，ENTRYPOINT固定命令，CMD根据参数的不同 运行不同的jar包(动态参数)
ENTRYPOINT ["java","-jar"]
CMD ["TouKuiApp-0.0.1-SNAPSHOT.jar"]
# 相当于 java -jar xxx.jar
