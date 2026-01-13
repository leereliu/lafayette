# Lafayette Active Club 活动统计脚本

自动获取 Lafayette Active Club 的活动数据并生成格式化的文本报告。

## 📊 输出示例

```
🧡启用小程序🧡

10月13日 周一
🈵 8pm-10pm 🏸羽球 Wyse Active Hub 33/33

10月14日 周二
🈵 7am-9am 🥒匹克球 Delta Sport Hall C4 6/6
🈳 7pm-9pm 🤽🏻‍♂️躲避球 APSN Katong School 8/18
🈳 7pm-10pm 🎾网球 Kallang Tennis Centre (C12,C11) 5/6
🈵 7pm-9pm 🎾网球 DLeedon Holland V 6/6

10月15日 周三
🈵 6pm-8pm 🏸羽球 21 Evans Rd, Singapore 259366 6/6
🈵 7pm-9pm 🎾网球 kallang tennis centre（C3） 5/5
🈳 8pm-10pm 🎾网球 kallang tennis centre（C2 & C4） 10/11

⚠️
1️⃣每个活动🈵了后默认N+1 ，第一次参加活动的新人使用。
2️⃣取消接龙，🈶🈚️候补，请同时艾特烤鸭和候补说一声。
```

## ⏰ 自动运行时间

每天自动执行 1 次：

- **中午 11:56 AM**（北京时间）

## 📥 如何下载文件

1. 进入仓库的 [**Actions**](../../actions) 页面
2. 点击最新的运行记录
3. 滚动到页面底部，在 **Artifacts** 部分下载文件
4. 文件保留 30 天

也可以手动触发运行：**Actions** → **定时获取活动数据** → **Run workflow**

---

## 🛠 技术说明

- 自动登录获取 Token，无需手动配置
- Token 缓存机制，避免频繁登录
- Token 失效自动重试
- 文件名使用北京时间格式：`YYYYMMDDHHMMSS.txt`
