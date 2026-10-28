# Domain-driven design — patterns

Tổng quan kiến trúc: [domain-driven-design.md](domain-driven-design.md).

| File                                               | Nội dung                                                                              |
| -------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [domain-driven-design.md](domain-driven-design.md) | Tách `infras/` / `domains/` / `interfaces/`, phụ thuộc một chiều                      |
| [entity-pattern.md](entity-pattern.md)             | Sequelize model (Active Record) — đọc qua repository, ghi chỉ trong Action            |
| [data-pattern.md](data-pattern.md)                 | DTO input cho Action; Create vs Update (`undefined` = không gửi, `null` = xoá)        |
| [action-pattern.md](action-pattern.md)             | `make` + `execute` trả `T \| BadAction`; mọi ghi qua Action                           |
| [repository-pattern.md](repository-pattern.md)     | Query tập trung của entity — `extends PostgresRepository`, chỉ khai `model` + `query` |
