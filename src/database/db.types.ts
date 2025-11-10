import { Generated } from 'kysely';

export interface Database {
  users: LegacyTable,
  users_v2: UserTable
};

export interface LegacyTable {
  user_id: string,              // BigInt
  fid: bigint,                  // BigInt
  username: string,             // varchar(100)
  avatar_url: string,           // text
  state: number,                // int2
  level: number,                // int2
  created_at: number,  // integer
  updated_at: number,  // integer
};

export interface UserTable {
  user_id: string,              // BigInt
  player_id: bigint,            // BigInt
  username: string,             // text
  kingdom: number,              // INT
  level: number,                // INT
  avatar_url: string,           // text
  created_at: string,           // text
  updated_at: string,           // text
}