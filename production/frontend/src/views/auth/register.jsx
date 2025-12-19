import { useState } from "react";
import { useNavigate } from "react-router-dom";

// HobbiesInput component with only preset suggestions
function HobbiesInput({ hobbies, setHobbies }) {
    // Suggested hobbies
    const suggestedHobbies = [
        "Playing basketball",
        "Playing chess",
        "Eating",
        "Reading books",
        "Traveling",
        "Watching movies",
        "Cooking",
        "Gaming",
        "Drawing",
        "Swimming"
    ];

    const addHobby = (hobby) => {
        if (hobby && !hobbies.includes(hobby)) {
            setHobbies([...hobbies, hobby]);
        }
    };

    const handleRemoveHobby = (hobbyToRemove) => {
        setHobbies(hobbies.filter((hobby) => hobby !== hobbyToRemove));
    };

    return (
        <div style={{ marginBottom: "10px" }}>
            <label>Hobbies:</label>

            {/* Selected hobbies */}
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

            {/* Suggested hobbies */}
            <div style={{ marginBottom: "10px" }}>
                <p style={{ margin: 0 }}>Suggested hobbies:</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginTop: "5px" }}>
                    {suggestedHobbies.map((hobby, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => addHobby(hobby)}
                            style={{
                                background: "#f5f5f5",
                                border: "1px solid #ccc",
                                padding: "5px 10px",
                                borderRadius: "12px",
                                cursor: "pointer",
                            }}
                        >
                            {hobby}
                        </button>
                    ))}
                </div>
            </div>
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
            // Only send selected hobbies
            const validHobbies = hobbies.map((h) => h.trim()).filter((h) => h.length > 0);

            if (validHobbies.length === 0) {
                setErrors(["Please select at least one hobby."]);
                setLoading(false);
                return;
            }

            const res = await fetch("/api/v1/unauth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    password,
                    user_level_id: 2,
                    hobbies: validHobbies,
                }),
            });

            const data = await res.json();

            if (!res.ok || data.status === false) {
                const formattedErrors = [];
                if (data.errors && Array.isArray(data.errors)) {
                    data.errors.forEach((err) => {
                        if (typeof err === "string") {
                            formattedErrors.push(err);
                        } else if (typeof err === "object" && err !== null) {
                            if (err.issues && Array.isArray(err.issues)) {
                                formattedErrors.push(err.issues.join(", "));
                            } else if (err.message) {
                                formattedErrors.push(err.message);
                            } else {
                                formattedErrors.push(JSON.stringify(err));
                            }
                        } else {
                            formattedErrors.push(String(err));
                        }
                    });
                } else if (data.error) {
                    formattedErrors.push(data.error);
                } else {
                    formattedErrors.push("Registration failed.");
                }
                setErrors(formattedErrors);
                setLoading(false);
                return;
            }

            setMessage(data.message || "Registration successful! Redirecting to login...");

            setTimeout(() => {
                navigate("/login");
            }, 2000);

        } catch (err) {
            console.error(err);
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
                        <li key={idx}>{typeof err === "string" ? err : JSON.stringify(err)}</li>
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
