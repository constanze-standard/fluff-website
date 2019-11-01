---
title: 依赖注入模式：DI
---

依赖注入是一种比较流行的控制反转解决方案，我们可以利用专门的 `DI Request Handler` 组件来实现依赖注入。

`Di` 依赖于 PSR-11 标准容器，所以，在示例开始之前，你需要首先了解[容器](https://www.php-fig.org/psr/psr-11/)的概念。你可以选择使用你熟悉的容器组件，但本教程中使用的组件是：[`constanze-standard/container`](https://github.com/constanze-standard/container)，你可以使用以下命令安装：
```sh
composer require constanze-standard/container
```

## 依赖项与服务
依赖项是依赖注入的源数据，可以是任何类型，在 `Di` 组件中，依赖注入的形式是将依赖项与对应的方法参数进行绑定（或赋值），一旦这种绑定被完成，即代表注入成功。

服务是一种特殊的`依赖项`，形式上，它必须是一个对象 (object)；行为上，它应该对某种业务或具有相关性的一系列功能进行封装。`Di` 组件可以通过不同方式，向程序中注入服务或普通依赖项。

## 一个 Demo
了解了依赖注入的概念，下面使用 `Di` 组件实现一个依赖注入的 Demo。首先，我们需要一个“目标程序”，我们将下面这个 Target 类作为依赖注入的目标：
```php
use ConstanzeStandard\DI\Annotation\Params;
use ConstanzeStandard\DI\Annotation\Property;
use Psr\Http\Message\ResponseInterface;

class Target
{
    /**
     * @Params(
     *   speaker = "speaker",
     *   userName = "user_name"
     * )
     */
    public function say($speaker, $userName, $words): ResponseInterface
    {
        return $speaker->speak($userName. ': '. $words);
    }
}
```

这个目标类的功能很简单，就是调用一个名为 `speaker` 的服务，让某人说一句话。但我们希望将方法调用的工作移交给 `Di` 组件，以达控制反转的目的，所以这个 Target 的依赖项为：一个用来输出的 speaker 服务，一个说话的人(`$userName`), 和一句话(`$words`)。

首先我们来实现 speaker 类：
```php
use Nyholm\Psr7\Response;

class Speaker
{
    public function speak($words)
    {
        return new Response(200, [], $words);
    }
}
```

然后，我们需要将依赖项保存到容器中，在 Target 类中，我们用注释标注了两个依赖项，所以我们将对应的依赖项加入到容器中：
```php
use ConstanzeStandard\Container\Container;

$container = new Container();
$container->add('speaker', new Speaker());
$container->add('user_name', 'Alex');
```

现在我们可以将 Target 类传入 Di 组件作为核心，创建应用了：
```php
use ConstanzeStandard\Fluff\Application;
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;
use ConstanzeStandard\Fluff\RequestHandler\DI;
use Nyholm\Psr7\ServerRequest;

$callable = [new Target(), 'say'];
$core = new Di($container, $callable, ['How do you do?']);
$app = new Application($core);
$app->addMiddleware(new EndOutputBuffer());

$request = new ServerRequest('GET', '');
$app->handle($request);
// 输出： Alex: How do you do?
```
`Di` 有4个初始化参数，分别为：
1. `$container`：是实现了 `Psr\Container\ContainerInterface` 的容器实例，Di 组件的内部使用容器进行依赖查找，然后将依赖项注入。
2. `$handler`：是一个 callable 对象，它负责返回 response 对象，也是依赖注入的目标。
3. `$arguments`: 数组类型，是向 `$handler` 传入的额外参数的`参数列表`，下面是一个例子：
```php
new Di($container, function($name, $age, $sax = '男') {
    ...
}, ['age' => 20, 'Alex']);
// 传入的参数：'Alex', 20, '男'
```
从上例中可以比较清楚的理解传参规则，默认情况下，如果数组的键是字符串的话，则会优先与同名参数进行绑定；如果有剩余的、未声明类型的未绑定参数，则从普通的以数字为键的参数中补全；如果参数有默认值，就必须指定同名的数组键，否则将保持默认值，而不会从参数列表中补全。
4. `$manager`：是一个可选的帮助调用和注入的管理工具，如果不传入，则 Di 组件将会使用默认的管理组件 `constanze-standard/di`。这个组件有可能改变 Di 的行为，请在完全了解内部运行机制的情况下再考虑替换。

### 类型提示注入
我们已经了解了两种参数注入方法，分别是：注解法(Annotation) 和参数列表法。还有一种针对服务的注入方法：`类型提示法(type-hint)`，以参数的类型名称进行依赖注入：
```php
use ConstanzeStandard\Container\Container;

$container = new Container();
$container->add(Speaker::class, new Speaker());

$core = new Di($container, function(Speaker $speaker) {
    return $speaker->speak('Hello!');
});
```
这种注入方法限定了参数类型，从而在解除耦合的同时，保持了程序的健壮性。`类型提示法`的优先级排在“以字符串为键的参数列表项”之后。

我们上面所说的几种参数注入方法可以混用，只要注意优先级顺序即可。关于注解类的使用，默认情况下，我们在内部引用了 [`doctrine/annotations`](https://www.doctrine-project.org/projects/doctrine-annotations/en/latest/index.html) 组件，其特性与 Annotations 组件一致。
