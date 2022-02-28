---
title: Request Handler
---

`Request Handler`，顾名思义，是针对 request 的一段处理逻辑，在 Fluff 中，`Request Handler` 接受一个 PSR-7 server-side request 对象，并返回一个 `Response` (`Psr\Http\Message\ResponseInterface`) 对象。

<img class="img-fluid" src="{{ "/docs/v1/images/legao.png" | prepend: site.baseurl }}" />

Fluff 以组件的形式提供了多种 `Request Handler`，从运行机制上讲，`Request Handler` 大体分为两类，一类是具有完整特性的，作为`调用策略`使用的组件；另一种是需要与`调用策略`组件向配合，可以组合出具有不同“个性”的`扩充性`组件。这些组件的多样性，让我们的应用系统有着无限的可能性，于是，我们就可以像“搭积木”一样的让架构体现出自己的风格了。
`Request Handler` 是框架的核心，我们可以将 Request Handler 传入 `Application` 来构建一个完整的应用程序。

```php
use ConstanzeStandard\Fluff\Application;

$core = new RequestHandler();
$app = new Application($core);
```

请参阅以下章节，了解不同核心的特性，并根据文章中的示例实现简单的 demo：
- [基本的参数传递模式]({% link docs/v1/request_handler_basic.md %})
- [依赖注入模式]({% link docs/v1/request_handler_di.md %})
- [延迟初始化模式]({% link docs/v1/request_handler_delay.md %})
- [基于路由的请求派发模式]({% link docs/v1/index.md %})
