---
title: 请求派发模式：Dispatcher
---

大部分场景下，我们希望能够根据 URL，将请求分配给不同的“控制器”进行处理，即比较常见的`路由模式`。`Dispatcher` 组件为这种模式提供了支持。

Dispatcher 组件是一个特殊的 `Request Handler`，它接受一个 `Definition` 作为每次请求的调用策略，然后你可以通过设置路由的方式，为不同请求绑定处理程序：
```php
use ConstanzeStandard\Fluff\RequestHandler\Vargs;
use ConstanzeStandard\Fluff\RequestHandler\Dispatcher;
use Nyholm\Psr7\Response;

$core = new Dispatcher(Vargs::getDefinition());
$router = $core->getRouter();

$router->get('/user/{name}', function($request, $name) {
    return new Response(200, [], 'Hello '. $name);
});
```
你也可以将路由作为独立组件进行初始化，然后传入 `Dispatcher` 组件（Dispatcher 预留了路由接口，让你可以对路由组件进行替换）。
```php
use ConstanzeStandard\Fluff\RequestHandler\Vargs;
use ConstanzeStandard\Fluff\RequestHandler\Dispatcher;
use ConstanzeStandard\Fluff\Routing\Router;
use Nyholm\Psr7\Response;

$router = new Router();
$router->get('/user/{name}', function($request, $name) {
    return new Response(200, [], 'Hello '. $name);
});

$core = new Dispatcher(Vargs::getDefinition(), $router);
```
现在我们已经构建了一个基于`请求派发器(Dispatcher)`的核心，接下来的操作与其他场景无异，只需要把核心组件传入 Application，然后分配 Request 实例即可。
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use Nyholm\Psr7\ServerRequest;

$app = new Application($core);
$app->addMiddleware(new EndOutputBuffer());

$request = new ServerRequest('GET', '/user/Alex');
$app->handle($request);
```

## 路由组件
路由组件负责绑定请求与处理程序，然后向 Dispatcher 提供这些绑定关系，你可以通过调用 `Dispatcher::getRouter` 方法直接获取默认的路由组件。
```php
use ConstanzeStandard\Fluff\Interfaces\RouterInterface;
use ConstanzeStandard\Fluff\RequestHandler\Vargs;
use ConstanzeStandard\Fluff\RequestHandler\Dispatcher;

$dispatcher = new Dispatcher(Vargs::getDefinition());
/** @var RouterInterface $router  */
$router = $dispatcher->getRouter();
```
### 添加一条路由信息
`Router` 提供了一个 `add` 方法和5个针对 `HTTP Method` 的辅助方法，用于添加路由信息：
```php
/**
 * @param array|string          $methods 请求的 HTTP Method，可以指定一个或用数组指定多个
 * @param string                $pattern 请求的 URL 的匹配模式
 * @param \Closure|array|string $handler 请求的处理程序
 * @param MiddlewareInterface[] $middlewares 绑定的中间件
 * @param string|null           $name 路由名称
 * 
 * @return \ConstanzeStandard\Fluff\Interfaces\RouteInterface
 */
$router->add($methods, $pattern, $handler, $middlewares, $name);
$router->get($pattern, $handler, $middlewares, $name);
$router->post($pattern, $handler, $middlewares, $name);
$router->put($pattern, $handler, $middlewares, $name);
$router->delete($pattern, $handler, $middlewares, $name);
$router->options($pattern, $handler, $middlewares, $name);
```
其中 `Router::add` 方法的参数 `$methods` 可以使用字符串指定一个 HTTP Method，也可以用数组指定多个。

参数 `$pattern` 是 URL 的匹配模式，支持用`花括号 {}`标记一个 URL 参数，并传递给 `$handler`，并且可以对参数进行正则过滤，下面是一个示例，本例使用 `Vargs` 作为调用策略：
```php
$router->get('/user/{id:\d+}', function($request, $id) {
    ...
});
```
上例中，我们指定了一个 URL 模式，在模式中，我们用花括号标记了 URL 参数 `id`，然后用冒号 (`:`)分隔，在后面指定了参数的验证规则 `\d+`，也就是，`id` 必须为数字。当比配成功后，参数将会被传入处理程序 `$handler` 中，由于我们本次选用了 `Vargs` 作为调用策略，所以 `$handler` 会接收到一个 Request 实例，和 URL 参数 `id`。

*如果你仔细阅读前面的章节，会发现，路由组件实际上是把需要手动传递给 `Request Handler` 的参数列表，通过 URL 参数的形式传递了*。

参数 `$handler` 与 `Request Handler` 的处理程序是一样的，它的表现形式与你选用的 Definition 有关，也就是说，`$handler` 会继承绑定到 Dispatcher 上的 `Request Handler` 的特性。我们从上面的例子中已经看到，当绑定了 `Vargs` 的 Definition 时，`$handler` 也变成了`顺序传参模式`。

同理，如果绑定的是 `Delay` 的 Definition，`$handler` 也可以像 `Delay` 组件一样支持 `class@method` 形式的参数了：
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\RequestHandler\Delay;
use ConstanzeStandard\Fluff\RequestHandler\Vargs;
use ConstanzeStandard\Fluff\RequestHandler\Dispatcher;
use Nyholm\Psr7\Response;
use Nyholm\Psr7\ServerRequest;

class Target
{
    public function index($request, $name)
    {
        return new Response(200, [], 'Hello '. $name);
    }
}

$strategy = function($className, $method) {
    return [new $className, $method];
};

$definition = Delay::getDefinition($strategy, Vargs::getDefinition());
$core = new Dispatcher($definition);

$router = $core->getRouter();
$router->get('/user/{id:\d+}', 'Target@index');  // 继承了 Delay 组件的特性

$app = new Application($core);
$app->addMiddleware(new EndOutputBuffer());

$app->handle(new ServerRequest('GET', '/user/12'));
```

参数 `$middlewares` 是针对一个路由的中间件列表，与全局中间件处于不同的层面，添加一个中间件也可以使用连贯方法 `addMiddleware`.
```php
$router->get('/user/{id:\d+}', 'Target@index')->addMiddleware($middleware);
```

参数 `$name` 是本条路由的名称，你可以利用路由名称获取该路由所对应的 URL, 也可以使用连贯方法 `setName` 设置路由名称：
```php
$router->get('/user/{id:\d+}', 'Target@index')->setName('user.id');

$routeService = $router->getRouteService();
$url = $routeService->urlFor('user.id', ['id' => 10], ['age' => 18]);
echo $url;  // /user/10?age=18
```

## Delay 与 Dispatcher 的组合比较常见
Dispatcher 需要绑定多个处理程序（Handler），如果你使用类方法作为 Handler，那么，多个 PHP 类的初始化就会造成一定的资源浪费，这时，Delay 组件的作用就体现了出来，它可以将对象初始化的工作推迟到匹配成功以后进行，这在很大程度上缓解了系统压力，所以，Delay 与 Dispatcher 的组合是比较常见的，也符合我们熟知的大部分传统框架的做法。但你也许会选择 在路由中嵌入闭包 的形式，这在某些场景下也是比较实用的设计。
