import crypto from "crypto";

import dbConnect from "@/lib/dbConnect";
import UserModel from "@/modal/user";
import QuesModel from "@/modal/question";
import mongoose from "mongoose";

export async function POST(request: Request) {
    await dbConnect();

    try {
        const {
            username,
            content,
            questionId,
        } = await request.json();

        // Find recipient
        const user = await UserModel.findOne({
            username,
        });

        if (!user) {
            return Response.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Shared message object
        const replyAccessToken = crypto.randomUUID();

        const newMessage = {
            content,
            createdAt: new Date(),
            replyAccessToken,
            replies: [],
        };

        // =====================================================
        // QUESTION FEATURE
        // =====================================================
        if (questionId) {
            const question = await QuesModel.findOne({
                _id: new mongoose.Types.ObjectId(questionId),
                userId: new mongoose.Types.ObjectId(user._id),
            });

            if (!question) {
                return Response.json(
                    {
                        success: false,
                        message: "Question not found",
                    },
                    { status: 404 }
                );
            }

            question.messages.push(newMessage);

            await question.save();

            return Response.json(
                {
                    success: true,
                    message: "Response submitted successfully",
                    replyAccessToken,
                },
                { status: 200 }
            );
        }

        // =====================================================
        // DEFAULT ANONYMOUS MESSAGE FEATURE
        // =====================================================

        if (!user.isAcceptingMessage) {
            return Response.json(
                {
                    success: false,
                    message: "User is not accepting messages",
                },
                { status: 403 }
            );
        }

        user.messages.push(newMessage);

        await user.save();

        return Response.json(
            {
                success: true,
                message: "Message sent successfully",
                replyAccessToken,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error sending message:", error);

        return Response.json(
            {
                success: false,
                message: "Unexpected error while sending message",
            },
            { status: 500 }
        );
    }
}