---
title: 基本模式
---

Fluff 有两种基本的 `Request Handler`，它们的功能比较简单，且运行速度相对较快。两个组件都接受一个可调用对象作为业务逻辑的载体，并向该对象传入 request 对象和用户提供的额外参数。

## 数组传参模式：Args
核心组件 Args，通过数组的形式向业务程序传递参数：
```php
use ConstanzeStandard\Fluff\RequestHandler\Args;
use Psr\Http\Message\ServerRequestInterface;
use Nyholm\Psr7\Response;
use Nyholm\Psr7\ServerRequest;

$core = new Args(function(ServerRequestInterface $request, $args) {
    return new Response(
        200, [], 'Hello '. $args['name']
    );
}, ['name' => 'Alex']);

$app = new Application($core);

$request = new ServerRequest('GET', '/user/asd');
$response = $app->handle($request);

echo $response->getBody()->getContents();  // Hello Alex
```
`Args` 有两个初始化参数：
- `$handler`：callable 类型，负责生成 Response 对象的程序。这个可调用对象接受的第一个参数永远是一个 `Psr\Http\Message\ServerRequestInterface` 实例，第二个参数为用户传递的额外参数。$handler 必须返回一个 `Psr\Http\Message\ResponseInterface` 的实例。
- `$args`: array 类型，你可以通过这个参数，向 `$handler` 传入一个数组作为 `$handler` 的第二个参数。

## 顺序传参模式：Vargs
核心组件 Vargs，与 Args 的形式相似，但 `$handler` 接受任意个参数，额外的参数会按顺序以独立参数的形式传递。
```php
use ConstanzeStandard\Fluff\RequestHandler\Args;
use Psr\Http\Message\ServerRequestInterface;
use Nyholm\Psr7\Response;
use Nyholm\Psr7\ServerRequest;

$core = new Args(function(ServerRequestInterface $request, $say, $name) {
    return new Response(
        200, [], $say . $name
    );
}, ['Hello', 'Alex']);

$app = new Application($core);

$request = new ServerRequest('GET', '/user/asd');
$response = $app->handle($request);

echo $response->getBody()->getContents();  // Hello Alex
```
