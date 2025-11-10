export type LegacyUserData = {
  fid: number;
  nickname: string;
  kid: number;
  stove_lv: number;
  stove_lv_content: number;
  avatar_image: string;
  total_recharge_amount: number;
};

export type ApiResponse = {
  status: string;
  code: number;
  data: {
    playerId: number;
    name: string;
    kingdom: number;
    level: number;
    levelRendered: string;
    levelRenderedDetailed: string;
    levelImage: string;
    profilePhoto: string;
  } | null;
  msg: string;
  err_code: string;
};

export type LegacyResponse = {
  status: "success" | "error";
  data: {
    playerId: number;
    name: string;
    kingdom: number;
    level: number;
    profilePhoto: string;
  } | null;
  message: string;
  meta?: any;
  timestamp?: string;
};
