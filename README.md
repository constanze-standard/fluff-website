# Fluff Website

Fluff 微框架的官方网站构建器

官网地址：https://www.fluff-framework.cn/

## 在本地运行和测试：
首先要安装 ruby，然后按照下面的命令构建系统：
```sh
sudo gem install bundler
bundle install
```
运行 jekyll 内建服务器：
```sh
bundle exec jekyll serve
```
默认的访问地址为：http://localhost:4000

## 编译 css 和 js
首先需要安装 nodejs，然后运行以下命令安装工具链：
```sh
npm install
```

所有 css 都引入 `/src/sass/main.scss`，所有 js 都引入 `/src/scripts/main.js`. 如果你需要编写 css 和 js，请遵循这个规则。

当编写新的 sass 或 js 文件后，需要重新编译。运行以下命令调用 gulp 对文件进行监听：
```sh
npm run build
```

本项目使用 github page，您不需要自己部署，只要 push 到 master 即可！
