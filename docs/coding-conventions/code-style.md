# Code style

## Format & lint — Prettier + ESLint

Format do **Prettier** lo (`.prettierrc.json`): **không dấu chấm phẩy**, nháy đơn, trailing
comma `all`, `printWidth` 100, indent 2 space. Không tự căn chỉnh tay — chạy `npm run format`.

Bẫy ASI (dòng bắt đầu bằng `(`, `[` hoặc template string bị nối vào dòng trước) do Prettier tự chèn
`;` ở đầu dòng đó — không cần tự xử lý, chỉ cần chạy `npm run format`.

**ESLint** (`eslint.config.mjs`) = `@eslint/js` + `typescript-eslint` recommended +
`eslint-config-prettier`, cộng các rule ép luật trong tài liệu này:

| Rule                                                                          | Luật                                                         |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `no-restricted-imports` (`../*`)                                              | [Import](#import) — không `../`                              |
| `curly: all`                                                                  | [Control flow](#control-flow) — `if` luôn đủ khối            |
| `func-style: expression`, `prefer-arrow-callback`, chặn `function` expression | [naming](naming.md) — arrow function                         |
| `no-restricted-exports` (default)                                             | [naming](naming.md) — `export const`, không `export default` |
| `eqeqeq`                                                                      | Luôn `===` / `!==`                                           |

Comment `/** */` tiếng Việt, message tiếng Anh, `BadAction`, dòng trống giữa block: ESLint không
kiểm được — tự tuân theo khi viết/review.

TypeScript giữ ở `~6.0`: TypeScript 7 không còn JS API nên `typescript-eslint` chưa hỗ trợ
(peer `<6.1`). Nâng TS khi `typescript-eslint` hỗ trợ.

## Import

- Alias **`@`** trỏ tới root dự án (`src/`) — dùng cho mọi import ngoài thư mục hiện tại.
- Trong cùng thư mục thì import tương đối bằng `./` (vd. `./types`, `./registry`).
- **Không** dùng import tương đối leo thang `../` dưới bất kỳ hình thức nào (`../foo`, `../../foo`, ...). Import khác thư mục luôn phải qua `@/...`.

  ```ts
  // Đúng — khác thư mục, qua alias
  import { resolveNavigationData } from '@/sections/navigation.section'

  // Đúng — cùng thư mục
  import type { SectionDataResolver } from './types'

  // Sai — leo thang tương đối
  import { NAVIGATION_SECTION_TYPE } from '../config/constants'
  ```

## Comment

- 100% comment trong code viết bằng **Tiếng Việt**.
- Luôn dùng cú pháp comment **nhiều dòng** (`/** ... */`), **không** dùng `//`.
- Comment thường — có 1 dòng trống phía trước, đặt ngay trên đoạn code liên quan:

  ```ts
  /**
   * Nội dung...
   */
  ```

- Comment cần nhấn mạnh/tập trung cao (quyết định quan trọng, cảnh báo, phần dễ gây nhầm lẫn) — thêm khối tiêu đề phân cách:

  ```ts
  /**
   * ----------------------------
   * Tiêu đề...
   * ----------------------------
   * Giải thích thêm...
   */
  ```

## Message

- Mọi **message** — chuỗi string dùng làm nội dung lỗi/log/response/validation (tham số truyền vào `Error(...)`, `BadAction.fromString(...)`, `console.log(...)`, message trả về client...) — phải viết bằng **Tiếng Anh**.
- **Comment không phải message** — comment vẫn giữ nguyên 100% Tiếng Việt theo mục Comment ở trên, quy tắc này không thay đổi điều đó.

  ```ts
  // Đúng
  return BadAction.fromString('User not found', {}, 404)

  // Sai
  return BadAction.fromString('Không tìm thấy người dùng', {}, 404)
  ```

## Async / Promise

- Mặc định dùng **`async/await`** — kể cả khi chỉ có 1 thao tác bất đồng bộ. Kết quả `T | BadAction`
  không bao giờ reject nên không cần `.catch`; `await` rồi `BadAction.isError` cho code phẳng:

  ```ts
  // Đúng
  const user = await userRepository.find(id)

  if (BadAction.isError(user)) {
    return user.toResponse(res)
  }

  // Sai — promise chain cho kết quả T | BadAction
  return userRepository.find(id).then((user) => {
    /* … */
  })
  ```

- **Promise chain** (`.catch`) chỉ dùng ở **boundary** — nơi bắt throw của thư viện ngoài và đổi
  thành `BadAction` (`catchDbError`, method `validate` của Action bọc Vine).
- **Không** `.catch` cho promise trả `T | BadAction`, **không** `throw` / `reject` một `BadAction`.
  Lỗi bất ngờ (bug) để Express 5 chuyển sang `errorHandler` — controller phải là hàm `async` (hoặc
  `return` promise), không thì lỗi thành unhandled rejection và request bị treo.

## Xử lý lỗi — `BadAction` thay vì `try/catch`

- Không dùng `try/catch` để xử lý lỗi nghiệp vụ — nhánh `catch` giấu luồng điều khiển khỏi chỗ đọc chính, đọc code giống `goto` trong C.
- Hàm có thể fail thì **return** `T | BadAction` thay vì `throw`; nơi gọi check `BadAction.isError(result)` rồi `return` sớm — không `catch`.
- Implement dùng chung tại `src/infras/errors/bad-action.ts` — class `BadAction` (`message`, `errorDetails`, `statusCode`) + static `BadAction.fromString(...)`, `BadAction.isError(x)`, và `x.toResponse(res)` trả JSON lỗi ở controller.
- Compose nhiều bước: hàm gọi hàm khác cũng trả `T | BadAction`, chỉ cần `return` thẳng kết quả lỗi nhận được — không cần unwrap/rethrow.
- Ngoại lệ hợp lệ duy nhất: **boundary** — nơi bắt buộc nhận exception ném ra từ thư viện ngoài (Sequelize, Vine, `node:crypto`, `fetch`, `JSON.parse`) — convert throw đó thành `BadAction` **ngay tại chỗ**, không để try/catch lan ra xa hơn 1 lớp.

## Control flow

- Không viết `if` một dòng. Luôn viết đủ khối, kể cả khi thân chỉ có 1 câu lệnh:

  ```ts
  // Đúng
  if (condition) {
    return
  }

  // Sai
  if (condition) return
  ```

- Áp dụng triệt để **return sớm** (early return) — điều kiện chỉ để loại trừ case không cần xử lý tiếp
  thì `return` luôn, không lồng "happy path" vào bên trong `if`:

  ```ts
  // Đúng
  const findUser = async (id: number): Promise<User | BadAction> => {
    const user = await userRepository.find(id)

    if (BadAction.isError(user)) {
      return user
    }

    if (!user) {
      return BadAction.fromString('User not found', {}, 404)
    }

    return user
  }

  // Sai — happy path lồng trong `if`
  const findUser = async (id: number): Promise<User | BadAction> => {
    const user = await userRepository.find(id)

    if (!BadAction.isError(user)) {
      if (user) {
        return user
      }
      return BadAction.fromString('User not found', {}, 404)
    }
    return user
  }
  ```

- Cần **1 dòng trống** ngăn cách các block code khác nhau trong 1 function/method (guard clause, đoạn
  xử lý chính, câu lệnh return cuối, ...) — không viết liền các block sát nhau dù mỗi block chỉ vài
  dòng. Statement lặp lại cùng 1 loại (vd. chuỗi `user.setX(...)` liên tiếp) coi là 1 block, không
  cần tách blank line giữa các dòng đó. Ví dụ đúng/sai: xem `findUser` ở trên.
