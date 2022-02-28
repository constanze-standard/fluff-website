---
title: 快速上手
---

让我们从一个超小的应用程序入手，对 Fluff 的概念做一个基本介绍。我们的目标很简单，实现一个在网络上流传已久的“价值过亿的人工智能程序”。

## 前期准备
这个应用需要从环境中构建一个 PSR-7 Server Request 作为请求的载体，所以开始之前，我们首先用 nyholm/psr7-server 组件来生成这个 request 对象.
```php
use Nyholm\Psr7\Factory\Psr17Factory;
use Nyholm\Psr7Server\ServerRequestCreator;
use Psr\Http\Message\ServerRequestInterface;

$psr17Factory = new Psr17Factory();
$creator = new ServerRequestCreator(
    $psr17Factory,
    $psr17Factory,
    $psr17Factory,
    $psr17Factory
);
/** @var ServerRequestInterface $request */
$request = $creator->fromGlobals();
```

## 进入正题
OK, 准备工作结束，进入正题！我们要实现的是一个对话程序，它可以智能的回答用户的任何提问。首先，我们向 `request handler` 传入一个 callable 类型的对象作为主要的逻辑处理程序。
```php
# index.php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\RequestHandler\Args;
use Psr\Http\Message\ServerRequestInterface;
use Nyholm\Psr7\Response;

$core = new Args(function(ServerRequestInterface $request) {
    $queryParams = $request->getQueryParams();
    $words = $queryParams['words'];

    $words = str_replace(
        ['吗', '?', '？'],
        ['', '!', '！'],
        $words
    );
    return new Response(200, ['Content-Type' => 'text/plain'], $words);
});

$app = new Application($core);
$app->handle($request);
```
`request handler` 是 Fluff 的核心，它承载了一个请求的主要逻辑（包括请求处理和业务逻辑）Fluff 提供了多种 `request handler`，通过将不同的 `request handler` 进行组合，可以衍生出多种架构模式。以上我们使用了一个基本的、单一的 request handler: `Args`.

恭喜你！现在，你已经完成了人工智能部分的全部逻辑，让我们访问 [http://127.0.0.1:8080?words=在吗？](http://127.0.0.1:8080?words=在吗？) 看看效果！

<p class="blockquote">“哦？怎么会？只出现了一个空白页面......”</p>

这并不是 bug 哦~ 只是因为我们没有输出 `Response`. 是的，这与我们以往使用的框架不同，想要输出 response，我们就需要找到作用于`输出缓冲区(Output Buffer)` 的中间件 `EndOutputBuffer`, 将这个中间件添加到 `Application` 中。让我们来重构这段代码：
```php
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;

...
$app = new Application($core);
$app->addMiddleware(new EndOutputBuffer());

$app->handle($request);
```
`EndOutputBuffer` 的职责是关闭缓冲区，并且会冲刷掉带有 `flushable` 标志的输出缓冲区，或清空带有 `cleanable` 标志的输出缓冲区，最终将所有缓冲区关闭。

现在，我们再来访问一次 [http://127.0.0.1:8080?words=在吗？](http://127.0.0.1:8080?words=在吗？)

```sh
在！
```

## 添加中间件
上面的例子中有一个不合理的地方，就是如果我们没有传入 `words` 参数，程序就会崩溃，于是我们决定添加一个验证 GET 请求参数的`中间件(Middleware)`。Fluff 的中间件系统符合 `PSR-15` 的标准，你的中间件也必须实现 `\Psr\Http\Server\MiddlewareInterface` 接口。

下面，我们来实现这个验证请求的中间件，如果请求没有传递 `words` 参数，则直接返回 `400 Bad Request` 响应。

```php
use Nyholm\Psr7\Response;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Server\MiddlewareInterface;
use Psr\Http\Server\RequestHandlerInterface;

class VerificationMiddleware implements MiddlewareInterface
{
    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $queryParams = $request->getQueryParams();
        if (array_key_exists('words', $queryParams)) {
            return $handler->handle($request);
        }
        return new Response(400);
    }
}
```
这个中间件应该放在 `EndOutputBuffer` 的里层，因为 `VerificationMiddleware` 需要通过下一层的 `EndOutputBuffer` 输出响应。在代码中，应该在 `EndOutputBuffer` 之前添加。

```php
...
$app = new Application($core);

$app->addMiddleware(new VerificationMiddleware());
$app->addMiddleware(new EndOutputBuffer());

$app->handle($request);
```

我们再来做一下测试，访问 [http://127.0.0.1:8080](http://127.0.0.1:8080), 是不是出现了 400 Bad Request 的响应呢 :)

到现在，这个最小化应用已经完成了。对于使用者来说，选择何种 request handler, 将决定后续的开发模式，甚至影响代码的风格。而功能的扩展，则很大程度上取决于`中间件(Middleware)`的使用。这些组件的使用和搭配，我们将在接下来的几章逐一介绍。
