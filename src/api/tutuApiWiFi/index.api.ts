

import * as GlobalExport from "./globalExport.api";

import { customFetch, isTutu } from "@/utils/wkb-allinone";
import pidConf from "@/api/pid";

// 输出 http api header
export const Const = {
    XHttpToken: "x-http-token",
    XCypherType: "x-cypher-type",
    MapiPath: "/mapi",
    MapiPath2: "/mapi2",
}

// 输出 api pid。
export const WiFiPid = {
    AIConfigGetFrontCommon: pidConf.AIConfigGetFrontCommon, // protected n    module:tb-aiservern    获取前端通用配置n,
    AIConfigGetByKey: pidConf.AIConfigGetByKey, // protected n    module:tb-aiservern    通过key获取配置n,
    AIDeepSeekSessions: pidConf.AIDeepSeekSessions, // protected n    module:tb-aiservern    获取会话列表n,
    AIDeepSeekNewSession: pidConf.AIDeepSeekNewSession, // protected n    module:tb-aiservern    新建会话n,
    AIDeepSeekMessages: pidConf.AIDeepSeekMessages, // protected n    module:tb-aiservern    获取消息列表n,
    AIDeepSeekDelSession: pidConf.AIDeepSeekDelSession, // protected n    module:tb-aiservern    删除会话n,
    AIDeepSeekSendMessage: pidConf.AIDeepSeekSendMessage, // protected n    module:tb-aiservern    发送消息n,
    AIDeepSeekRefreshMessage: pidConf.AIDeepSeekRefreshMessage, // protected n    module:tb-aiservern    刷新消息n,
    AIDeepSeekMessageOnlineInfos: pidConf.AIDeepSeekMessageOnlineInfos, // protected n    module:tb-aiservern    获取消息关联联网搜索信息n
}

// 输出 api path。
export const TuTuPath = {
    AIConfigGetFrontCommon: "/ai/config/getFrontCommon", // protected n    module:tb-aiservern    获取前端通用配置n,
    AIConfigGetByKey: "/ai/config/getByKey", // protected n    module:tb-aiservern    通过key获取配置n,
    AIDeepSeekSessions: "/ai/deepseek/sessions", // protected n    module:tb-aiservern    获取会话列表n,
    AIDeepSeekNewSession: "/ai/deepseek/newSession", // protected n    module:tb-aiservern    新建会话n,
    AIDeepSeekMessages: "/ai/deepseek/messages", // protected n    module:tb-aiservern    获取消息列表n,
    AIDeepSeekDelSession: "/ai/deepseek/delSession", // protected n    module:tb-aiservern    删除会话n,
    AIDeepSeekSendMessage: "/ai/deepseek/sendMessage", // protected n    module:tb-aiservern    发送消息n,
    AIDeepSeekRefreshMessage: "/ai/deepseek/refreshMessage", // protected n    module:tb-aiservern    刷新消息n,
    AIDeepSeekMessageOnlineInfos: "/ai/deepseek/messageOnlineInfos", // protected n    module:tb-aiservern    获取消息关联联网搜索信息n
}

const Path = isTutu ? TuTuPath : WiFiPid

// n    module:tb-aiservern    获取前端通用配置n 
export const getAIConfigGetFrontCommon = (params: any) => customFetch({req: params,config: Path.AIConfigGetFrontCommon,reqClass: GlobalExport.ApiAIConfigGetFrontCommonReq,resClass: GlobalExport.AIConfigGetFrontCommonResData}); // protected n    module:tb-aiservern    获取前端通用配置n
// n    module:tb-aiservern    通过key获取配置n 
export const getAIConfigGetByKey = (params: any) => customFetch({req: params,config: Path.AIConfigGetByKey,reqClass: GlobalExport.ApiAIConfigGetByKeyReq,resClass: GlobalExport.AIConfigGetByKeyResData}); // protected n    module:tb-aiservern    通过key获取配置n
// n    module:tb-aiservern    获取会话列表n 
export const getAIDeepSeekSessions = (params: any) => customFetch({req: params,config: Path.AIDeepSeekSessions,reqClass: GlobalExport.ApiAIDeepSeekSessionsReq,resClass: GlobalExport.AIDeepSeekSessionsResData}); // protected n    module:tb-aiservern    获取会话列表n
// n    module:tb-aiservern    新建会话n 
export const getAIDeepSeekNewSession = (params: any) => customFetch({req: params,config: Path.AIDeepSeekNewSession,reqClass: GlobalExport.ApiAIDeepSeekNewSessionReq,resClass: GlobalExport.AIDeepSeekNewSessionResData}); // protected n    module:tb-aiservern    新建会话n
// n    module:tb-aiservern    获取消息列表n 
export const getAIDeepSeekMessages = (params: any) => customFetch({req: params,config: Path.AIDeepSeekMessages,reqClass: GlobalExport.ApiAIDeepSeekMessagesReq,resClass: GlobalExport.AIDeepSeekMessagesResData}); // protected n    module:tb-aiservern    获取消息列表n
// n    module:tb-aiservern    删除会话n 
export const getAIDeepSeekDelSession = (params: any) => customFetch({req: params,config: Path.AIDeepSeekDelSession,reqClass: GlobalExport.ApiAIDeepSeekDelSessionReq,resClass: GlobalExport.AIDeepSeekDelSessionResData}); // protected n    module:tb-aiservern    删除会话n
// n    module:tb-aiservern    发送消息n 
export const getAIDeepSeekSendMessage = (params: any) => customFetch({req: params,config: Path.AIDeepSeekSendMessage,reqClass: GlobalExport.ApiAIDeepSeekSendMessageReq,resClass: GlobalExport.AIDeepSeekSendMessageResData}); // protected n    module:tb-aiservern    发送消息n
// n    module:tb-aiservern    刷新消息n 
export const getAIDeepSeekRefreshMessage = (params: any) => customFetch({req: params,config: Path.AIDeepSeekRefreshMessage,reqClass: GlobalExport.ApiAIDeepSeekRefreshMessageReq,resClass: GlobalExport.AIDeepSeekRefreshMessageResData}); // protected n    module:tb-aiservern    刷新消息n
// n    module:tb-aiservern    获取消息关联联网搜索信息n 
export const getAIDeepSeekMessageOnlineInfos = (params: any) => customFetch({req: params,config: Path.AIDeepSeekMessageOnlineInfos,reqClass: GlobalExport.ApiAIDeepSeekMessageOnlineInfosReq,resClass: GlobalExport.AIDeepSeekMessageOnlineInfosResData}); // protected n    module:tb-aiservern    获取消息关联联网搜索信息n

