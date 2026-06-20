import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Crednetials",
      credentials: {
        identifier: {
          label: "Email or Username",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        await dbConnect();
        try {
          if (!credentials?.identifier || !credentials.password) {
            throw new Error("Missing credentials");
          }

          const user = await UserModel.findOne({
            $or: [
              { email: credentials.identifier },
              { username: credentials.identifier },
            ],
          });
          if (!user) {
            throw new Error("no user found with this email");
          }
          if (!user.isVerified) throw new Error("please verify your account");
          {
          }
          const isPasswordCorrect = await bcrypt.compare(
            credentials.password,
            user.password,
          );
          if (isPasswordCorrect) {
            return {
              id: user._id.toString(),
              _id: user._id.toString(),
              email: user.email,
              username: user.username,
              isVerified: user.isVerified,
              isAcceptingMessage: user.isAcceptingMessage,
            };
          } else {
            throw new Error("Incorrect password");
          }
        } catch (err) {
          if (err instanceof Error) {
            throw err;
          }

          throw new Error("Unable to authorize user");
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessage = user.isAcceptingMessage;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user._id = token._id;
        session.user.isVerified = token.isVerified;
        session.user.isAcceptingMessage = token.isAcceptingMessage;
        session.user.username = token.username;
      }
      return session;
    },
  },
  pages: {
    signIn: "/sign-in",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
