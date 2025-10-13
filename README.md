# Lafayette Active Club 活动统计脚本

## 安装依赖

```bash
npm install
```

## 本地使用

1. 复制 `.env.example` 为 `.env`：
   ```bash
   cp .env.example .env
   ```

2. 编辑 `.env` 文件，填入你的微信凭证：
   ```
   WX_OPEN_ID=your_wx_open_id_here
   WX_UNION_ID=your_wx_union_id_here
   ```

3. 运行脚本：
   ```bash
   npm start
   ```

## GitHub Actions 自动运行

### 配置步骤

1. 在 GitHub 仓库页面，进入 **Settings** → **Secrets and variables** → **Actions**

2. 点击 **New repository secret**，添加以下两个密钥：
   - Name: `WX_OPEN_ID`，Value: 你的微信 OpenID
   - Name: `WX_UNION_ID`，Value: 你的微信 UnionID

3. 推送代码到 GitHub 后，工作流会自动启用

### 运行方式

- **自动运行**：每隔 12 小时（北京时间 8:00 和 20:00）
- **手动运行**：进入 **Actions** 页面，选择工作流，点击 **Run workflow**

### 下载文件

1. 进入仓库的 **Actions** 页面
2. 点击任意一次运行记录
3. 在 **Artifacts** 部分下载生成的 txt 文件

## 功能特性

- ✅ 自动登录获取 Token
- ✅ Token 本地缓存，避免频繁登录
- ✅ Token 过期自动刷新（提前 5 分钟）
- ✅ 支持多分组活动人数统计
- ✅ 自动识别活动类型和 emoji
- ✅ 按日期分组格式化输出
- ✅ 时间显示 AM/PM 格式
- ✅ 支持 GitHub Actions 定时运行

## 输出

脚本会生成一个以当前时间命名的 txt 文件，格式为：`年份日期时间.txt`

例如：`20251013143025.txt`（2025 年 10 月 13 日 14 点 30 分 25 秒）

## 文件说明

- `config.ts` - 配置文件（支持环境变量）
- `.env` - 本地环境变量（需要自己创建，已加入 .gitignore）
- `.env.example` - 环境变量示例
- `fetch-activities.ts` - 主脚本文件
- `.token_cache.json` - Token 缓存文件（自动生成，已加入 .gitignore）
- `.github/workflows/fetch-activities.yml` - GitHub Actions 工作流配置
- `package.json` - 项目依赖配置
- `tsconfig.json` - TypeScript 配置
