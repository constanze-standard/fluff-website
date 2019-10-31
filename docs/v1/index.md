---
title: Fluff 微框架
---

在一片自由舒适的乐土上创造价值。

## 自由不是随心所欲的堆砌
自由不是随心所欲的堆砌，自由的创造建立在井然有序的标准之上。标准虽然约束了表现形式，却能够使你的作品在造福他人的同时，也为自己带来同样的便利，这在现代软件开发中非常重要！我们利用标准和规范，让既有的经验得以复用；资源的共享和流通，使我们在开发过程中的决策变得更加自由。

整合了当今主流实践标准的 Fluff 正是这一思想的产物。使用 Fluff，你将充分享受创造的过程！我们崇尚标准化的解决方案，但摒弃传统架构上的条条框框。我们和你一样厌倦乏味的配置和选项，我们喜欢立刻着手去做，不让灵感淹没在形式化的教条中。我们相信最熟悉的也能成为最好的，思维不应该被所谓的“最佳方案”所束缚。

## Fluff 是什么？
- Fluff 是一个多核心的 PHP [微框架](https://en.wikipedia.org/wiki/Microframework)，它为应用程序的构建提供多种形式的解决方案。
- Fluff 是一个能够随需求的增加而不断成长的渐进式框架。从一段处理逻辑到一个庞大的架构，它可以以任何形式出现在你的程序之中。

## 安装
推荐使用 [composer](https://getcomposer.org/) 来安装应用，只需要一行命令，和几分钟的等待时间。
```sh
composer require constanze-standard/fluff:1.0
```

## 它是如何工作的
这是一个可输出的最小应用 （引用组件：nyholm/psr7）.
```php
<?php

use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\RequestHandler\Handler;
use Nyholm\Psr7\Response;
use Nyholm\Psr7\ServerRequest;

require __DIR__ . '/vendor/autoload.php';

$app = new Application(new Handler(function($request) {
    $user = $request->getUri()->getUserInfo();
    return new Response(200, [], "I ♥ $user!");
}));

$app->addMiddleware(new EndOutputBuffer);

$request = new ServerRequest('GET', '//Fluff@localhost');
$app->handle($request);
```