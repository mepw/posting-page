import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    // Clear tokens on component mount
    useEffect(() => {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        try {
            const res = await fetch("/api/v1/unauth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok || data.status === false) {
                if (data.errors && Array.isArray(data.errors)) setErrors(data.errors);
                else if (data.error) setErrors([data.error]);
                else setErrors(["Login failed."]);
                return;
            }

            // Save tokens after successful login
            localStorage.setItem("access_token", data.result.access_token);
            localStorage.setItem("refresh_token", data.result.refresh_token);

            navigate("/dashboard");
        } catch (err) {
            setErrors(["Something went wrong. Try again."]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h1>User Login</h1>

            {errors.length > 0 && (
                <ul style={{ color: "red" }}>
                    {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                    ))}
                </ul>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </div>

                <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <p>
                Don't have an account? <a href="/register">Register here</a>
            </p>
        </div>
    );
}
