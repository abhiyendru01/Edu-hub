import XPLog from "../models/XPLog.js";
import UserQuiz from "../models/User.js";

import logger from "../utils/logger.js";

import {
    sendSuccess
} from "../utils/responseHelper.js";

import AppError from "../utils/AppError.js";

/* =========================================
   HELPER
========================================= */

const buildLeaderboard = async (
    startDate = null
) => {

    const matchStage = startDate
        ? {
            $match: {
                date: {
                    $gte: startDate
                }
            }
        }
        : null;

    const pipeline = [

        ...(matchStage
            ? [matchStage]
            : []),

        {
            $group: {

                _id: "$user",

                totalXP: {
                    $sum: "$xp"
                }
            }
        },

        {
            $sort: {
                totalXP: -1
            }
        },

        {
            $limit: 20
        }
    ];

    const result =
        await XPLog.aggregate(pipeline);

    const leaderboard =
        await Promise.all(

            result.map(
                async (entry, index) => {

                    const user =
                        await UserQuiz.findById(
                            entry._id
                        )
                        .select(
                            "name level xp"
                        )
                        .lean();

                    if (!user) {

                        return null;
                    }

                    return {

                        rank: index + 1,

                        userId:
                            user._id,

                        username:
                            user.name,

                        xp:
                            entry.totalXP,

                        level:
                            user.level || 1
                    };
                }
            )
        );

    return leaderboard.filter(Boolean);
};

/* =========================================
   WEEKLY
========================================= */

export const getWeeklyXP = async (
    req,
    res
) => {

    logger.info(
        "Fetching weekly XP leaderboard"
    );

    try {

        const weekAgo = new Date();

        weekAgo.setDate(
            weekAgo.getDate() - 7
        );

        const leaderboard =
            await buildLeaderboard(
                weekAgo
            );

        return sendSuccess(

            res,

            {
                leaderboard
            },

            "Weekly leaderboard fetched"
        );

    } catch (error) {

        logger.error({

            message:
                "Error fetching weekly leaderboard",

            error:
                error.message,

            stack:
                error.stack
        });

        throw new AppError(
            "Server error",
            500
        );
    }
};

/* =========================================
   MONTHLY
========================================= */

export const getMonthlyXP = async (
    req,
    res
) => {

    logger.info(
        "Fetching monthly XP leaderboard"
    );

    try {

        const monthAgo = new Date();

        monthAgo.setMonth(
            monthAgo.getMonth() - 1
        );

        const leaderboard =
            await buildLeaderboard(
                monthAgo
            );

        return sendSuccess(

            res,

            {
                leaderboard
            },

            "Monthly leaderboard fetched"
        );

    } catch (error) {

        logger.error({

            message:
                "Error fetching monthly leaderboard",

            error:
                error.message,

            stack:
                error.stack
        });

        throw new AppError(
            "Server error",
            500
        );
    }
};

/* =========================================
   ALL TIME
========================================= */

export const getAllTimeXP = async (
    req,
    res
) => {

    logger.info(
        "Fetching all-time XP leaderboard"
    );

    try {

        const leaderboard =
            await buildLeaderboard();

        return sendSuccess(

            res,

            {
                leaderboard
            },

            "All-time leaderboard fetched"
        );

    } catch (error) {

        logger.error({

            message:
                "Error fetching all-time leaderboard",

            error:
                error.message,

            stack:
                error.stack
        });

        throw new AppError(
            "Server error",
            500
        );
    }
};