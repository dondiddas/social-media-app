import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: string;
}

const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const token = req.headers?.token as string;

  if (!token) {
    res.json({ success: false, message: "Not Authorized, Login Again" });
    return;
  }

  try {
    const token_decode = jwt.verify(
      token,
      process.env.ACCESS_SECRET as string
    ) as { userId: string };

    req.userId = token_decode.userId;
    next();
  } catch (error: any) {
    if (error.name === "TokenExpiredError") {
      console.error("Token expired:", error);
      res.status(401).json({ success: false, message: "Token expired" });
      return;
    }
    console.error("JWT error:", error);
    res.status(401).json({ success: false, message: "Invalid token" });
    return;
  }
};

const verifyToken = async (token: string) => {
  if (!token) throw new Error("Token is requied");
  try {
    const token_decode = jwt.verify(
      token,
      process.env.ACCESS_SECRET as string
    ) as { userId: string };

    return token_decode;
  } catch (error) {
    console.log(error);
  }
};

export { verifyToken };
export default authMiddleware;
