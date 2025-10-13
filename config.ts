import dotenv from "dotenv";
dotenv.config();

// 微信登录凭证（固定不变）
export const wxOpenId = process.env.WX_OPEN_ID;
export const wxUnionId = process.env.WX_UNION_ID;
