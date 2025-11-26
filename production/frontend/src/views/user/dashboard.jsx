import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/v1";

  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [errors, setErrors] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedSubTopic, setSelectedSubTopic] = useState(null);

  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");

  const [newTopicName, setNewTopicName] = useState("");
  const [newSubTopicName, setNewSubTopicName] = useState("");
  const [subTopicParent, setSubTopicParent] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [subTopicModalOpen, setSubTopicModalOpen] = useState(false);
  const [newComments, setNewComments] = useState({}); // Track comment input per post

  // --- Fetch helper with token ---
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

  // --- Load initial data ---
  useEffect(() => {
    const init = async () => {
      try {
        const userData = await fetchWithToken("/user/user").then((r) => r.json());
        setUser(userData.result);

        const topicData = await fetchWithToken("/topic/topic").then((r) => r.json());
        setTopics(topicData.result || []);

        const subTopicData = await fetchWithToken("/subtopic/subtopic").then((r) => r.json());
        setSubTopics(subTopicData.result || []);

        await refreshPosts();
      } catch {
        setErrors(["Failed to fetch data"]);
      }
    };
    init();
  }, []);

  // --- Refresh posts ---
  const refreshPosts = async () => {
    try {
      const postData = await fetchWithToken("/post/post").then((r) => r.json());
      const rows = postData.result || [];
      const postsArr = [];
      const postsMap = {};

      rows.forEach((row) => {
        const numericPostId = Number(row.post_id);
        if (!postsMap[numericPostId]) {
          postsArr.push({
            post_id: numericPostId,
            title: row.title,
            description: row.description,
            topic_id: row.post_topic_id,
            topic_name: row.topic_name,
            subtopic_id: row.post_sub_topic_id,
            subtopic_name: row.subtopic_name,
            post_user_first_name: row.post_user_first_name,
            post_user_last_name: row.post_user_last_name,
            post_user_id: row.post_user_id,
            comments: [],
          });
          postsMap[numericPostId] = postsArr[postsArr.length - 1];
        }

        if (row.comment_id) {
          postsMap[numericPostId].comments.push({
            comment_id: row.comment_id,
            comment_text: row.comment_text,
            comment_user_first_name: row.comment_user_first_name,
          });
        }
      });

      setPosts(postsArr);
    } catch {
      setErrors(["Failed to fetch posts"]);
    }
  };

  // --- Modal handlers ---
  const openModal = () => setModalOpen(true);
  const closeModal = () => setModalOpen(false);
  const openSubTopicModal = () => setSubTopicModalOpen(true);
  const closeSubTopicModal = () => setSubTopicModalOpen(false);

  // --- Topic/Subtopic selection ---
  const handleTopicChange = (e) => {
    const val = e.target.value;
    setSelectedTopic(val !== "" ? Number(val) : null);
    setSelectedSubTopic(null);
  };

  const handleSubTopicChange = (e) => {
    const val = e.target.value;
    setSelectedSubTopic(val !== "" ? Number(val) : null);
  };

  // --- Add Topic ---
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const res = await fetchWithToken("/topic/newtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTopicName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create topic"]);
        return;
      }
      setNewTopicName("");
      const updatedTopics = await fetchWithToken("/topic/topic").then((r) => r.json());
      setTopics(updatedTopics.result || []);
    } catch {
      setErrors(["Failed to create topic"]);
    }
  };

  // --- Add SubTopic ---
  const handleAddSubTopic = async (e) => {
    e.preventDefault();
    if (!newSubTopicName.trim() || subTopicParent === null) {
      setErrors(["Please select parent topic and enter subtopic name"]);
      return;
    }

    try {
      const res = await fetchWithToken("/subtopic/newsubtopic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newSubTopicName.trim(),
          topic_id: subTopicParent,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create subtopic"]);
        return;
      }
      setNewSubTopicName("");
      setSubTopicParent(null);
      closeSubTopicModal();

      const updatedSubTopics = await fetchWithToken("/subtopic/subtopic").then((r) => r.json());
      setSubTopics(updatedSubTopics.result || []);
    } catch {
      setErrors(["Failed to create subtopic"]);
    }
  };

  // --- Create Post ---
  const handlePostSubmit = async (e) => {
    e.preventDefault();

    if (!postTitle.trim() || !postDesc.trim() || selectedTopic === null) {
      setErrors(["Please fill all required fields"]);
      return;
    }

    const bodyData = {
      title: postTitle.trim(),
      description: postDesc.trim(),
      post_topic_id: selectedTopic,
      post_sub_topic_id: selectedSubTopic || null,
      user_id: user?.id,
    };

    try {
      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create post"]);
        return;
      }

      await refreshPosts();
      setPostTitle("");
      setPostDesc("");
      setSelectedTopic(null);
      setSelectedSubTopic(null);
      closeModal();
    } catch {
      setErrors(["Failed to create post"]);
    }
  };

  // --- Handle comment input ---
  const handleCommentChange = (postId, text) => {
    setNewComments((prev) => ({ ...prev, [postId]: text }));
  };

  // --- Submit comment ---
  const handleCommentSubmit = async (postId) => {
    const commentText = newComments[postId]?.trim();
    if (!commentText) return;

    try {
      const res = await fetchWithToken("/comment/newcomment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comment: commentText,
          post_id: postId,
          user_id: user?.id,
        }),
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div style={{ maxWidth: "900px", margin: "20px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h1>Welcome, {user.first_name}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {/* Buttons to open Topic/SubTopic modals */}
      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={openModal}>Add Topic / Create Post</button>
        <button onClick={openSubTopicModal}>Add SubTopic</button>
      </div>

      {/* SubTopic Modal */}
      {subTopicModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <h3>Create SubTopic</h3>
            <form onSubmit={handleAddSubTopic}>
              <select
                value={subTopicParent ?? ""}
                onChange={(e) =>
                  setSubTopicParent(e.target.value !== "" ? Number(e.target.value) : null)
                }
              >
                <option value="">Select Parent Topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <input
                placeholder="SubTopic Name"
                value={newSubTopicName}
                onChange={(e) => setNewSubTopicName(e.target.value)}
              />
              <button type="submit">Create SubTopic</button>
              <button type="button" onClick={closeSubTopicModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Existing Create Post Modal */}
      {modalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              width: "400px",
              borderRadius: "8px",
            }}
          >
            <h3>Create Post</h3>
            <form onSubmit={handlePostSubmit}>
              <select value={selectedTopic ?? ""} onChange={handleTopicChange}>
                <option value="">Select Topic</option>
                {topics.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>

              {subTopics.filter((st) => st.topic_id === selectedTopic).length > 0 && (
                <select value={selectedSubTopic ?? ""} onChange={handleSubTopicChange}>
                  <option value="">Select Subtopic (optional)</option>
                  {subTopics
                    .filter((st) => st.topic_id === selectedTopic)
                    .map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                </select>
              )}

              <input
                placeholder="Post Title"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              <textarea
                placeholder="Post Description"
                value={postDesc}
                onChange={(e) => setPostDesc(e.target.value)}
              />
              <button type="submit">Post</button>
              <button type="button" onClick={closeModal}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Display Posts + Comments */}
      {posts.map((p) => (
        <div
          key={p.post_id}
          style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}
        >
          <h4>
            Topic: {p.topic_name}
            {p.subtopic_name ? ` / ${p.subtopic_name}` : ""}
          </h4>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>
            By {p.post_user_first_name} {p.post_user_last_name}
          </small>

          {/* Comments */}
          {p.comments.map((c) => (
            <p key={c.comment_id} style={{ marginLeft: "20px" }}>
              <strong>{c.comment_user_first_name}:</strong> {c.comment_text}
            </p>
          ))}

          {/* Add Comment */}
          <div style={{ marginTop: "10px" }}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComments[p.post_id] || ""}
              onChange={(e) => handleCommentChange(p.post_id, e.target.value)}
            />
            <button onClick={() => handleCommentSubmit(p.post_id)}>Comment</button>
          </div>
        </div>
      ))}
    </div>
  );
}
