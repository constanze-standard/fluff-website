---
title: 将错误转化为异常
---

`ExceptionCaptor` 只适合捕获异常，如果想捕获 `Error`，我们可以将 `Error` 转化为 `Exception`. 这段程序由 [php manual](https://www.php.net/manual/en/class.errorexception.php#errorexception.examples) 提供。

```php
use ErrorException;

set_error_handler(function ($severity, $message, $file, $line) {
    if (!(error_reporting() & $severity)) {
       // This error code is not included in error_reporting
       return;
    }
    throw new ErrorException($message, 0, $severity, $file, $line);
});
```
将这段程序添加在你的入口文件，或 `bootstrap` 文件内，即可将程序中出现的 `Error` 转化为 `Exception`.
