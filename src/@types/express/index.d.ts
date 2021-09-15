import { Express } from "express";

declare global {
  namespace Express {
      export interface User {
        _id: string;
      }
  }
}
