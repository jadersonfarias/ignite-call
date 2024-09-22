import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";
import { setCookie } from "nookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== "POST") {
    // se o metodo não for post
    return res.status(405).end();
  }

  const { name, username } = req.body; // pega a informação do corpo da requisição

  const userExists = await prisma.user.findUnique({
    // pega o dado que unico e devolve um erro caso já tenha no banco
    where: {
      username,
    },
  });

  if (userExists) {
    return res.status(400).json({
      message: "Username already taken.",
    });
  }

  const user = await prisma.user.create({
    // criar user
    data: {
      name,
      username,
    },
  });

  setCookie({ res }, "@ignitecall:userId", user.id, {
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/", // todas as páginas vão ter acesso
  }); // vai criar um cabesalho

  return res.status(201).json(user);
}
