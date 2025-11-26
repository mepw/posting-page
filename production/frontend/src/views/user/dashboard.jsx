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

  const [modalOpenPost, setModalOpenPost] = useState(false);
  const [modalOpenTopic, setModalOpenTopic] = useState(false);
  const [modalOpenSubTopic, setModalOpenSubTopic] = useState(false);

  const [newComments, setNewComments] = useState({});

  // --- Fetch helper ---
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

  // --- Load user, topics, subtopics, posts ---
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
            comments: [],
          });
          postsMap[postId] = postsArr[postsArr.length - 1];
        }

        if (row.comment_id) {
          postsMap[postId].comments.push({
            comment_id: row.comment_id,
            comment_text: row.comment_text,
            comment_user_first_name: row.comment_user_first_name,
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

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const res = await fetchWithToken("/topic/newtopic", {
        method: "POST",
        body: JSON.stringify({ name: newTopicName.trim() }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create topic"]);
        return;
      }
      setNewTopicName("");
      closeModalTopicHandler();

      const topicsRes = await fetchWithToken("/topic/topic");
      const topicsData = await topicsRes.json();
      setTopics(topicsData.result || []);
    } catch {
      setErrors(["Failed to create topic"]);
    }
  };

  const handleAddSubTopic = async (e) => {
    e.preventDefault();
    if (!newSubTopicName.trim() || subTopicParent === null) {
      setErrors(["Please select parent topic and enter subtopic name"]);
      return;
    }

    try {
      const res = await fetchWithToken("/subtopic/newsubtopic", {
        method: "POST",
        body: JSON.stringify({ name: newSubTopicName.trim(), post_topic_id: subTopicParent }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create subtopic"]);
        return;
      }
      setNewSubTopicName("");
      setSubTopicParent(null);
      closeModalSubTopicHandler();

      const subTopicsRes = await fetchWithToken("/subtopic/subtopic");
      const subTopicsData = await subTopicsRes.json();
      setSubTopics(subTopicsData.result || []);
    } catch {
      setErrors(["Failed to create subtopic"]);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim() || selectedTopic === null) {
      setErrors(["Please fill all required fields"]);
      return;
    }

    try {
      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
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
        setErrors([data.error || "Failed to create post"]);
        return;
      }
      await refreshPosts();
      setPostTitle("");
      setPostDesc("");
      setSelectedTopic(null);
      setSelectedSubTopic(null);
      closeModalPostHandler();
    } catch {
      setErrors(["Failed to create post"]);
    }
  };

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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (!user) return <p>Loading user...</p>;

  // Modal handlers
  const openModalPostHandler = () => setModalOpenPost(true);
  const closeModalPostHandler = () => setModalOpenPost(false);
  const openModalTopicHandler = () => setModalOpenTopic(true);
  const closeModalTopicHandler = () => setModalOpenTopic(false);
  const openModalSubTopicHandler = () => setModalOpenSubTopic(true);
  const closeModalSubTopicHandler = () => setModalOpenSubTopic(false);

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

      <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
        <button onClick={openModalTopicHandler}>Add Topic</button>
        <button onClick={openModalSubTopicHandler}>Add SubTopic</button>
        <button onClick={openModalPostHandler}>Create Post</button>
      </div>

      {/* Topic Modal */}
      {modalOpenTopic && (
        <Modal>
          <h3>Create Topic</h3>
          <form onSubmit={handleAddTopic}>
            <input
              placeholder="Topic Name"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              required
            />
            <button type="submit">Create Topic</button>
            <button type="button" onClick={closeModalTopicHandler}>
              Cancel
            </button>
          </form>
        </Modal>
      )}

      {/* SubTopic Modal */}
      {modalOpenSubTopic && (
        <Modal>
          <h3>Create SubTopic</h3>
          <form onSubmit={handleAddSubTopic}>
            <select
              value={subTopicParent ?? ""}
              onChange={(e) => setSubTopicParent(e.target.value ? Number(e.target.value) : null)}
              required
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
              required
            />
            <button type="submit">Create SubTopic</button>
            <button type="button" onClick={closeModalSubTopicHandler}>
              Cancel
            </button>
          </form>
        </Modal>
      )}

      {/* Post Modal */}
      {modalOpenPost && (
        <Modal>
          <h3>Create Post</h3>
          <form onSubmit={handlePostSubmit}>
            <select value={selectedTopic ?? ""} onChange={handleTopicChange} required>
              <option value="">Select Topic</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>

            <select
              value={selectedSubTopic ?? ""}
              onChange={handleSubTopicChange}
              disabled={!selectedTopic || subTopics.filter((st) => st.post_topic_id === selectedTopic).length === 0}
            >
              <option value="">
                {subTopics.filter((st) => st.post_topic_id === selectedTopic).length > 0
                  ? "Select Subtopic (optional)"
                  : "No subtopics yet"}
              </option>
              {subTopics
                .filter((st) => st.post_topic_id === selectedTopic)
                .map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name}
                  </option>
                ))}
            </select>

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
            <button type="submit">Post</button>
            <button type="button" onClick={closeModalPostHandler}>
              Cancel
            </button>
          </form>
        </Modal>
      )}

      {/* Posts */}
      {posts.map((p) => (
        <div key={p.post_id} style={{ border: "1px solid #ccc", padding: "10px", marginTop: "10px" }}>
          <h4>
            Topic: {p.topic_name}
            {p.subtopic_name ? ` / ${p.subtopic_name}` : ""}
          </h4>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>
            By {p.post_user_first_name} {p.post_user_last_name}
          </small>

          {p.comments.map((c) => (
            <p key={c.comment_id} style={{ marginLeft: "20px" }}>
              <strong>{c.comment_user_first_name}:</strong> {c.comment_text}
            </p>
          ))}

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

// Reusable Modal
const Modal = ({ children }) => (
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
    <div style={{ background: "#fff", padding: "20px", width: "400px", borderRadius: "8px" }}>
      {children}
    </div>
  </div>
);
