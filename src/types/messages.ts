export interface Message  {
    role: 'ai' | 'user';
    text: string;
    reasoning?: string;
    id?: number;
    displayedText?: string;
    displayedReasoning?: string;
    typingIndex?: number;
    showRecommend?: boolean;
    recommendList?: RecommendInfo[];
    end?: boolean;
    online?: boolean;
    onlineCount?: number;
    onlineList?: OnlineInfo[]
    onlineEnd?: boolean;
  }
  
  export interface RecommendInfo {
   id: number;
   question: string;
   online: boolean;
  }
  export interface OnlineInfo {
    SiteName: string;
    Icon: string;
    Index: number;
    Title: string;
    Url: string;
  }
