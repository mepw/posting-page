import { useState } from "react";
import { useNavigate } from "react-router-dom";

// HobbiesInput component
function HobbiesInput({ hobbies, setHobbies }) {
    const [inputValue, setInputValue] = useState("");

    const handleAddHobby = (e) => {
        e.preventDefault();
        const value = inputValue.trim();
        if (value && typeof value === "string" && !hobbies.includes(value)) {
            setHobbies([...hobbies, value]);
        }
        setInputValue("");
    };

    const handleRemoveHobby = (hobbyToRemove) => {
        setHobbies(hobbies.filter((hobby) => hobby !== hobbyToRemove));
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleAddHobby(e);
        }
    };

    return (
        <div style={{ marginBottom: "10px" }}>
            <label>Hobbies:</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", margin: "5px 0" }}>
                {hobbies.map((hobby, idx) => (
                    <div
                        key={idx}
                        style={{
                            background: "#e0e0e0",
                            padding: "5px 10px",
                            borderRadius: "15px",
                            display: "flex",
                            alignItems: "center",
                        }}
                    >
                        <span>{hobby}</span>
                        <button
                            type="button"
                            onClick={() => handleRemoveHobby(hobby)}
                            style={{
                                marginLeft: "5px",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold",
                            }}
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
            <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a hobby and press Enter"
                style={{ width: "100%", padding: "5px" }}
            />
            <button type="button" onClick={handleAddHobby} style={{ marginTop: "5px" }}>
                Add Hobby
            </button>
        </div>
    );
}

// Main Register component
export default function Register() {
    const navigate = useNavigate();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hobbies, setHobbies] = useState([]); // array of strings
    const [errors, setErrors] = useState([]);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        setErrors([]);
        setMessage("");
        setLoading(true);

        try {
            // Validate hobbies: ensure only strings and remove empty
            const validHobbies = hobbies
                .map((h) => h.trim())
                .filter((h) => h.length > 0);

            const res = await fetch("/api/v1/unauth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    user_level_id: 2,
                    hobbies 
                }),
            });

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

            setMessage(data.message || "Registration successful! Redirecting to login...");

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
                        required
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div style={{ marginBottom: "10px" }}>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                {/* Dynamic Hobbies Input */}
                <HobbiesInput hobbies={hobbies} setHobbies={setHobbies} />

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
