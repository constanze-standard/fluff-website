---
title: 输出缓冲区
---

Fluff 不会替你做出多余的决定，所以，在默认情况下，返回的 Response 不会被输出，如果你希望在 Response 返回的同时将内容输出，则需要使用本章介绍的中间件：`\ConstanzeStandard\Fluff\Middleware\EndOutputBuffer`.

## 输出 Response 的内容
我们利用 `EndOutputBuffer` 中间件输出 Response 实例的内容，该中间件一般情况下，应该添加在应用的最外层：
```php
use ConstanzeStandard\Fluff\Middleware\EndOutputBuffer;

$app->addMiddleware(new EndOutputBuffer());
```
`EndOutputBuffer` 会关闭缓冲区，并且会冲刷掉带有 `flushable` 标志的输出缓冲区，或清空带有 `cleanable` 标志的输出缓冲区，最终将所有缓冲区关闭。
