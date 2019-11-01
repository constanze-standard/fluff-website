---
title: 阅读指南
---

Fluff 很简单，请按照下面给出的建议阅读文档，很快就可以开启你的创作之旅 : )

## 学习基础知识
### 学习使用 PHP
如果你还是 PHP 的新手，我们建议你花费一点时间阅读 PHP 官方文档的[语言参考](https://www.php.net/manual/en/langref.php)部分。

### 了解 HTTP
web 应用的开发与 HTTP 协议密切相关，也是浏览器与服务器的主要通信手段，在开始一切之前，充分了解 HTTP 知识是很有必要的。请阅读 Mozilla Developer Network 中对 [HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP) 的介绍。

### 阅读 PSR 标准
[PSR](https://www.php-fig.org/psr/) 是 [PHP-FIG](https://www.php-fig.org/) 制定的一系列的标准和建议，遵循 PSR 标准的程序往往能够在不同的系统上运转，有很强的适应性。Fluff 引入了两项 PSR 标准，分别是 [PSR-7](https://www.php-fig.org/psr/psr-7/) 和 [PSR-15](https://www.php-fig.org/psr/psr-15/)，在开始之前，首先了解这些协议，将对你的学习和开发有所帮助。

### 学习使用 composer
[composer](https://getcomposer.org/) 是目前最流行的 PHP 依赖管理器，Fluff 利用 composer 管理项目的构建和发布。composer 也是现代 PHP 开发者必须掌握的工具之一，请阅读[官方文档](https://getcomposer.org/doc/)学习基本的使用方法。

## 选择现代的 PHP
Fluff 使用 PHP-7.1 及以上版本，以启用现代的语言功能，即使示例中未特别提及也是如此，请确保你的环境受到支持。

## 文档中的变量命名
为了简洁起见，示例中的变量名称将反映 API 所使用的数据类型。例如，`$string`, `$array` 分别指代字符串和数组类型，如果值仅表示 `true` 或 `false` 则为 `$bool`, `$app` 表示 `Application` 对象。

## 安装必要的组件
Fluff 依赖于 psr-7 的 http message 组件，在开始教程之前，你首先要对 http message 组件做出选择。我们推荐你在 [`Packagist`](https://packagist.org/) 上浏览和搜索你喜欢的组件。

文档示例中所选择的是 [`nyholm/psr7`](https://github.com/Nyholm/psr7) 和 [`nyholm/psr7-server`](https://github.com/Nyholm/psr7-server) 这两个组件。如果你对 http message 组件没有特殊的需求，可以与我们一样使用 composer 命令直接安装它们。
```sh
composer require nyholm/psr7 nyholm/psr7-server
```

## 如何运行脚本？
由于 Fluff 的 http message 组件是从外部引入的，所以我们可以很方便的模拟 request 对象，因此，大部分的示例不需要使用任何 web 服务器工具，你只需要在命令行中执行脚本文件即可。如果文档没有特别提及，我们也将默认采用这种方式运行示例代码。
```sh
php ./index.php
```
对于个别示例需要通过浏览器访问，我们统一使用 PHP 的内建服务器进行交互。请进入你的工作目录，然后使用以下命令在 `8080` 端口上开启内建服务器。
```sh
php -S 0.0.0.0:8080 -t .
```
