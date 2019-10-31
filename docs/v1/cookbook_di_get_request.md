---
title: 在 Di 模式下获取 Request
---

当我们使用 `Args` 和 `Vargs` 组件作为核心时，Request 对象是直接作为 handler 的第一个参数传递进来的，但在 Di 模式下，看起来无法直接获取到，这时，就需要利用中间件去捕获最新的 Request 对象。

## 定义 RequestCatchingMiddleware
我们需要定义一个中间件，在请求经过 Request Handler 之前的最后一层捕获 Request 对象，并注册到容器中。
```php
use ConstanzeStandard\Container\Container;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class RequestCatchingMiddleware implements MiddlewareInterface
{
    /**
     * @param Container
     */
    private $container;

    public function __construct(Container $container)
    {
        $this->container = $container;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $container->add(ServerRequestInterface::class, $request);
        $container->add(get_class($request), $request);
        return $handler->handle($request);
    }
}
```
向 Application 添加中间件时需要注意的是，`RequestCatchingMiddleware` 必须位于中间件组的最内层，也就是说，应该放在所有中间件的最前面被添加。