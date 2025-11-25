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
  const [commentText, setCommentText] = useState({});

  const [newTopicName, setNewTopicName] = useState("");
  const [newSubTopicName, setNewSubTopicName] = useState("");
  const [subTopicParent, setSubTopicParent] = useState(null);

  // --- Helper for fetch with token ---
  const fetchWithToken = async (url, options = {}) => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      throw new Error("No access token");
    }

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
      throw new Error("Unauthorized");
    }

    return res;
  };

  // --- Fetch user ---
  const fetchUser = async () => {
    try {
      const res = await fetchWithToken("/user/user");
      const data = await res.json();
      if (!res.ok || !data.result?.id) {
        navigate("/login");
        return;
      }
      setUser(data.result);
    } catch {
      navigate("/login");
    }
  };

  // --- Fetch topics and subtopics ---
  const fetchTopics = async () => {
    try {
      const res = await fetchWithToken("/topic/topic");
      const data = await res.json();
      setTopics(data.result || []);
    } catch {
      setErrors(["Failed to fetch topics"]);
    }
  };

  const fetchSubTopics = async () => {
    try {
      const res = await fetchWithToken("/subtopic/subtopic");
      const data = await res.json();
      setSubTopics(data.result || []);
    } catch {
      setErrors(["Failed to fetch subtopics"]);
    }
  };

  // --- Fetch posts ---
  const fetchPosts = async () => {
    try {
      const res = await fetchWithToken("/post/post");
      const data = await res.json();
      const rows = data.result || [];

      const postsArr = [];
      const postsMap = {};

      rows.forEach((row) => {
        const numericPostId = Number(row.post_id);
        if (!postsMap[numericPostId]) {
          postsArr.push({
            post_id: numericPostId,
            title: row.title,
            description: row.description,
            topic_id: row.topic_id,
            topic_name: row.topic_name,
            subtopic_id: row.subtopic_id,
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

  useEffect(() => {
    fetchUser();
    fetchTopics();
    fetchSubTopics();
    fetchPosts();
  }, []);

  // --- Handlers ---
  const handleTopicChange = (e) => {
    const value = e.target.value;
    setSelectedTopic(value ? parseInt(value, 10) : null);
    setSelectedSubTopic(null);
  };

  const handleSubTopicChange = (e) => {
    const value = e.target.value;
    setSelectedSubTopic(value ? parseInt(value, 10) : null);
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
      fetchTopics();
      setNewTopicName("");
    } catch {
      setErrors(["Failed to create topic"]);
    }
  };

  const handleAddSubTopic = async (e) => {
    e.preventDefault();
    if (!newSubTopicName.trim() || !subTopicParent) {
      setErrors(["Please select a parent topic and enter a subtopic name."]);
      return;
    }

    try {
      const res = await fetchWithToken("/subtopic/newsubtopic", {
        method: "POST",
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
      fetchSubTopics();
      setNewSubTopicName("");
      setSubTopicParent(null);
    } catch {
      setErrors(["Failed to create subtopic"]);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();

    // Make sure topic is selected
    if (!postTitle.trim() || !postDesc.trim() || !selectedTopic) {
      setErrors(["Please fill all required fields"]);
      return;
    }

    // Convert strings to numbers safely
    const topicId = parseInt(selectedTopic, 10);
    const subTopicId = selectedSubTopic ? parseInt(selectedSubTopic, 10) : null;

    if (isNaN(topicId)) {
      setErrors(["Invalid topic selected"]);
      return;
    }

    const payload = {
      title: postTitle.trim(),
      description: postDesc.trim(),
      post_topic_id: topicId,
      post_sub_topic_id: subTopicId,
      user_id: user.id,
    };

    console.log("Payload to backend:", payload); // Must show numbers, never NaN

    try {
      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create post"]);
        return;
      }
      fetchPosts();
      setPostTitle("");
      setPostDesc("");
      setSelectedTopic("");
      setSelectedSubTopic("");
    } catch {
      setErrors(["Failed to create post"]);
    }
  };


  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const numericPostId = Number(postId);
    const comment = (commentText[numericPostId] || "").trim();
    if (!comment) return;

    try {
      const res = await fetchWithToken("/comment/newcomment", {
        method: "POST",
        body: JSON.stringify({ post_id: numericPostId, comment }),
      });
      const data = await res.json();

      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to add comment"]);
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) =>
          p.post_id === numericPostId
            ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  comment_id: data.result.id,
                  comment_text: comment,
                  comment_user_first_name: user.first_name,
                },
              ],
            }
            : p
        )
      );
      setCommentText({ ...commentText, [numericPostId]: "" });
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
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
        <h1>Welcome, {user.first_name}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      {/* Add Topic */}
      <form onSubmit={handleAddTopic} style={{ marginBottom: "10px" }}>
        <input
          placeholder="New Topic Name"
          value={newTopicName}
          onChange={(e) => setNewTopicName(e.target.value)}
          style={{ width: "60%", padding: "6px" }}
        />
        <button type="submit" style={{ marginLeft: "5px" }}>Add Topic</button>
      </form>

      {/* Add SubTopic */}
      <form onSubmit={handleAddSubTopic} style={{ marginBottom: "20px" }}>
        <select
          value={subTopicParent ?? ""}
          onChange={(e) => setSubTopicParent(e.target.value ? parseInt(e.target.value, 10) : null)}
          style={{ padding: "6px" }}
        >
          <option value="">Select Parent Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>
        <input
          placeholder="New SubTopic Name"
          value={newSubTopicName}
          onChange={(e) => setNewSubTopicName(e.target.value)}
          style={{ width: "50%", padding: "6px", marginLeft: "5px" }}
        />
        <button type="submit" style={{ marginLeft: "5px" }}>Add SubTopic</button>
      </form>

      {/* Create Post */}
      <form onSubmit={handlePostSubmit} style={{ marginBottom: "20px" }}>
        <select value={selectedTopic ?? ""} onChange={handleTopicChange} required>
          <option value="">Select Topic</option>
          {topics.map((t) => <option key={t.id} value={t.id.toString()}>{t.name}</option>
          )}
        </select>

        {subTopics.filter(st => st.topic_id === selectedTopic).length > 0 && (
          <select value={selectedSubTopic ?? ""} onChange={handleSubTopicChange}>
            <option value="">Select SubTopic (optional)</option>
            {subTopics.filter(st => st.topic_id === selectedTopic).map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
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
      </form>

      {/* Posts List */}
      {posts.map((p) => (
        <div key={p.post_id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <h4>Topic: {p.topic_name}{p.subtopic_name ? ` / SubTopic: ${p.subtopic_name}` : ""}</h4>

          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>By {p.post_user_first_name} {p.post_user_last_name}</small>

          {/* Comments */}
          {p.comments.map(c => (
            <p key={c.comment_id}><b>{c.comment_user_first_name}</b>: {c.comment_text}</p>
          ))}

          <form onSubmit={(e) => handleCommentSubmit(e, p.post_id)}>
            <input
              value={commentText[p.post_id] || ""}
              onChange={(e) => setCommentText({ ...commentText, [p.post_id]: e.target.value })}
              placeholder="Write a comment..."
            />
            <button type="submit">Comment</button>
          </form>
        </div>
      ))}
    </div>
  );
}
