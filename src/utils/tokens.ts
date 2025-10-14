import { Request, Response } from "express";


export const clearTokens = (res: Response) => {
    res.clearCookie("r_token");
    res.clearCookie("a_token");
}