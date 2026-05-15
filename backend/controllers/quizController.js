import Quiz from "../models/Quiz.js";
import UserQuiz from "../models/User.js";
import { createInitialReviewSchedules } from "../services/reviewScheduler.js";
import logger from "../utils/logger.js";
import mongoose from "mongoose";
import AppError from "../utils/AppError.js";

import {
    sendSuccess,
    sendNotFound,
    sendForbidden,
    sendValidationError,
    sendCreated
} from "../utils/responseHelper.js";


// ========================= GET ALL QUIZZES =========================
export const getQuizzes = async (req, res) => {
    try {
        logger.info(
            `Getting quizzes for user ${req.user.id}`
        );

        // Everyone can see all quizzes
        const quizzes = await Quiz.find().lean();

        return sendSuccess(
            res,
            quizzes,
            `Fetched ${quizzes.length} quizzes successfully`
        );

    } catch (error) {
        logger.error({
            message: "Error fetching quizzes",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to fetch quizzes",
            500
        );
    }
};


// ========================= CREATE QUIZ =========================
export const createQuiz = async (req, res) => {
    try {
        const { role, id: userId } = req.user;
        const { title, category } = req.body;

        if (
            role !== "admin" &&
            role !== "instructor"
        ) {
            return sendForbidden(
                res,
                "Only admins or instructors can create quizzes"
            );
        }

        let createdBy = {
            _id: null,
            name: "Admin"
        };

        // Instructor-created quiz
        if (role === "instructor") {
            const user = await UserQuiz.findById(userId);

            if (!user) {
                return sendNotFound(res, "User");
            }

            createdBy = {
                _id: user._id,
                name: user.name
            };
        }

        const newQuiz = new Quiz({
            title,
            category,
            duration: 0,
            totalMarks: 0,
            passingMarks: 0,
            questions: [],
            createdBy
        });

        const savedQuiz = await newQuiz.save();

        logger.info(
            `Quiz created successfully: ${savedQuiz._id}`
        );

        return sendCreated(
            res,
            savedQuiz,
            "Quiz created successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error creating quiz",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to create quiz",
            500
        );
    }
};


// ========================= DELETE QUIZ =========================
export const deleteQuiz = async (req, res) => {
    try {
        const { title } = req.query;
        const { role, id: userId } = req.user;

        if (!title) {
            return sendValidationError(res, {
                title: "Quiz title is required"
            });
        }

        const quiz = await Quiz.findOne({ title });

        if (!quiz) {
            return sendNotFound(res, "Quiz");
        }

        // Only admin OR owner can delete
        if (role !== "admin") {
            const ownerId =
                quiz.createdBy?._id?.toString();

            if (!ownerId || ownerId !== userId) {
                return sendForbidden(
                    res,
                    "You can only delete your own quizzes"
                );
            }
        }

        await Quiz.deleteOne({ title });

        logger.info(`Quiz deleted: ${title}`);

        return sendSuccess(
            res,
            null,
            "Quiz deleted successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error deleting quiz",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to delete quiz",
            500
        );
    }
};


// ========================= ADD QUESTION =========================
export const addQuestion = async (req, res) => {
    try {
        const { role, id: userId } = req.user;

        const quiz = await Quiz.findById(
            req.params.id
        );

        if (!quiz) {
            return sendNotFound(res, "Quiz");
        }

        // Only admin OR owner can edit
        if (role !== "admin") {
            const ownerId =
                quiz.createdBy?._id?.toString();

            if (!ownerId || ownerId !== userId) {
                return sendForbidden(
                    res,
                    "You can only edit your own quizzes"
                );
            }
        }

        const questionData = {
            ...req.body,
            difficulty:
                req.body.difficulty || "medium"
        };

        quiz.questions.push(questionData);

        quiz.totalMarks += 1;

        quiz.passingMarks = Math.floor(
            quiz.totalMarks / 2
        );

        quiz.duration = quiz.questions.length * 2;

        if (!quiz.difficultyDistribution) {
            quiz.difficultyDistribution = {
                easy: 0,
                medium: 0,
                hard: 0
            };
        }

        quiz.difficultyDistribution[
            questionData.difficulty
        ] += 1;

        await quiz.save();

        return sendSuccess(
            res,
            quiz,
            "Question added successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error adding question",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to add question",
            500
        );
    }
};


// ========================= GET QUIZ BY ID =========================
export const getQuizById = async (req, res) => {
    try {
        const quizId = req.params.id;

        if (
            !mongoose.Types.ObjectId.isValid(
                quizId
            )
        ) {
            return sendValidationError(res, {
                quizId: "Invalid quiz ID"
            });
        }

        const quiz = await Quiz.findById(quizId);

        if (!quiz) {
            return sendNotFound(res, "Quiz");
        }

        // Create review schedules
        if (req.user) {
            await createInitialReviewSchedules(
                req.user.id,
                quiz._id,
                quiz.questions
            );
        }

        return sendSuccess(
            res,
            quiz,
            "Quiz fetched successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error fetching quiz",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to fetch quiz",
            500
        );
    }
};


// ========================= DELETE QUESTION =========================
export const deleteQuestion = async (req, res) => {
    try {
        const { role, id: userId } = req.user;

        const quiz = await Quiz.findById(
            req.params.id
        );

        if (!quiz) {
            return sendNotFound(res, "Quiz");
        }

        // Only admin OR owner
        if (role !== "admin") {
            const ownerId =
                quiz.createdBy?._id?.toString();

            if (!ownerId || ownerId !== userId) {
                return sendForbidden(
                    res,
                    "You can only edit your own quizzes"
                );
            }
        }

        const questionIndex =
            req.params.questionIndex;

        if (
            questionIndex < 0 ||
            questionIndex >= quiz.questions.length
        ) {
            return sendValidationError(res, {
                questionIndex:
                    "Invalid question index"
            });
        }

        const questionToRemove =
            quiz.questions[questionIndex];

        if (
            quiz.difficultyDistribution &&
            questionToRemove.difficulty
        ) {
            quiz.difficultyDistribution[
                questionToRemove.difficulty
            ] = Math.max(
                0,
                quiz.difficultyDistribution[
                    questionToRemove.difficulty
                ] - 1
            );
        }

        quiz.questions.splice(questionIndex, 1);

        quiz.totalMarks -= 1;

        quiz.passingMarks = Math.floor(
            quiz.totalMarks / 2
        );

        quiz.duration = quiz.questions.length * 2;

        await quiz.save();

        return sendSuccess(
            res,
            quiz,
            "Question deleted successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error deleting question",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to delete question",
            500
        );
    }
};


// ========================= UPDATE QUIZ STATS =========================
export const updateQuizStats = async (
    req,
    res
) => {
    try {
        const {
            quizId,
            score,
            totalQuestions,
            timeSpent
        } = req.body;

        const quiz = await Quiz.findById(
            quizId
        );

        if (!quiz) {
            return sendNotFound(res, "Quiz");
        }

        const totalAttempts =
            (quiz.totalAttempts || 0) + 1;

        const averageScore =
            (
                (quiz.averageScore || 0) *
                (totalAttempts - 1) +
                score / totalQuestions
            ) / totalAttempts;

        const averageTime =
            (
                (quiz.averageTime || 0) *
                (totalAttempts - 1) +
                timeSpent
            ) / totalAttempts;

        quiz.totalAttempts = totalAttempts;
        quiz.averageScore = averageScore;
        quiz.averageTime = averageTime;
        quiz.popularityScore =
            totalAttempts * averageScore;

        await quiz.save();

        return sendSuccess(
            res,
            {
                totalAttempts,
                averageScore: Math.round(
                    averageScore * 100
                ),
                averageTime: Math.round(
                    averageTime
                ),
                popularityScore: Math.round(
                    quiz.popularityScore * 100
                )
            },
            "Quiz statistics updated successfully"
        );

    } catch (error) {
        logger.error({
            message: "Error updating quiz stats",
            error: error.message,
            stack: error.stack
        });

        throw new AppError(
            "Failed to update quiz statistics",
            500
        );
    }
};