import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
    const navigate = useNavigate();
    const API_BASE = "http://localhost:5000/api/v1";

    // --- State ---
    const [user, setUser] = useState(null);
    const [topics, setTopics] = useState([]);
    const [subTopics, setSubTopics] = useState([]);
    const [posts, setPosts] = useState([]);
    const [errors, setErrors] = useState([]);

    const [selectedTopic, setSelectedTopic] = useState(null);
    const [selectedSubTopic, setSelectedSubTopic] = useState(null);

    const [postTitle, setPostTitle] = useState("");
    const [postDesc, setPostDesc] = useState("");
    const [editingPostId, setEditingPostId] = useState(null);

    const [newTopicName, setNewTopicName] = useState("");
    const [editingTopicId, setEditingTopicId] = useState(null);

    const [newSubTopicName, setNewSubTopicName] = useState("");
    const [subTopicParent, setSubTopicParent] = useState(null);
    const [editingSubTopicId, setEditingSubTopicId] = useState(null);

    const [modalOpenPost, setModalOpenPost] = useState(false);
    const [modalOpenTopic, setModalOpenTopic] = useState(false);
    const [modalOpenSubTopic, setModalOpenSubTopic] = useState(false);
    const [modalOpenProfile, setModalOpenProfile] = useState(false);

    const [newComments, setNewComments] = useState({});
    const [postSort, setPostSort] = useState("date_desc");

    // --- Profile edit states ---
    const [editFirstName, setEditFirstName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [editEmail, setEditEmail] = useState("");
    const [editPassword, setEditPassword] = useState("");
    const [editHobbies, setEditHobbies] = useState([]);
    // --- New states for All Users ---
    const [allUsers, setAllUsers] = useState([]);
    const [userFilter, setUserFilter] = useState("");

    // --- Fetch all users on init ---
    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const res = await fetchWithToken("/user/all");
                const data = await res.json();
                if (res.ok && Array.isArray(data.result)) {
                    setAllUsers(data.result);
                }
            } catch {
                setErrors(prev => [...prev, "Failed to fetch all users"]);
            }
        };
        fetchUsers();
    }, []);

    // --- Filtered users ---
    const filteredUsers = allUsers.filter((u) => {
        const search = userFilter.toLowerCase();
        const nameMatch =
            (u.first_name && u.first_name.toLowerCase().includes(search)) ||
            (u.last_name && u.last_name.toLowerCase().includes(search));
        const emailMatch = u.email && u.email.toLowerCase().includes(search);
        const hobbiesMatch =
            Array.isArray(u.hobbies) &&
            u.hobbies.some((h) => h.toLowerCase().includes(search));
        return nameMatch || emailMatch || hobbiesMatch;
    });

    // --- Fetch with token ---
    const fetchWithToken = async (url, options = {}) => {
        const token = localStorage.getItem("access_token");
        if (!token) navigate("/login");

        const res = await fetch(`${API_BASE}${url}`, {
            ...options,
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
                ...(options.headers || {}),
            },
        });

        if (res.status === 401) {
            localStorage.removeItem("access_token");
            localStorage.removeItem("refresh_token");
            navigate("/login");
        }

        return res;
    };

    // --- Initial data fetch ---
    useEffect(() => {
        const init = async () => {
            try {
                const userRes = await fetchWithToken("/user/user");
                const userData = await userRes.json();
                setUser(userData.result);

                const topicsRes = await fetchWithToken("/topic/topic");
                const topicsData = await topicsRes.json();
                setTopics(topicsData.result || []);

                const subTopicsRes = await fetchWithToken("/subtopic/subtopic");
                const subTopicsData = await subTopicsRes.json();
                setSubTopics(subTopicsData.result || []);

                await refreshPosts();
            } catch {
                setErrors(["Failed to fetch data from database"]);
            }
        };
        init();
    }, []);

    // --- Refresh posts ---
    const refreshPosts = async () => {
        try {
            const postRes = await fetchWithToken("/post/post");
            const postData = await postRes.json();
            const rows = postData.result || [];

            const postsArr = [];
            const postsMap = {};

            rows.forEach((row) => {
                const postId = Number(row.post_id);
                if (!postsMap[postId]) {
                    postsArr.push({
                        post_id: postId,
                        title: row.title,
                        description: row.description,
                        topic_id: row.post_topic_id,
                        topic_name: row.topic_name,
                        subtopic_id: row.post_sub_topic_id,
                        subtopic_name: row.subtopic_name,
                        post_user_first_name: row.post_user_first_name,
                        post_user_last_name: row.post_user_last_name,
                        post_user_id: row.post_user_id,
                        created_at: row.created_at || new Date().toISOString(),
                        comments: [],
                    });
                    postsMap[postId] = postsArr[postsArr.length - 1];
                }

                if (row.comment_id) {
                    postsMap[postId].comments.push({
                        comment_id: row.comment_id,
                        comment_text: row.comment_text,
                        comment_user_first_name: row.comment_user_first_name,
                        comment_user_id: row.comment_user_id,
                    });
                }
            });

            setPosts(postsArr);
        } catch {
            setErrors(["Failed to fetch posts from database"]);
        }
    };

    // --- Handlers ---
    const handleTopicChange = (e) => {
        const val = e.target.value;
        setSelectedTopic(val ? Number(val) : null);
        setSelectedSubTopic(null);
    };

    const handleSubTopicChange = (e) => {
        const val = e.target.value;
        setSelectedSubTopic(val ? Number(val) : null);
    };

    // --- Topic & Subtopic Handlers ---
    const handleAddTopic = async (e) => {
        e.preventDefault();
        if (!newTopicName.trim()) return;
        try {
            const method = editingTopicId ? "PUT" : "POST";
            const url = editingTopicId ? `/topic/edit/${editingTopicId}` : "/topic/newtopic";
            const res = await fetchWithToken(url, {
                method,
                body: JSON.stringify({ name: newTopicName.trim() }),
            });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to save topic"]);
                return;
            }
            setNewTopicName("");
            setEditingTopicId(null);
            closeModalTopicHandler();

            const topicsRes = await fetchWithToken("/topic/topic");
            const topicsData = await topicsRes.json();
            setTopics(topicsData.result || []);
        } catch {
            setErrors(["Failed to save topic"]);
        }
    };

    const handleDeleteTopic = async (id) => {
        if (!window.confirm("Are you sure you want to delete this topic?")) return;
        try {
            const res = await fetchWithToken(`/topic/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to delete topic"]);
                return;
            }
            const topicsRes = await fetchWithToken("/topic/topic");
            const topicsData = await topicsRes.json();
            setTopics(topicsData.result || []);
        } catch {
            setErrors(["Failed to delete topic"]);
        }
    };

    const handleAddSubTopic = async (e) => {
        e.preventDefault();
        if (!newSubTopicName.trim() || subTopicParent === null) {
            setErrors(["Please select parent topic and enter subtopic name"]);
            return;
        }
        try {
            const method = editingSubTopicId ? "PUT" : "POST";
            const url = editingSubTopicId ? `/subtopic/edit/${editingSubTopicId}` : "/subtopic/newsubtopic";

            const res = await fetchWithToken(url, {
                method,
                body: JSON.stringify({ name: newSubTopicName.trim(), topic_id: subTopicParent }),
            });
            const data = await res.json();

            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to save subtopic"]);
                return;
            }

            const subTopicsRes = await fetchWithToken("/subtopic/subtopic");
            const subTopicsData = await subTopicsRes.json();
            setSubTopics(subTopicsData.result || []);

            setNewSubTopicName("");
            setEditingSubTopicId(null);
            setSubTopicParent(null);
            closeModalSubTopicHandler();
        } catch {
            setErrors(["Failed to save subtopic"]);
        }
    };

    const handleDeleteSubTopic = async (id) => {
        if (!window.confirm("Are you sure you want to delete this subtopic?")) return;
        try {
            const res = await fetchWithToken(`/subtopic/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to delete subtopic"]);
                return;
            }
            const subTopicsRes = await fetchWithToken("/subtopic/subtopic");
            const subTopicsData = await subTopicsRes.json();
            setSubTopics(subTopicsData.result || []);
        } catch {
            setErrors(["Failed to delete subtopic"]);
        }
    };

    // --- Posts ---
    const handlePostSubmit = async (e) => {
        e.preventDefault();
        if (!postTitle.trim() || !postDesc.trim() || selectedTopic === null) {
            setErrors(["Please fill all required fields"]);
            return;
        }
        try {
            const url = editingPostId ? `/post/edit/${editingPostId}` : "/post/newpost";
            const method = editingPostId ? "PUT" : "POST";
            const res = await fetchWithToken(url, {
                method,
                body: JSON.stringify({
                    title: postTitle.trim(),
                    description: postDesc.trim(),
                    post_topic_id: selectedTopic,
                    post_sub_topic_id: selectedSubTopic || null,
                    user_id: user?.id,
                }),
            });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to save post"]);
                return;
            }
            await refreshPosts();
            setPostTitle("");
            setPostDesc("");
            setSelectedTopic(null);
            setSelectedSubTopic(null);
            setEditingPostId(null);
            closeModalPostHandler();
        } catch {
            setErrors(["Failed to save post"]);
        }
    };

    const handleDeletePost = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            const res = await fetchWithToken(`/post/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to delete post"]);
                return;
            }
            await refreshPosts();
        } catch {
            setErrors(["Failed to delete post"]);
        }
    };

    // --- Comments ---
    const handleCommentChange = (postId, text) => {
        setNewComments((prev) => ({ ...prev, [postId]: text }));
    };

    const handleCommentSubmit = async (postId) => {
        const commentText = newComments[postId]?.trim();
        if (!commentText) return;
        try {
            const res = await fetchWithToken("/comment/newcomment", {
                method: "POST",
                body: JSON.stringify({ comment: commentText, post_id: postId, user_id: user?.id }),
            });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to add comment"]);
                return;
            }
            await refreshPosts();
            setNewComments((prev) => ({ ...prev, [postId]: "" }));
        } catch {
            setErrors(["Failed to add comment"]);
        }
    };

    const handleDeleteComment = async (id) => {
        if (!window.confirm("Are you sure you want to delete this comment?")) return;
        try {
            const res = await fetchWithToken(`/comment/delete/${id}`, { method: "DELETE" });
            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to delete comment"]);
                return;
            }
            await refreshPosts();
        } catch {
            setErrors(["Failed to delete comment"]);
        }
    };

    // --- Logout ---
    const handleLogout = async () => {
        const confirmLogout = window.confirm("Are you sure you want to log out?");
        if (!confirmLogout) return;

        try {
            const res = await fetchWithToken("/user/logout", { method: "POST" });
            if (res.ok) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                navigate("/login");
            } else {
                const data = await res.json().catch(() => ({}));
                console.error("Logout failed:", data.message || "No JSON returned");
            }
        } catch (error) {
            console.error("Error during logout:", error);
        }
    };

    if (!user) return <p>Loading user...</p>;

    // --- Modal handlers with reset ---
    const openModalPostHandler = () => {
        setEditingPostId(null);
        setPostTitle("");
        setPostDesc("");
        setSelectedTopic(null);
        setSelectedSubTopic(null);
        setModalOpenPost(true);
    };
    const closeModalPostHandler = () => setModalOpenPost(false);

    const openModalTopicHandler = () => {
        setEditingTopicId(null);
        setNewTopicName("");
        setModalOpenTopic(true);
    };
    const closeModalTopicHandler = () => setModalOpenTopic(false);

    const openModalSubTopicHandler = () => {
        setEditingSubTopicId(null);
        setNewSubTopicName("");
        setSubTopicParent(null);
        setModalOpenSubTopic(true);
    };
    const closeModalSubTopicHandler = () => setModalOpenSubTopic(false);

    const openModalProfileHandler = () => {
        setEditFirstName(user.first_name || "");
        setEditLastName(user.last_name || "");
        setEditEmail(user.email || "");
        setEditPassword("");
        setEditHobbies(user.hobbies || []);
        setModalOpenProfile(true);
    };
    const closeModalProfileHandler = () => setModalOpenProfile(false);

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);

        // Prepare hobbies as an array, remove empty strings
        const hobbiesArray = editHobbies
            .map((h) => h.trim())
            .filter((h) => h !== "");

        // Prepare payload
        const payload = {
            first_name: editFirstName.trim() || undefined,
            last_name: editLastName.trim() || undefined,
            email: editEmail.trim() || undefined,
            hobbies: hobbiesArray.length > 0 ? hobbiesArray : undefined,
        };

        // Only send password if it's not empty
        if (editPassword.trim()) {
            payload.password = editPassword.trim();
        }

        try {
            const res = await fetchWithToken(`/user/edit/${user.id}`, {
                method: "PUT",
                body: JSON.stringify(payload),
            });

            const data = await res.json();
            if (!res.ok || data.status === false) {
                setErrors([data.error || "Failed to update profile"]);
                return;
            }

            setUser(data.result); // update local user state
            closeModalProfileHandler();
        } catch {
            setErrors(["Failed to update profile"]);
        }
    };


    // --- Client-side sorting ---
    const sortedPosts = [...posts].sort((a, b) => {
        switch (postSort) {
            case "date_asc":
                return new Date(a.created_at) - new Date(b.created_at);
            case "date_desc":
                return new Date(b.created_at) - new Date(a.created_at);
            case "title_asc":
                return a.title.localeCompare(b.title);
            case "title_desc":
                return b.title.localeCompare(a.title);
            default:
                return 0;
        }
    });

    return (
        <div style={{ maxWidth: "900px", margin: "20px auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h1>Welcome, {user.first_name}!</h1>
                <div>
                    <button onClick={openModalProfileHandler}>Edit Profile</button>
                    <button onClick={handleLogout}>Logout</button>
                </div>
            </div>

            {errors.length > 0 && (
                <ul style={{ color: "red" }}>
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                </ul>
            )}

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                <button onClick={openModalTopicHandler}>Add Topic</button>
                <button onClick={openModalSubTopicHandler}>Add SubTopic</button>
                <button onClick={openModalPostHandler}>Create Post</button>
            </div>

            <div style={{ marginTop: "20px" }}>
                <label style={{ marginRight: "10px" }}>Sort posts: </label>
                <select value={postSort} onChange={(e) => setPostSort(e.target.value)}>
                    <option value="date_desc">Newest first</option>
                    <option value="date_asc">Oldest first</option>
                    <option value="title_asc">Title ASCENDING</option>
                    <option value="title_desc">Title DESCENDING</option>
                </select>
            </div>
            {/* --- All Users Section --- */}
            <div style={{ marginTop: "40px" }}>
                <h2>All Users</h2>
                <input
                    type="text"
                    placeholder="Search by name, email, or hobbies..."
                    value={userFilter}
                    onChange={(e) => setUserFilter(e.target.value)}
                    style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
                />
                <ul>
                    {filteredUsers.map((u) => (
                        <li key={u.id} style={{ marginBottom: "5px" }}>
                            {u.first_name} {u.last_name} — {u.email}{" "}
                            {u.hobbies ? `| Hobbies: ${u.hobbies.join(", ")}` : ""}
                        </li>
                    ))}
                    {filteredUsers.length === 0 && <p>No users match your search.</p>}
                </ul>
            </div>

            {/* --- Modals --- */}
            {modalOpenTopic && (
                <Modal>
                    <h3>{editingTopicId ? "Edit Topic" : "Create Topic"}</h3>
                    <form onSubmit={handleAddTopic}>
                        <input
                            placeholder="Topic Name"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                            required
                        />
                        <button type="submit">{editingTopicId ? "Edit Topic" : "Create Topic"}</button>
                        <button type="button" onClick={closeModalTopicHandler}>Cancel</button>
                    </form>
                    <h4>Existing Topics</h4>
                    {topics.map((t) => (
                        <div key={t.id} style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                            <span>{t.name}</span>
                            <button onClick={() => handleDeleteTopic(t.id)}>Delete</button>
                        </div>
                    ))}
                </Modal>
            )}

            {modalOpenSubTopic && (
                <Modal>
                    <h3>{editingSubTopicId ? "Edit SubTopic" : "Create SubTopic"}</h3>
                    <form onSubmit={handleAddSubTopic}>
                        <select
                            value={subTopicParent ?? ""}
                            onChange={(e) => setSubTopicParent(Number(e.target.value))}
                            required
                        >
                            <option value="">Select Parent Topic</option>
                            {topics.map((t) => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))}
                        </select>
                        <input
                            placeholder="SubTopic Name"
                            value={newSubTopicName}
                            onChange={(e) => setNewSubTopicName(e.target.value)}
                            required
                        />
                        <button type="submit">{editingSubTopicId ? "Edit SubTopic" : "Create SubTopic"}</button>
                        <button type="button" onClick={closeModalSubTopicHandler}>Cancel</button>
                    </form>
                    <h4>Existing SubTopics</h4>
                    {subTopics.map((st) => (
                        <div key={st.id} style={{ display: "flex", justifyContent: "space-between", margin: "5px 0" }}>
                            <span>{st.name} (Parent Topic: {topics.find(t => t.id === st.topic_id)?.name || "-"})</span>
                            <button onClick={() => handleDeleteSubTopic(st.id)}>Delete</button>
                        </div>
                    ))}
                </Modal>
            )}

            {modalOpenPost && (
                <Modal>
                    <h3>{editingPostId ? "Edit Post" : "Create Post"}</h3>
                    <form onSubmit={handlePostSubmit}>
                        <input
                            placeholder="Post Title"
                            value={postTitle}
                            onChange={(e) => setPostTitle(e.target.value)}
                            required
                        />
                        <textarea
                            placeholder="Post Description"
                            value={postDesc}
                            onChange={(e) => setPostDesc(e.target.value)}
                            required
                        />
                        <select value={selectedTopic || ""} onChange={handleTopicChange} required>
                            <option value="">Select Topic</option>
                            {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <select value={selectedSubTopic || ""} onChange={handleSubTopicChange}>
                            <option value="">Select SubTopic (Optional)</option>
                            {subTopics
                                .filter((st) => st.topic_id === selectedTopic)
                                .map((st) => <option key={st.id} value={st.id}>{st.name}</option>)}
                        </select>
                        <button type="submit">{editingPostId ? "Edit Post" : "Create Post"}</button>
                        <button type="button" onClick={closeModalPostHandler}>Cancel</button>
                    </form>
                </Modal>
            )}

            {modalOpenProfile && (
                <Modal>
                    <h3>Edit Profile</h3>
                    <form onSubmit={handleProfileSubmit}>
                        <input
                            placeholder="First Name"
                            value={editFirstName}
                            onChange={(e) => setEditFirstName(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Last Name"
                            value={editLastName}
                            onChange={(e) => setEditLastName(e.target.value)}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={editEmail}
                            onChange={(e) => setEditEmail(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Password (leave blank to keep current)"
                            value={editPassword}
                            onChange={(e) => setEditPassword(e.target.value)}
                        />
                        <input
                            placeholder="Hobbies (comma separated)"
                            value={editHobbies.join(", ")}
                            onChange={(e) =>
                                setEditHobbies(e.target.value.split(",").map((h) => h.trim()))
                            }
                        />
                        <button type="submit">Update Profile</button>
                        <button type="button" onClick={closeModalProfileHandler}>Cancel</button>
                    </form>
                </Modal>
            )}

            {/* --- Display Posts --- */}
            <div style={{ marginTop: "20px" }}>
                {sortedPosts.map((post) => (
                    <div
                        key={post.post_id}
                        style={{
                            border: "1px solid gray",
                            padding: "10px",
                            margin: "10px 0"
                        }}
                    >
                        <h3>{post.title}</h3>
                        <p>{post.description}</p>
                        <p>
                            Topic: {post.topic_name} | SubTopic: {post.subtopic_name || "-"}
                        </p>

                        {/* --- ALWAYS VISIBLE EDIT BUTTON --- */}
                        <button
                            onClick={() => {
                                setEditingPostId(post.post_id);
                                setPostTitle(post.title);
                                setPostDesc(post.description);
                                setSelectedTopic(post.topic_id);
                                setSelectedSubTopic(post.subtopic_id);
                                setModalOpenPost(true);
                            }}
                        >
                            Edit Post
                        </button>

                        {/* --- ALWAYS VISIBLE DELETE BUTTON --- */}
                        <button onClick={() => handleDeletePost(post.post_id)}>
                            Delete Post
                        </button>

                        <div style={{ marginTop: "10px" }}>
                            <h4>Comments</h4>

                            {post.comments.map((c) => (
                                <div
                                    key={c.comment_id}
                                    style={{
                                        display: "flex",
                                        justifyContent: "space-between"
                                    }}
                                >
                                    <span>
                                        {c.comment_text} - {c.comment_user_first_name}
                                    </span>

                                    {user?.id === c.comment_user_id && (
                                        <button
                                            onClick={() =>
                                                handleDeleteComment(c.comment_id)
                                            }
                                        >
                                            Delete
                                        </button>
                                    )}
                                </div>
                            ))}

                            <input
                                placeholder="Add comment"
                                value={newComments[post.post_id] || ""}
                                onChange={(e) =>
                                    handleCommentChange(post.post_id, e.target.value)
                                }
                            />
                            <button onClick={() => handleCommentSubmit(post.post_id)}>
                                Add Comment
                            </button>
                        </div>
                    </div>
                ))}
            </div>

        </div>
    );
}

// --- Simple Modal Component ---
const Modal = ({ children }) => (
    <div style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000
    }}>
        <div style={{ background: "white", padding: "20px", borderRadius: "5px", width: "400px", maxHeight: "90vh", overflowY: "auto" }}>
            {children}
        </div>
    </div>
);
