import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors([]);
        setMessage("");
        setLoading(true);

<<<<<<< HEAD
    try {
      const res = await fetch("http://localhost:5000/api/v1/unauth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password, user_level_id: 2 }),
      });
=======
        try {
            const res = await fetch("/api/v1/unauth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    user_level_id: 2, // default: normal user, not admin
                }),
            });
>>>>>>> 58109654c2a460d2b7ee0fa08d3c023fbb3c6e76

            const data = await res.json();

            if (!res.ok || data.status === false) {
                if (data.errors && Array.isArray(data.errors)) {
                    setErrors(data.errors);
                } else if (data.error) {
                    setErrors([data.error]);
                } else {
                    setErrors(["Registration failed."]);
                }
                setLoading(false);
                return;
            }

            // Success message from backend
            setMessage(data.message || "Registration successful! Redirecting to login...");

            // Redirect after 2 sec
            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            setErrors(["Something went wrong. Try again."]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto" }}>
            <h1>User Registration</h1>

            {errors.length > 0 && (
                <ul style={{ color: "red" }}>
                    {errors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                    ))}
                </ul>
            )}

            {message && (
                <p style={{ color: "green", fontWeight: "bold" }}>{message}</p>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: "10px" }}>
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>

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
                    {loading ? "Registering..." : "Register"}
                </button>
            </form>

            <p>
                Already have an account? <a href="/login">Login here</a>
            </p>
        </div>
    );
}
