# Quy ước code

Nguồn sự thật về style/naming. `CLAUDE.md` chỉ trỏ tới đây.
Sửa quy ước → sửa file tương ứng trong cùng MR.

## Luật bắt buộc

1. Import khác thư mục qua alias `@/...`, cùng thư mục `./`, không bao giờ `../` — [code-style § Import](code-style.md#import).
2. Comment 100% tiếng Việt, luôn `/** */` nhiều dòng; message (lỗi/log/response) tiếng Anh — [code-style § Comment](code-style.md#comment), [§ Message](code-style.md#message).
3. Hàm có thể fail trả `T | BadAction`, không `try/catch` (trừ boundary thư viện ngoài); mặc định `async/await`, không `.then`/`.catch` cho kết quả `T | BadAction` — [code-style § BadAction](code-style.md#xử-lý-lỗi--badaction-thay-vì-trycatch).
4. `if` luôn đủ khối, return sớm, 1 dòng trống giữa các block — [code-style § Control flow](code-style.md#control-flow).
5. File/thư mục kebab-case, không dấu chấm thừa; function là arrow function; `export const` — [naming](naming.md).
6. `npm run lint` + `npm run format:check` sạch trước khi commit (không dấu chấm phẩy) — [code-style § Format & lint](code-style.md#format--lint--prettier--eslint).

## File chi tiết

| File                                                                               | Nội dung                                                                     |
| ---------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [code-style.md](code-style.md)                                                     | Import alias `@`, comment, message, async/promise, `BadAction`, control flow |
| [naming.md](naming.md)                                                             | Tên biến, file, thư mục, class, function                                     |
| [domain-driven-design-pattern/](domain-driven-design-pattern/README.md)            | DDD + entity / data / action / repository pattern                            |
| [api-convention/controller-convention.md](api-convention/controller-convention.md) | Route khai phẳng, controller index/show/store/update/destroy, response       |
| [console-command.md](console-command.md)                                           | CLI Commander: entry, provider, exit code, command mỏng                      |
