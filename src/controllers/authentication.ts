import express from "express";
import { createUser, getUserByEmail } from "../models/users";
import { random, authentication } from "../utils/index";

export const login = async (req: express.Request, res: express.Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const user = await getUserByEmail(email).select(
      "+authentication.salt +authentication.password"
    );
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const expectedHash = authentication(user.authentication.salt, password);
    if (expectedHash !== user.authentication.password) {
      return res.status(403).json({ error: "Wrong password" });
    }

    const salt = random();
    user.authentication.sessionToken = authentication(
      salt,
      user._id.toString()
    );

    await user.save();

    res.cookie("sessionToken", user.authentication.sessionToken, {
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
    });

    return res.status(200).json({ user }).end();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error: error.message });
  }
};

export const register = async (req: express.Request, res: express.Response) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existingUser = await getUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const salt = random();
    const user = await createUser({
      email,
      username,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
    });

    return res.status(200).json({ user });
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error: error.message });
  }
};
