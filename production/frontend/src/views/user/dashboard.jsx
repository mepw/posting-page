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

  const [newComments, setNewComments] = useState({});
  const [postSort, setPostSort] = useState("date_desc");

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

  // --- Load data ---
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

  // Refresh posts whenever sort changes
  useEffect(() => {
    refreshPosts();
  }, [postSort]);

  const refreshPosts = async () => {
    try {
      const query = postSort ? `?sort=${postSort}` : "";
      const postRes = await fetchWithToken(`/post/post${query}`);
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
            comment_user_id: row.comment_user_id,
          });
        }
      });

      // --- FRONTEND SORTING FIX ---
      let sorted = [...postsArr];

      if (postSort === "date_desc") {
        sorted.sort((a, b) => b.post_id - a.post_id); 
      } else if (postSort === "date_asc") {
        sorted.sort((a, b) => a.post_id - b.post_id); 
      } else if (postSort === "title_asc") {
        sorted.sort((a, b) => a.title.localeCompare(b.title)); 
      } else if (postSort === "title_desc") {
        sorted.sort((a, b) => b.title.localeCompare(a.title));
      }

      setPosts(sorted);

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

  // --- Topics ---
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

  // --- SubTopics ---
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

      setNewSubTopicName("");
      setSubTopicParent(null);
      setEditingSubTopicId(null);
      closeModalSubTopicHandler();

      const subTopicsRes = await fetchWithToken("/subtopic/subtopic");
      const subTopicsData = await subTopicsRes.json();
      setSubTopics(subTopicsData.result || []);
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (!user) return <p>Loading user...</p>;

  // --- Modal handlers ---
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

      {/* --- Sorting Dropdown --- */}
      <div style={{ marginTop: "20px" }}>
        <label style={{ marginRight: "10px" }}>Sort posts: </label>
        <select value={postSort} onChange={(e) => setPostSort(e.target.value)}>
          <option value="date_desc">Newest first</option>
          <option value="date_asc">Oldest first</option>
          <option value="title_asc">Title ASCENDING</option>
          <option value="title_desc">Title DESCENDING</option>
        </select>
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
              <span>{st.name} (Parent: {topics.find((t) => t.id === st.topic_id)?.name || "Unknown"})</span>
              <button onClick={() => handleDeleteSubTopic(st.id)}>Delete</button>
            </div>
          ))}
        </Modal>
      )}

      {modalOpenPost && (
        <Modal>
          <h3>{editingPostId ? "Edit Post" : "Create Post"}</h3>
          <form onSubmit={handlePostSubmit}>
            <select value={selectedTopic ?? ""} onChange={handleTopicChange} required>
              <option value="">Select Topic</option>
              {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
            <select
              value={selectedSubTopic ?? ""}
              onChange={handleSubTopicChange}
              disabled={!selectedTopic || subTopics.filter((st) => st.topic_id === selectedTopic).length === 0}
            >
              <option value="">
                {selectedTopic && subTopics.filter((st) => st.topic_id === selectedTopic).length > 0
                  ? "Select Subtopic (optional)"
                  : "No subtopics yet"}
              </option>
              {subTopics.filter((st) => st.topic_id === selectedTopic).map((st) => (
                <option key={st.id} value={st.id}>{st.name}</option>
              ))}
            </select>
            <input placeholder="Post Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} required />
            <textarea placeholder="Post Description" value={postDesc} onChange={(e) => setPostDesc(e.target.value)} required />
            <button type="submit">{editingPostId ? "Update Post" : "Create Post"}</button>
            <button type="button" onClick={closeModalPostHandler}>Cancel</button>
          </form>
        </Modal>
      )}

      {/* --- Posts List --- */}
      <div style={{ marginTop: "30px" }}>
        {posts.length === 0 ? <p>No posts yet.</p> :
          posts.map((p) => (
            <div key={p.post_id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "15px" }}>
              <h3>{p.title} <small>({p.topic_name}{p.subtopic_name ? " / " + p.subtopic_name : ""})</small></h3>
              <p>{p.description}</p>
              <p><i>By: {p.post_user_first_name} {p.post_user_last_name}</i></p>
              {p.post_user_id === user.id && <button onClick={() => { setEditingPostId(p.post_id); setPostTitle(p.title); setPostDesc(p.description); setSelectedTopic(p.topic_id); setSelectedSubTopic(p.subtopic_id); openModalPostHandler(); }}>Edit</button>}
              {p.post_user_id === user.id && <button onClick={() => handleDeletePost(p.post_id)}>Delete</button>}
              <div style={{ marginTop: "10px" }}>
                <h4>Comments:</h4>
                {p.comments.map((c) => (
                  <div key={c.comment_id} style={{ display: "flex", justifyContent: "space-between" }}>
                    <span><b>{c.comment_user_first_name}:</b> {c.comment_text}</span>
                    {c.comment_user_id === user.id && <button onClick={() => handleDeleteComment(c.comment_id)}>Delete</button>}
                  </div>
                ))}
                <input
                  placeholder="Add comment..."
                  value={newComments[p.post_id] || ""}
                  onChange={(e) => handleCommentChange(p.post_id, e.target.value)}
                />
                <button onClick={() => handleCommentSubmit(p.post_id)}>Add Comment</button>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

// --- Simple Modal Component ---
function Modal({ children }) {
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100%", height: "100%",
      backgroundColor: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center"
    }}>
      <div style={{ background: "#fff", padding: "20px", borderRadius: "5px", width: "400px", maxHeight: "90%", overflowY: "auto" }}>
        {children}
      </div>
    </div>
  );
}
