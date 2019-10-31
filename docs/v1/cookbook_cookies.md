---
title: 对 Cookie 的支持
---

PSR-7 的 response  并不包含 cookie，但我们可以使用组件 [constanze-standard/cookies](https://github.com/constanze-standard/cookies) 配合中间件，对这部分的功能进行扩展。你可以使用以下命令安装组件：
```sh
composer require constanze-standard/cookies
```

`constanze-standard/cookies` 包含了一个 `CookieCollection`，可以让使用者收集 cookie 信息，然后将 cookies 写入 PSR-7 Response 中。详细的使用方式请参阅[官方文档](https://github.com/constanze-standard/cookies/blob/master/README.md)，本章主要展示如何将它与 Fluff 系统集成。

下面的示例中，我们选用 Di 作为 Application 的核心，并展示 `constanze-standard/cookies` 是如何与 Fluff 系统集成的。

## 注册 CookieCollection 服务
首先需要创建 CookieCollection 服务，通过它在各组件之间收集 cookies 信息。
```php
use ConstanzeStandard\Cookies\CookieCollection;
use ConstanzeStandard\Container\Container;

$container = new Container();
$container->add(CookieCollection::class, function() {
    return new CookieCollection();
}, true);
```

## 定义 CookiesMiddleware 中间件
我们需要在输出 Response 之前，将 `CookieCollection` 服务收集到的 cookie 数据写入 Response，所以需要构建一个中间件来做这个工作，这里把这一中间件命名为 `CookiesMiddleware`：
```php
use ConstanzeStandard\Cookies\CookieCollection;
use Psr\Container\ContainerInterface;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class CookiesMiddleware implements MiddlewareInterface
{
    /**
     * @param ContainerInterface
     */
    private $container;

    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        $cookieCollection = $this->container->get(CookieCollection::class);
        return $cookieCollection->makeResponse($response);
    }
}
```
`CookiesMiddleware` 从容器中获取 `CookieCollection` 服务，并将 cookies 写入 Response.

## 通过依赖注入引用服务
注册了 CookieCollection 服务后，你就可以通过 Di 组件的依赖注入，在自己的业务程序中使用它了：
```php
use ConstanzeStandard\Cookies\Cookie;
use ConstanzeStandard\Cookies\CookieCollection;
use ConstanzeStandard\Fluff\RequestHandler\DI;
use Nyholm\Psr7\Response;

$core = new DI($container, function(CookieCollection $cookieCollection) {
    $cookie = new Cookie('name', 'value', 60);
    $cookieCollection->addCookie($cookie);
    return new Response(200);
});
```


最后，我们需要将按照层级顺序，将 `CookiesMiddleware` 和 `EndOutputBuffer` 两个中间件添加到 Application 中，并用 `ServerRequest` 对象激活应用程序即可。
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use Nyholm\Psr7\ServerRequest;

$app = new Application($core);
$app->addMiddleware(new CookiesMiddleware($container));
$app->addMiddleware(new EndOutputBuffer());

$app->handle(new ServerRequest('GET', ''));
```
注意中间件添加的顺序，cookie 应该在输出中间件的里层，也就是需要在 `EndOutputBuffer` 之前添加。如果有 `ExceptionCaptor` 的话，则应该位于 `EndOutputBuffer` 之前、`ExceptionCaptor` 之后。
