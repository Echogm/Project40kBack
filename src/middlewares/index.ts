import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../models/users";

export const isOwner = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const { id } = req.params;
    const currentUserId = get(req, "identity.id") as string;
    if (!currentUserId) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    if (currentUserId !== id) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    return next();
  } catch (error) {
    console.log(error);
    res.sendStatus(500);
  }
};

export const isAuthenticated = async (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const sessionToken = req.cookies["sessionToken"];
    if (!sessionToken) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const existingUser = await getUserBySessionToken(sessionToken);

    if (!existingUser) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    merge(req, { identity: existingUser });

    return next();
  } catch (error) {
    console.log(error);
    return res.sendStatus(500);
  }
};
