# Controller & route

Ví dụ thật: `interfaces/admin-api/routes/api.ts` +
`interfaces/admin-api/controllers/user/user-controller.ts`.

## Casing — camelCase toàn bộ

Dùng **camelCase** cho request (body, query: `perPage`), response (`createdAt`, `currentPage`) và cả
tên cột DB (`userId`, `createdAt`). Một kiểu tên xuyên suốt từ DB tới client nên không có bước đổi
case nào ở giữa.

## Route — khai phẳng trong `routes/api.ts`

Mỗi route 1 dòng, đường dẫn đầy đủ, trỏ vào method controller. Không tách router con theo domain —
mở 1 file là thấy toàn bộ endpoint của kênh.

```ts
adminApiRouter.get('/users', userController.index)
adminApiRouter.get('/users/:id', userController.show)
adminApiRouter.post('/users', userController.store)
adminApiRouter.put('/users/:id', userController.update)
adminApiRouter.delete('/users/:id', userController.destroy)
```

## Controller — class + instance export

- `export class XController` với method arrow theo tên REST resource: `index` (GET danh sách),
  `show` (GET 1), `store` (POST), `update` (PUT), `destroy` (DELETE). Cuối file `export const xController = new XController()`.
- **Đọc** qua repository, **ghi** qua Action — controller không gọi `entity.save()`.
- `private findX(id)` trả `X | BadAction` (404 `'X not found'`) — dùng chung cho
  `show` / `update` / `destroy`, rồi truyền **instance** vào Action.
- `private getResource(x)` map entity → JSON (qua getter), **camelCase**, không lộ field nhạy
  cảm (`password`). Kiểu trả về khai rõ (`XResource`).
- Lỗi: `if (BadAction.isError(result)) { return result.toResponse(res) }`.
- Method controller là `async` + `await` ([code-style § Async](../code-style.md#async--promise)) — không
  `.then` / `.catch`; lỗi bất ngờ để Express 5 chuyển sang `errorHandler`.

## Response

| Method    | Thành công                                                                                        |
| --------- | ------------------------------------------------------------------------------------------------- |
| `index`   | `{ data: XResource[], currentPage, perPage, lastPage, total }` — query `page`, `perPage` + filter |
| `show`    | `XResource`                                                                                       |
| `store`   | `XResource` (entity vừa tạo)                                                                      |
| `update`  | `XResource` (entity sau khi cập nhật)                                                             |
| `destroy` | `true`                                                                                            |
| Lỗi       | `result.toResponse(res)` → `{ message, errors }` + status của `BadAction`                         |

`index` truyền thẳng query string xuống repository:

```ts
const args: Partial<UserQueryOptions> = { ...req.query, with: ['posts'] }

const result = await userRepository.paginate(args, req.query.perPage, req.query.page)
```

- `query()` của repository chỉ đọc key filter nó biết (`email`…) — key lạ trong query string bị bỏ
  qua.
- `paginate` tự đổi `perPage` / `page` sang số; không hợp lệ thì về 15 / 1.
- Quan hệ cần trả kèm (vd. `with: ['posts']`) do controller gắn thêm vào `args`, không để client tự
  chọn.

## Checklist controller mới

- [ ] Class + `export const xController = new XController()`.
- [ ] Route khai phẳng trong `routes/api.ts`.
- [ ] `findX` + `getResource` private; resource camelCase, không lộ field nhạy cảm.
- [ ] Ghi qua Action, đọc qua repository.
