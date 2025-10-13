# Lafayette Active Club 活动统计脚本

## 安装依赖

```bash
npm install
```

## 使用方法

1. 配置 `config.ts` 中的微信凭证（只需配置一次）：

   - `wxOpenId` - 微信 OpenID
   - `wxUnionId` - 微信 UnionID

2. 运行脚本：

```bash
npm start
```

或直接使用 ts-node：

```bash
npx ts-node fetch-activities.ts
```

## 功能特性

- ✅ 自动登录获取 Token
- ✅ Token 本地缓存，避免频繁登录
- ✅ Token 过期自动刷新（提前 5 分钟）
- ✅ 支持多分组活动人数统计
- ✅ 自动识别活动类型和 emoji
- ✅ 按日期分组格式化输出
- ✅ 时间显示 AM/PM 格式

## 输出

脚本会生成一个以当前时间命名的 txt 文件，格式为：`年份日期时间.txt`

例如：`20251013143025.txt`（2025 年 10 月 13 日 14 点 30 分 25 秒）

## 文件说明

- `config.ts` - 微信凭证配置文件（只需配置一次，不会过期）
- `fetch-activities.ts` - 主脚本文件
- `.token_cache.json` - Token 缓存文件（自动生成，已加入 .gitignore）
- `package.json` - 项目依赖配置
- `tsconfig.json` - TypeScript 配置
