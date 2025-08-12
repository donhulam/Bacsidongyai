export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface FileInfo {
  name: string;
  type: string;
}

export interface Message {
  role: Role;
  content: string;
  file?: FileInfo;
}