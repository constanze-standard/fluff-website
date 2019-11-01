---
title: 中间件概述
---

中间件为过滤和改造进入应用程序的 HTTP 请求提供了一种便利的机制，例如身份验证，CORS 访问控制等等。

中间件是一个层次模型，你可以将它看做一系列的“层”，请求将从外向内通过每一层中间件，最终抵达 Request Handler. 在处理过程中，每一层都有权通过请求或拒绝请求返回 Response。当其中一层返回 Response 对象后，处理链条也随即终止。

<img class="img-fluid" src="/fluff-website/docs/v1/images/middleware.png" />

## 中间件的标准
Fluff 使用的标准 是由 PHP-FIG 提供的 PSR-15，所以，如果你想要编写一个中间件，就需要实现 `\Psr\Http\Server\MiddlewareInterface` 接口，下面给出一个中间件的示例：
```php
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Nyholm\Psr7\Response;

class AgeMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $params = $request->getQueryParams();
        if (isset($params['age']) && $params['age'] < 18) {
            return new Response(403, [], 'Go home kid!');
        }

        return $handler->handle($request);
    }
}
```
如上例所示，如果年龄小于 18 岁，则中间件会返回一个 403 Forbidden 错误，如果在 18 岁以上，则会调用 `$handler` 的 `handle` 方法，继续将 Request 传递到应用的下一层。

中间件就是这样一种应用，请求经过的每一层都可以检查、改造或拒绝请求。

## 前置和后置操作
中间件的的执行方式类似于入栈和出栈，而当某一层返回 Response 后，还会有一个回溯过程。所以中间件在请求之前还是之后执行，与 `$handler` 有关，如下例所示：
```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class BeforeAfterMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        // 前置操作
        $response = $handler->handle($request);
        // 后置操作
        return $response;
    }
}
```

## 添加一个全局中间件
如果你希望中间件作用于应用程序的每个 HTTP 请求，可以调用 `Application::addMiddleware` 添加一个全局中间件。
```php
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
...

/** @var EndOutputBuffer $middleware */
$middleware = $app->addMiddleware(new EndOutputBuffer());
```
