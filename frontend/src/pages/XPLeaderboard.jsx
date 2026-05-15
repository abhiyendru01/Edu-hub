// src/components/XPLeaderboard.jsx

import React, {
    useEffect,
    useState,
    useCallback
} from "react";

import {
    motion,
    AnimatePresence
} from "framer-motion";

import axios from "../utils/axios";

import Loading from "../components/Loading";

import NotificationModal from "../components/NotificationModal";

import { useNotification }
    from "../hooks/useNotification";

import "./Leaderboard.css";

const XPLeaderboard = () => {

    /* =========================================
       STATE
    ========================================= */

    const [period, setPeriod] =
        useState("weekly");

    const [data, setData] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const {
        notification,
        showError,
        hideNotification
    } = useNotification();

    /* =========================================
       FETCH LEADERBOARD
    ========================================= */

    const fetchXPLeaderboard =
    useCallback(async () => {

    setLoading(true);

    setError("");

    try {

        const response =
            await axios.get(
                `/api/leaderboard/${period}`
            );

        console.log(
            "LEADERBOARD RESPONSE:",
            response
        );

        const leaderboardData =
            response?.data?.leaderboard || [];

        console.log(
            "PARSED LEADERBOARD:",
            leaderboardData
        );

        setData(

            Array.isArray(
                leaderboardData
            )

                ? leaderboardData

                : []
        );

    } catch (err) {

        console.error(
            "XP LEADERBOARD ERROR:",
            err
        );

        const errorMsg =

            err?.response?.data?.message ||

            err.message ||

            "Failed to load leaderboard.";

        setError(errorMsg);

        showError(errorMsg);

    } finally {

        setLoading(false);
    }

}, [period, showError]);

    /* =========================================
       LOAD
    ========================================= */

    useEffect(() => {

        fetchXPLeaderboard();

    }, [fetchXPLeaderboard]);

    /* =========================================
       ANIMATIONS
    ========================================= */

    const containerVariants = {

        hidden: {
            opacity: 0
        },

        visible: {

            opacity: 1,

            transition: {

                staggerChildren: 0.08,

                delayChildren: 0.15
            }
        }
    };

    const itemVariants = {

        hidden: {

            opacity: 0,

            y: 20
        },

        visible: {

            opacity: 1,

            y: 0,

            transition: {

                duration: 0.4,

                ease: "easeOut"
            }
        }
    };

    /* =========================================
       HELPERS
    ========================================= */

    const getRankIcon = (index) => {

        switch (index) {

            case 0:
                return "🥇";

            case 1:
                return "🥈";

            case 2:
                return "🥉";

            default:
                return "🏆";
        }
    };

    /* =========================================
       UI
    ========================================= */

    return (

        <motion.div

            className="leaderboard-container"

            variants={containerVariants}

            initial="hidden"

            animate="visible"
        >

            {/* =========================================
               HEADER
            ========================================= */}

            <motion.h2
                variants={itemVariants}
            >
                🔥 XP Leaderboard
            </motion.h2>

            {/* =========================================
               FILTER BUTTONS
            ========================================= */}

            <motion.div

                className="leaderboard-buttons"

                variants={itemVariants}
            >

                <button

                    onClick={() =>
                        setPeriod("weekly")
                    }

                    className={
                        period === "weekly"
                            ? "active"
                            : ""
                    }
                >
                    Weekly
                </button>

                <button

                    onClick={() =>
                        setPeriod("monthly")
                    }

                    className={
                        period === "monthly"
                            ? "active"
                            : ""
                    }
                >
                    Monthly
                </button>

            </motion.div>

            {/* =========================================
               CONTENT
            ========================================= */}

            <AnimatePresence mode="wait">

                {/* LOADING */}

                {loading ? (

                    <Loading
                        fullScreen={false}
                        size="medium"
                    />

                ) : error ? (

                    /* ERROR */

                    <motion.div

                        className="error-container"

                        initial={{
                            opacity: 0
                        }}

                        animate={{
                            opacity: 1
                        }}

                        exit={{
                            opacity: 0
                        }}
                    >

                        <p className="error-message">
                            {error}
                        </p>

                    </motion.div>

                ) : Array.isArray(data) &&
                  data.length > 0 ? (

                    /* TABLE */

                    <motion.div

                        className="leaderboard-table"

                        variants={itemVariants}
                    >

                        <table>

                            <thead>

                                <tr>

                                    <th>
                                        Rank
                                    </th>

                                    <th>
                                        Username
                                    </th>

                                    <th>
                                        XP
                                    </th>

                                    <th>
                                        Level
                                    </th>

                                </tr>

                            </thead>

                            <tbody>

                                {data.map(
                                    (
                                        user,
                                        index
                                    ) => (

                                    <motion.tr

                                        key={
                                            user?.userId ||
                                            index
                                        }

                                        initial={{
                                            opacity: 0,
                                            x: -20
                                        }}

                                        animate={{
                                            opacity: 1,
                                            x: 0
                                        }}

                                        transition={{
                                            delay:
                                                index *
                                                0.05
                                        }}

                                        whileHover={{
                                            scale: 1.01
                                        }}
                                    >

                                        {/* RANK */}

                                        <td
                                            className="rank-cell"
                                        >

                                            <span className="rank-icon">

                                                {
                                                    getRankIcon(
                                                        index
                                                    )
                                                }

                                            </span>

                                            #{index + 1}

                                        </td>

                                        {/* USERNAME */}

                                        <td
                                            className="username-cell"
                                        >

                                            {
                                                user?.username ||

                                                user?.name ||

                                                "Unknown User"
                                            }

                                        </td>

                                        {/* XP */}

                                        <td
                                            className="xp-cell"
                                        >

                                            <span className="xp-value">

                                                {
                                                    Math.round(
                                                        user?.xp || 0
                                                    )
                                                }

                                                {" "}XP

                                            </span>

                                        </td>

                                        {/* LEVEL */}

                                        <td>

                                            LVL {" "}

                                            {
                                                user?.level || 1
                                            }

                                        </td>

                                    </motion.tr>
                                ))}

                            </tbody>

                        </table>

                    </motion.div>

                ) : (

                    /* EMPTY */

                    <motion.div

                        className="no-data"

                        initial={{
                            opacity: 0,
                            y: 10
                        }}

                        animate={{
                            opacity: 1,
                            y: 0
                        }}
                    >

                        <div className="no-data-icon">
                            📊
                        </div>

                        <p>
                            No XP data available.
                        </p>

                        <p className="no-data-subtitle">

                            Start taking quizzes
                            to earn XP!

                        </p>

                    </motion.div>
                )}

            </AnimatePresence>

            {/* =========================================
               NOTIFICATIONS
            ========================================= */}

            <NotificationModal

                isOpen={
                    notification.isOpen
                }

                message={
                    notification.message
                }

                type={
                    notification.type
                }

                onClose={
                    hideNotification
                }

                autoClose={
                    notification.autoClose
                }
            />

        </motion.div>
    );
};

export default XPLeaderboard;