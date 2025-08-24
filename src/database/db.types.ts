import { Generated } from 'kysely';

export interface Database {
  users: UserTable
};

export interface UserTable {
  user_id: string,              // BigInt
  fid: bigint,                  // BigInt
  username: string,             // varchar(100)
  avatar_url: string,           // text
  state: number,                // int2
  level: number,                // int2
  created_at: number,  // integer
  updated_at: number,  // integer
};
