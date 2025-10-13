import fetch from "node-fetch";
import * as https from "https";
import * as fs from "fs";
import { wxOpenId, wxUnionId } from "./config";

// 创建一个忽略 SSL 证书验证的 agent
const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

// Token 缓存文件路径
const TOKEN_CACHE_FILE = ".token_cache.json";

// Token 缓存接口
interface TokenCache {
  token: string;
  expTime: number;
}

// 从文件读取 Token 缓存
function loadTokenCache(): TokenCache | null {
  try {
    if (fs.existsSync(TOKEN_CACHE_FILE)) {
      const data = fs.readFileSync(TOKEN_CACHE_FILE, "utf-8");
      const cache = JSON.parse(data) as TokenCache;
      // 检查是否过期（提前 5 分钟刷新）
      if (cache.expTime > Date.now() + 5 * 60 * 1000) {
        return cache;
      }
    }
  } catch (e) {
    console.log("读取 Token 缓存失败，将重新登录");
  }
  return null;
}

// 保存 Token 缓存到文件
function saveTokenCache(token: string, expTime: number): void {
  const cache: TokenCache = { token, expTime };
  fs.writeFileSync(TOKEN_CACHE_FILE, JSON.stringify(cache, null, 2), "utf-8");
}

// 定义接口类型
interface ActivityFeeBranch {
  id: number;
  activityFeeBranchName: string;
  feeType: number;
  amount: number;
  nonMemberAmount: number;
  sumAmount: number;
  minPeople: number;
  maxPeople: number;
  maxQuotaCount: number;
  existQuotaTransfer: boolean;
  quotaTransferCount: null | number;
  isOpenAlternate: number;
  joinNum: null | number;
  scanCodeSignTime: null | string;
  orderAmountList: null | any;
  alternateRank: null | number;
  alternateRankV2: null | number;
}

interface Activity {
  activityId: number;
  activityName: string;
  startTime: string;
  endTime: string;
  userCount: number;
  address: string;
  activityFeeBranchResponseVoList: ActivityFeeBranch[];
}

interface PageData {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  totalPage: number;
  list: Activity[];
}

interface ApiResponse {
  msg: string;
  code: number;
  page: PageData;
}

// 活动类型对应的 emoji
const activityEmojis: { [key: string]: string } = {
  网球: "🎾",
  羽毛球: "🏸",
  羽球: "🏸",
  匹克球: "🥒",
  躲避球: "🤾‍♂️",
  桌球: "🎱",
  博饼: "🥮",
  中秋博饼: "🥮",
  交流大会: "🍵",
};

// 获取活动类型的 emoji
function getActivityEmoji(activityName: string): string {
  for (const [key, emoji] of Object.entries(activityEmojis)) {
    if (activityName.includes(key)) {
      return emoji;
    }
  }
  return "";
}

// 从活动名称中提取活动类型
function getActivityType(activityName: string): string {
  const types = [
    "网球",
    "羽毛球",
    "羽球",
    "匹克球",
    "躲避球",
    "桌球",
    "中秋博饼",
    "博饼",
  ];
  for (const type of types) {
    if (activityName.includes(type)) {
      return type;
    }
  }
  return "活动";
}

// 登录获取 Token
async function getToken(): Promise<string> {
  // 先尝试从缓存读取
  const cache = loadTokenCache();
  if (cache) {
    console.log("✅ 使用缓存的 Token");
    return cache.token;
  }

  console.log("正在登录获取新 Token...");
  const url = "https://imlatteapi.anlaiye.com/users/quickLogin";

  const response = await fetch(url, {
    method: "POST",
    headers: {
      host: "imlatteapi.anlaiye.com",
      terminaltype: "detail",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf2641110) XWEB/16730",
      xweb_xhr: "1",
      "content-type": "application/json",
      accept: "*/*",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer:
        "https://servicewechat.com/wxd9f4892f0c536da8/352/page-frame.html",
      "accept-language": "zh-CN,zh;q=0.9",
      priority: "u=1, i",
    },
    body: JSON.stringify({
      wxOpenId: wxOpenId,
      wxUnionId: wxUnionId,
    }),
    agent: httpsAgent,
  });

  const jsonData = (await response.json()) as any;

  if (jsonData.code === 200 && jsonData.data?.tokenResponse?.token) {
    const token = jsonData.data.tokenResponse.token;
    const expTime = jsonData.data.tokenResponse.expTime;

    // 保存到缓存文件
    saveTokenCache(token, expTime);

    const expDate = new Date(expTime);
    console.log(
      `✅ Token 获取成功，有效期至: ${expDate.toLocaleString("zh-CN")}`
    );

    return token;
  } else {
    throw new Error(`登录失败: ${jsonData.msg || "未知错误"}`);
  }
}

// 发起 HTTP GET 请求（带 token 失效重试）
async function fetchData(
  pageIndex: number,
  retryCount: number = 0
): Promise<ApiResponse> {
  const token = await getToken();
  const url = `https://imlatteapi.anlaiye.com/home/clubHomeActivity?pageIndex=${pageIndex}&pageSize=10&clubId=0&clubActivityType=1`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      host: "imlatteapi.anlaiye.com",
      terminaltype: "detail",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 MicroMessenger/7.0.20.1781(0x6700143B) NetType/WIFI MiniProgramEnv/Mac MacWechat/WMPF MacWechat/3.8.7(0x13080712) UnifiedPCMacWechat(0xf2641110) XWEB/16730",
      xweb_xhr: "1",
      "content-type": "application/json",
      token: token,
      accept: "*/*",
      "sec-fetch-site": "cross-site",
      "sec-fetch-mode": "cors",
      "sec-fetch-dest": "empty",
      referer:
        "https://servicewechat.com/wxd9f4892f0c536da8/352/page-frame.html",
      "accept-language": "zh-CN,zh;q=0.9",
      priority: "u=1, i",
    },
    agent: httpsAgent,
  });

  // 检查 HTTP 状态码
  if (!response.ok) {
    throw new Error(
      `HTTP 请求失败: ${response.status} ${response.statusText}`
    );
  }

  const jsonData = (await response.json()) as ApiResponse;

  // 检查业务状态码（code !== 200 说明 token 可能失效）
  if (jsonData.code !== 200) {
    if (retryCount < 1) {
      console.log(
        `⚠️ 业务错误 (code: ${jsonData.code}, msg: ${jsonData.msg})，尝试重新登录...`
      );
      // 删除缓存文件，强制重新登录
      if (fs.existsSync(TOKEN_CACHE_FILE)) {
        fs.unlinkSync(TOKEN_CACHE_FILE);
      }
      // 递归重试（最多重试1次）
      return fetchData(pageIndex, retryCount + 1);
    } else {
      throw new Error(
        `请求失败: code: ${jsonData.code}, msg: ${
          jsonData.msg || "Token 失效且重试失败"
        }`
      );
    }
  }

  return jsonData;
}

// 获取所有活动数据
async function fetchAllActivities(): Promise<Activity[]> {
  const firstPage = await fetchData(1);
  const totalPage = firstPage.page.totalPage;
  const allActivities: Activity[] = [...firstPage.page.list];

  console.log(`总共 ${totalPage} 页，${firstPage.page.totalCount} 条活动`);

  // 获取剩余页面
  for (let i = 2; i <= totalPage; i++) {
    console.log(`正在获取第 ${i} 页...`);
    const pageData = await fetchData(i);
    allActivities.push(...pageData.page.list);
    // 添加延迟避免请求过快
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return allActivities;
}

// 格式化时间
function formatTime(timeStr: string): string {
  const date = new Date(timeStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? "pm" : "am";
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  if (minutes === 0) {
    return `${displayHours}${period}`;
  }
  return `${displayHours}:${minutes.toString().padStart(2, "0")}${period}`;
}

// 格式化日期
function formatDate(dateStr: string): {
  date: string;
  weekday: string;
  sortKey: string;
} {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
  const weekday = weekdays[date.getDay()];

  return {
    date: `${month}月${day}日 ${weekday}`,
    weekday,
    sortKey: dateStr.split(" ")[0],
  };
}

// 提取地址中竖线后面的内容
function extractLocation(address: string): string {
  const parts = address.split("|");
  if (parts.length > 1) {
    return parts[1].trim();
  }
  return address;
}

// 格式化单个活动
function formatActivity(activity: Activity): string {
  const startTime = formatTime(activity.startTime);
  const endTime = formatTime(activity.endTime);
  const timeRange = `${startTime}-${endTime}`;

  const activityType = getActivityType(activity.activityName);
  const emoji = getActivityEmoji(activity.activityName);

  const location = extractLocation(activity.address);

  // 计算总人数：所有分组的 maxPeople 相加
  const maxPeople = activity.activityFeeBranchResponseVoList.reduce(
    (sum, branch) => sum + (branch.maxPeople || 0),
    0
  );
  const userCount = activity.userCount;
  const ratio = maxPeople > 0 ? userCount / maxPeople : 0;
  const isFull = ratio >= 1;
  const status = isFull ? "🈵" : "🈳";

  const countText = `${userCount}/${maxPeople}`;

  return `${status} ${timeRange} ${activityType}${emoji} ${location} ${countText}`;
}

// 按日期分组活动
function groupActivitiesByDate(
  activities: Activity[]
): Map<string, Activity[]> {
  const grouped = new Map<string, Activity[]>();

  for (const activity of activities) {
    const { sortKey } = formatDate(activity.startTime);
    if (!grouped.has(sortKey)) {
      grouped.set(sortKey, []);
    }
    grouped.get(sortKey)!.push(activity);
  }

  return grouped;
}

// 生成输出文本
function generateOutput(activities: Activity[]): string {
  const grouped = groupActivitiesByDate(activities);

  // 按日期排序
  const sortedDates = Array.from(grouped.keys()).sort();

  let output = "🧡启用小程序🧡\n";

  for (const dateKey of sortedDates) {
    const dateActivities = grouped.get(dateKey)!;
    const { date } = formatDate(dateActivities[0].startTime);

    output += `\n${date}\n`;

    // 按开始时间排序
    dateActivities.sort((a, b) => {
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });

    for (const activity of dateActivities) {
      output += formatActivity(activity) + "\n";
    }
  }

  output += "\n⚠️\n";
  output += "1️⃣每个活动🈵了后默认N+1 ，第一次参加活动的新人使用。\n";
  output += "2️⃣取消接龙，🈶🈚️候补，请同时艾特烤鸭和候补说一声。\n";

  return output;
}

// 生成文件名（使用北京时间 UTC+8）
function generateFileName(): string {
  // 获取北京时间
  const now = new Date();
  const beijingTime = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Shanghai" })
  );

  const year = beijingTime.getFullYear();
  const month = (beijingTime.getMonth() + 1).toString().padStart(2, "0");
  const day = beijingTime.getDate().toString().padStart(2, "0");
  const hours = beijingTime.getHours().toString().padStart(2, "0");
  const minutes = beijingTime.getMinutes().toString().padStart(2, "0");
  const seconds = beijingTime.getSeconds().toString().padStart(2, "0");

  return `${year}${month}${day}${hours}${minutes}${seconds}.txt`;
}

// 主函数
async function main() {
  try {
    console.log("开始获取活动数据...");
    const activities = await fetchAllActivities();

    console.log(`成功获取 ${activities.length} 条活动数据`);
    console.log("正在生成输出...");

    const output = generateOutput(activities);
    const fileName = generateFileName();

    fs.writeFileSync(fileName, output, "utf-8");

    console.log(`✅ 数据已保存到文件: ${fileName}`);
    console.log("\n预览:");
    console.log(output.substring(0, 500) + "...");
  } catch (error) {
    console.error("❌ 发生错误:", error);
    process.exit(1);
  }
}

main();
