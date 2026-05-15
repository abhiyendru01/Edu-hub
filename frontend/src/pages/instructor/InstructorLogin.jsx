import React, {
    useState,
    useContext,
} from "react";

import {
    useNavigate,
    Link,
} from "react-router-dom";

import "../../pages/Login.css";
import "../../App.css";
import "./InstructorLogin.css";

import axios from "../../utils/axios";
import { ThemeContext } from "../../context/ThemeContext";

import NotificationModal from "../../components/NotificationModal";

import { useNotification } from "../../hooks/useNotification";

import Loading from "../../components/Loading";

const InstructorLogin = () => {
    const [email, setEmail] =
        useState("");

    const [password, setPassword] =
        useState("");

    const [loading, setLoading] =
        useState(false);

    const [showPassword, setShowPassword] =
        useState(false);

    const navigate = useNavigate();

    const { changeTheme } =
        useContext(ThemeContext);

    const {
        notification,
        showError,
        hideNotification,
    } = useNotification();

    // Instructor Login

   const handleLogin = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
        const res = await axios.post(
            "/api/users/login",
            {
                email,
                password,
            }
        );

        const responseData = res.data;

        if (
            !responseData ||
            !responseData.token ||
            !responseData.user
        ) {
            throw new Error("Login failed");
        }

        // ONLY ADMIN / INSTRUCTOR
        if (
            responseData.user.role !== "premium" &&
            responseData.user.role !== "admin"
        ) {
            showError(
                "Instructor access only"
            );

            return;
        }

        // SAVE TOKEN
        localStorage.setItem(
            "token",
            responseData.token
        );

        // SAVE USER
        localStorage.setItem(
            "user",
            JSON.stringify(
                responseData.user
            )
        );

        changeTheme(
            responseData.user.selectedTheme ||
            "Default"
        );

        // GO TO INSTRUCTOR DASHBOARD
        navigate("/admin");

    } catch (error) {
        console.error(error);

        showError(
            error.response?.data?.message ||
            "Invalid instructor credentials"
        );
    } finally {
        setLoading(false);
    }
};

    return (
        <div className="modern-auth-container instructor-auth">
            {/* BACKGROUND */}

            <div className="instructor-bg" />

            <div className="floating-elements">
                <div className="floating-orb orb-1"></div>

                <div className="floating-orb orb-2"></div>

                <div className="floating-orb orb-3"></div>
            </div>

            {/* CARD */}

            <div className="auth-card instructor-card">
                {/* LOGO */}

                <div className="instructor-logo">
                    🎓
                </div>

                {/* HEADER */}

                <div className="auth-header">
                    <h1>
                        Instructor Portal
                    </h1>

                    
                </div>

                {/* FORM */}

                <form
                    onSubmit={handleLogin}
                    className="auth-form"
                >
                    {/* EMAIL */}

                    <div className="input-group">
                        <label>
                            Instructor Email
                        </label>

                        <div className="input-wrapper">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) =>
                                    setEmail(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Enter your email"
                                required
                                disabled={
                                    loading
                                }
                            />
                        </div>
                    </div>

                    {/* PASSWORD */}

                    <div className="input-group">
                        <label>
                            Password
                        </label>

                        <div className="input-wrapper">
                            <input
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                value={
                                    password
                                }
                                onChange={(e) =>
                                    setPassword(
                                        e.target
                                            .value
                                    )
                                }
                                placeholder="Enter your password"
                                required
                                disabled={
                                    loading
                                }
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(
                                        !showPassword
                                    )
                                }
                            >
                                {showPassword
                                    ? "👁️"
                                    : "👁️‍🗨️"}
                            </button>
                        </div>
                    </div>

                    {/* LOGIN BUTTON */}

                    <button
                        type="submit"
                        className="auth-btn instructor-btn"
                        disabled={loading}
                    >
                        <span>
                            {loading
                                ? "Signing In..."
                                : "Enter Instructor Dashboard"}
                        </span>
                    </button>
                </form>


                {/* FOOTER */}

                <div className="auth-footer">
                    <p>
                        Student account?{" "}
                        <Link to="/login">
                            Go to Student Login
                        </Link>
                    </p>
                </div>
            </div>

            {/* LOADING */}

            {loading && (
                <Loading fullScreen />
            )}

            {/* NOTIFICATIONS */}

            <NotificationModal
                isOpen={notification.isOpen}
                message={
                    notification.message
                }
                type={notification.type}
                onClose={
                    hideNotification
                }
                autoClose={
                    notification.autoClose
                }
            />
        </div>
    );
};

export default InstructorLogin;