---
title: 异常捕获
---

Fluff 在发生异常时会直接抛出错误，如果你希望在发生异常时输出一个错误页面，或提示信息，就要使用 `ExceptionCaptor` 中间件。

## 添加一个异常处理
利用 `ExceptionCaptor`，我们可以将一个处理程序绑定到一个异常类型上，当出现异常时，中间件会自动检测异常的类型，调用对应的处理程序。

异常处理程序是一个 `callable` 类型的对象，接受一个 request 对象，和异常对象，并且最终需要返回 response 对象，下面是一个添加异常处理程序的完整例子：
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Exception\NotFoundException;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\Middleware\ExceptionCaptor;
use Nyholm\Psr7\Response;
use Psr\Http\Message\ServerRequestInterface;

...

$notFoundHandler = function(ServerRequestInterface $request, \Throwable $e) {
    return new Response(404, [], $e->getMessage());
};

/** @var ExceptionCaptor $exceptionCaptor */
$exceptionCaptor = $app->addMiddleware(new ExceptionCaptor());
$exceptionCaptor->withExceptionHandler(NotFoundException::class, $notFoundHandler);

$app->addMiddleware(new EndOutputBuffer());
```
如上所示，我们调用 `ExceptionCaptor::withExceptionHandler` 方法为 `ConstanzeStandard\Fluff\Exception\NotFoundException` 添加了异常处理程序，当请求没有路由匹配时，就会执行`$notFoundHandler`, 并发送 response 的内容到前端。

## 异常处理程序的优先级
当异常发生时，`ExceptionCaptor` 会首先查找注册过的，与当前异常类型一致的处理程序，如果没有，则会继续检查是否注册过当前异常类型的父级类型，如果存在，则执行对应的处理程序，并返回处理程序提供的 `Psr\Http\Message\ResponseInterface` 实例；如果不存在处理程序，则会直接抛出异常。

所以，如果你想定义一个应对所有异常的处理程序，那就是 `\Exception` 类型的处理程序。

`ExceptionCaptor` 中间件需要在 `EndOutputBuffer` 的内层，因为它需要 EndOutputBuffer 输出 Response 的内容。所以在代码中，ExceptionCaptor 应该在 EndOutputBuffer 之前添加进 `Application`.
