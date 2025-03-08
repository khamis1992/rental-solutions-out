
// Type-safe JSON handling
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface JsonObject {
  [key: string]: Json;
}
