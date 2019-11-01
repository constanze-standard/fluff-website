---
title: 延迟策略模式：Delay
---

我们前面看到了几种 `Request Handler`, 它们都可以接受一个可调用对象作为业务逻辑的载体，如果你希望将这个可调用对象的初始化延迟（或者说，让框架在适当的时候自动做初始化），则可以考虑使用本章介绍的 `Delay` 组件。

## Request Handler 的 Definition（定义）
`Definition（定义）`是指一个可以生成 Request Handler 的可调用对象，这个对象只有两个参数：一个是 `$handler` 就是上面说到的，业务逻辑的载体；另一个是 `$arguments`，是由用户提供的额外参数列表。当这个对象被调用时，在内部初始化 Request Handler 并返回。一些 Request Handler 中已经包含了 `Definition`，只要调用 `getDefinition` 方法获取即可。

这一概念的目的是帮助其他程序复用已有的 Request Handler 的功能，继承它们的特性，大部分情况下，使用者并不会涉及到编写一个 Definition，但了解它的作用对接下来的学习有所帮助。

## 如何初始化一个对象
延迟策略实际上是预定义一个生成可调用对象的过程，将这一过程推迟到第一次调用 `Request Handler` 时进行。所以一个延迟策略包含：
1. 一个初始化策略，用来根据解析后得到的`类名称`和`方法名称`生成 `callable` 对象。
2. 一个调用策略，用来以某种方式调用这个生成的可调用对象。

下面的 demo 将运用 `Delay` 组件实现延迟策略，这里我们首先定义一个类：`Target`，我们将对它进行延迟初始化处理：
```php
use Nyholm\Psr7\Response;
use Psr\Http\Message\ResponseInterface;

class Target
{
    public function __construct($userName)
    {
        $this->userName = $userName;
    }

    public function say($request, $words): ResponseInterface
    {
        return new Response(200, [], $this->userName. ': '. $words);
    }
}
```
我们的目的是调用 `Target::say` 方法，得到生成的 response 对象。首先要考虑如何将类转化为 `callable` 对象，这里我计划将 `userName` 直接传递给构造方法，所以定义了一个闭包作为`初始化策略`，代码如下：
```php
$strategy = function($className, $method) {
    return [
        new $className('Alex'),
        $method
    ];
};
```
然后，我们观察 `Target::say` 方法，这个方法接受一个字符串，并直接使用，所以我们可以选择使用 `Vargs` 这一 `Request Handler` 作为`调用策略`，我们只需要将 `Vargs` 的 `Definition` 和额外的参数（这里是 `$word`）的值一并传入 `Delay` 组件即可完成构建：
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\RequestHandler\Delay;
use ConstanzeStandard\Fluff\RequestHandler\Vargs;
use Nyholm\Psr7\ServerRequest;

$core = new Delay($strategy, Vargs::getDefinition(), 'Target@say', ['Hello!']);
$app = new Application($core);
$app->addMiddleware(new EndOutputBuffer());

$request = new ServerRequest('GET', '');
$app->handle($request);
```
我们可以看到，`Delay` 组件也是一个 `Request Handler`，只是它在内部与其他 Handler 通过 Definition 做了关联。

## Delay 与 Args/Vargs 的组合
上面的 demo 中，我们已经使用了 `Vargs` 作为调用策略，我们看到，Delay 在调用时，与 Vargs 组件具有相同的行为。对于其他 `Request Handler` 组件来说也是如此，当我们选用 Args 时，传递额外参数的方式就变成了数组的形式：
```php
use ConstanzeStandard\Fluff\RequestHandler\Args;
...

class Target
{
    ...

    public function say($request, $args): ResponseInterface
    {
        return new Response(200, [], $this->userName. ': '. $args['words']);
    }
}

...

$core = new Delay($strategy, Args::getDefinition(), 'Target@say', ['Hello!']);
...
```

## Delay 与 Di 的组合
当使用 `Di` 作为`调用策略`时，被调用的方法也会支持依赖注入，方法调用的特性与 `Di` 组件完全一致：
```php
use ConstanzeStandard\Container\Container;
use ConstanzeStandard\DI\Annotation\Params;
use ConstanzeStandard\Fluff\RequestHandler\Di;
...

class Target
{
    ...

    /**
     * @Params(words = "words")
     */
    public function say($words): ResponseInterface
    {
        return new Response(200, [], $this->userName. ': '. $words);
    }
}

$container = new Container();
$container->add('words', 'Hello!');

$definition = Di::getDefinition($container);
$core = new Delay($strategy, $definition, 'Target@say');

...
```

## 利用 Delay 和容器实现控制反转
`依赖查找`是一种比较常见的控制反转模式，它相比近年来流行的依赖注入，拥有更好的性能，并且构建简单，适用于中小型项目。我们利用 Delay 组件和 PSR container 即可实现这种模式。
```php
use ConstanzeStandard\Container\Container;
use ConstanzeStandard\Fluff\RequestHandler\Args;
use ConstanzeStandard\Fluff\RequestHandler\Delay;

$container = new Container();
$container->add('serviceName', new SomeService());

$strategy = function($className, $method) use ($container) {
    $instance = new $className($container);
    return [$instance, $method];
};

$core = new Delay($strategy, Args::getDefinition(), 'Target@say');
...
```
我们在 Target 类初始化时传入 Container 对象，然后可以在类的内部进行依赖查找：
```php
use Psr\Container\ContainerInterface;

class Target
{
    public function __construct(ContainerInterface $container)
    {
        $this->container = $container;
    }

    public function index()
    {
        $service = $this->container->get('serviceName');
    }
}
```
当然，也可以利用下面将要学到的`类属性注入`的方式，直接将 container 注入进来，这取决于你对系统复杂度和性能的计划和权衡。

## 支持依赖注入的初始化策略
Di 组件能够进行依赖注入，取决于其中的一个组件：`\ConstanzeStandard\DI\Manager`, 这个组件封装了一系列有关依赖注入的方法，`Di` 也将这一组件解耦出来，使你可以从外界传入，以便能够作用于架构的其他部分，或进行功能上的自定义。

现在我们有了一个新的计划，就是在初始化时，对类的构造方法进行依赖注入。针对这个问题，我们利用 `Delay`、`Di` 与 `Manager` 组件进行配合，就可以达到目的。

首先提取 Manager 组件，让它参与到对象初始化的策略中：
```php
use ConstanzeStandard\Container\Container;
use ConstanzeStandard\DI\Manager;
use ConstanzeStandard\Fluff\RequestHandler\Di;

$container = new Container();
$manager = new Manager($container);

$strategy = function($className, $method) use ($manager) {
    $instance = $manager->instance($className, ['userName' => 'Alex']);
    return [$instance, $method];
};

$definition = Di::getDefinition($container, $manager);
$core = new Delay($strategy, $definition, 'Target@say');

...
```
我们利用 `Manager::instance` 方法对类进行初始化，这样，Target 的构造方法也可以像普通方法一样支持依赖注入了。

## 对类属性进行依赖注入
`\ConstanzeStandard\DI\Manager` 允许对类的属性进行依赖注入：
```php
use ConstanzeStandard\DI\Annotation\Property;

class Target
{
    /**
     * @Property("service")
     */
    private $service;

}
```
如上例所示，我们期望将名为`service` 的数据注入到 `Target` 的 `service` 属性中，所以我们首先用 `ConstanzeStandard\DI\Annotation\Property` 注解类标注 `service` 属性，然后在 `Delay` 的初始化策略中调用 `Manager::resolvePropertyAnnotation` 方法：
```php
...

$strategy = function($className, $method) use ($manager) {
    $instance = $manager->instance($className, []);
    $manager->resolvePropertyAnnotation($instance);  // 类属性注入
    return [$instance, $method];
};
...
```
这样，当 Target 类初始化完毕时，被标注的属性也同时完成了依赖注入。

有关依赖注入管理器 `ConstanzeStandard\DI\Manager`，更详细的资料，包括参数列表和 Annotations 缓存的使用方法，请参阅 `constanze-standard/di` 的[官方文档](https://constanze-standard.github.io/di/)（推荐！使用 Annotations 最好开启缓存，否则消耗较大）。
