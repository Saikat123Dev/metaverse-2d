import client from "@repo/db/client";
import { Request, Response } from "express";
import { SigninSchema, SignupSchema } from "../@types/types";
import { hash } from "../config/scrypt";

export const signup = async (req: Request, res: Response) => {

  const parsedData = SignupSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.log("Parsed data incorrect");
    return res.status(400).json({ message: "Validation failed" });
  }

  const { username, password, type } = parsedData.data;
  const hashedPassword = await hash(password);

  try {

    const existingUser = await client.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      console.log("User already exists");
      return res.status(409).json({ message: "User already exists" });
    }


    const user = await client.user.create({
      data: {
        username,
        password: hashedPassword,
        role: type === "admin" ? "Admin" : "User"
      }
    });

    return res.status(201).json({ userId: user.id });
  } catch (e) {
    console.log("Error thrown during user creation");
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const signin = async (req: Request, res: Response) => {
  const parsedData = SigninSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.log("Parsed data incorrect");
    return res.status(400).json({ message: "Validation failed" });
  }

  const { username, password } = parsedData.data;

  try {
    // optimization
    const user = await client.user.findUnique({
      where: { username }
    });

    if (!user) {
      console.log("User not found");
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordCorrect = await hash(password) === user.password;

    if (!isPasswordCorrect) {
      console.log("Password incorrect");
      return res.status(401).json({ message: "Incorrect password" });
    }

    return res.status(200).json({ token: user.id });
  } catch (e) {
    console.log("Error thrown during user signin");
    console.error(e);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
