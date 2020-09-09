#镜像基于node:8-alpine构建，不同版本自己项目检查一下，需要其它版本可自行修改
FROM hub.kce.ksyun.com/yunmi-infra/viomi/nodejs:v12.18.1
#添加工作目录
RUN mkdir -p /home/public/
#拷贝当前目录文件到工作目录下
COPY ./ /home/public/
#指定工作目录
WORKDIR /home/public/
#启动nodejs命令脚本，不同项目自定义进行修改
ENTRYPOINT ["node","Src/Server/index.js", "PROD"]