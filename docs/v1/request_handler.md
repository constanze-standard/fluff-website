---
title: Request Handler
---

`Request Handler`，顾名思义，是针对 request 的一段处理逻辑，在 Fluff 中，`Request Handler` 接受一个 PSR-7 server-side request 对象，并返回一个 `Response` (`Psr\Http\Message\ResponseInterface`) 对象：
```php
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\RequestHandlerInterface;

class RequestHandler implements RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        ...
    }
}
```

`Request Handler` 也是框架的核心，我们可以将 Request Handler 传入 `Application` 来构建一个完整的应用程序。
```php
$core = new RequestHandler();
$app = new Application($core);
```

Fluff 以组件的形式，提供了多种 `Request Handler`，它们具有不同的行为和设计模式，它们包括：
- [基本的参数传递模式]({% link docs/v1/request_handler_basic.md %})
- [依赖注入模式]({% link docs/v1/request_handler_di.md %})
- [延迟初始化模式]({% link docs/v1/request_handler_delay.md %})
- [基于路由的请求派发模式]({% link docs/v1/index.md %})

请参阅以上章节，了解不同核心的特性，并根据文章中的示例实现简单的 demo.
