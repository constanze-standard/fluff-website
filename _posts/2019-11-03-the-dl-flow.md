---
layout: post
title:  "基于依赖查找的应用系统"
date:   2019-11-03 11:11:42 +0800
author: Alex
excerpt: 对于中小型的系统而言，依赖查找模式结构简单，体积小巧，是很不错的选择。这篇文章告诉你如何利用 Fluff 构建一个依赖查找风格的应用系统。
---

`依赖查找 (DL)`是一种控制反转的实现方式，相较于现在流行的`依赖注入 (DI)`模式，依赖查找几乎不会占用额外的系统资源，但由于依赖项的获取需要通过`依赖查找器`进行，所以系统中的耦合仍然存在，从而使系统的迁移和测试看起来不那么自然。不过，对于中小型的系统而言，这种模式结构简单，体积小巧，是很不错的选择。

下面我们将使用 Fluff 构建一个基于依赖查找的应用系统。

## 构建应用的核心
首先我们需要一个容器作为`依赖查找器`，调用策略我们选择 `Vargs` 配合 `Delay` 组件进行延迟初始化处理。我们要做的是，当对象初始化的时候，将容器对象作为构造方法的参数传入即可。
```php
use ConstanzeStandard\Container\Container;
use ConstanzeStandard\Fluff\RequestHandler\Delay;
use ConstanzeStandard\Fluff\RequestHandler\Vargs;

$container = new Container();

$strategy = function($className, $method) use ($container) {
    return [new $className($container), $method];
};

$definition = Delay::getDefinition($strategy, Vargs::getDefinition());
```
如上例所示，我们现在创建了一个`延迟策略`，它会在 Request 传递到 Request Handler 时自动完成类的初始化，并且将 `container` 作为初始化参数传递。

接下来，我们需要将这个策略应用到路由派发系统（Dispatcher）中，使得每一次的请求处理都继承这一策略。最后将构建好的核心传入 Application 激活应用。
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\RequestHandler\Dispatcher;
...

$dispatcher = new Dispatcher($definition);
$app = new Application($dispatcher);
$app->addMiddleware(new EndOutputBuffer());
```

## 使用依赖查找
下面将用一个 demo 展示如何使用在业务逻辑中使用依赖查找。我们模拟一个简单的场景，我们需要从一个“`StudentService`”中查找一个学生的成绩，并返回通知消息。

首先定义 `StudentService`，并将它添加进容器中。
```php
class StudentService
{
    public function getScore(string $name)
    {
        switch ($name) {
            case 'Tom':
                return 20;
            case 'Alex':
                return 30;
        }

        return false;
    }
}

$container->add('studentService', function() {
    return new StudentService();
}, true);
```

然后，我们创建一个 `StudentController` 作为业务逻辑的接口：
```php
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ServerRequestInterface;
use Nyholm\Psr7\Response;

class StudentController
{
    /** @var ContainerInterface */
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function score(ServerRequestInterface $request, $name)
    {
        $studentService = $this->container->get('studentService');
        $score = $studentService->getScore($name);
        $message = $score === false ? '暂时查不到你的分数。' : '你的分数是：'. $score;
        return new Response(200, [], $message);
    }
}
```
最后，通过路由将 `StudentController` 与 `/studnet/score/{$name}` 进行绑定。
```php
use Nyholm\Psr7\ServerRequest;

$router = $dispatcher->getRouter();

$router->get('/studnet/score/{name}', 'StudentController@score');

$request = new ServerRequest('GET', '/studnet/score/Alex');
$app->handle($request);
```
