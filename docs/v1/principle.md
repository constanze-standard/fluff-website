---
title: 工作原理
---
本章将像你展示 Fluff 是如何工作的，通过了解 Fluff 的工作原理可以帮助你更加充分的利用 Fluff，也能够让你在开发过程中少走弯路。

## 请求周期
一次请求的生命周期很简单，如下图所示：

![Fluff 生命周期](/fluff-website/docs/v1/images/fluff-working.png)（图 1）

首先是中间件构建器将多个`中间件(Middleware)`整合为一个栈结构的处理程序，然后请求实例从外到内逐一通过中间件，最后交由请求处理程序(`Request Handler`)，也就是 Fluff 的核心进行处理并创建一个 `Response` 实例，之后，经过中间件组的回溯处理，返回最终的 `Response`。

## 框架的核心
`Request Handler` 即是整个框架的核心，它决定了框架处理业务逻辑的方式，以及框架所支持的架构模式。FLuff 的核心是以组件形式提供的，它们可以相互组合构成不同风格的 `Request Handler`，如下图所示：

![Fluff 核心](/fluff-website/docs/v1/images/core.png)（图 2）

Fluff 提供的 `Request Handler` 组件中，包括了一些基本元件，它们可以独立的作为核心激活 `Application`，而另外一些则需要与其他 `Request Handler` 组件配合使用，以继承它们的行为，实现可变的架构风格。

## 关于中间件
如图一所示，`中间件`是包裹在 `Request Handler` 外层的全局组件，而我们在路由章节还会看到一种针对某种请求的私有中间件，与全局中间件相似，但私有中间件属于 `Dispacher Request Handler` 的一部分，它与全局中间件处于不同的层面。

另外，全局中间件是一种重要的扩展应用程序的方式，Fluff 的 response 输出、异常捕获等功能都是以中间件的形式提供的。
