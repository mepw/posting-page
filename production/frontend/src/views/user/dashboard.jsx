import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);

  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubTopic, setSelectedSubTopic] = useState("");

  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");

  const [commentText, setCommentText] = useState({});
  const [errors, setErrors] = useState([]);

  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const [newTopicName, setNewTopicName] = useState("");
  const [newSubTopicName, setNewSubTopicName] = useState("");
  const [subTopicParent, setSubTopicParent] = useState("");

  const API_BASE = "http://localhost:5000/api/v1";

  // Generic fetch wrapper
  const fetchWithToken = async (url, options = {}) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) {
      navigate("/login");
      throw new Error("No access token");
    }
    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
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

  // Fetch user
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

  // Fetch topics & subtopics
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

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const res = await fetchWithToken("/post/post");
      const data = await res.json();
      const rows = data.result || [];

      const postsArr = [];
      const postsMap = {};

      rows.forEach((row) => {
        if (!postsMap[row.post_id]) {
          postsArr.push({
            post_id: row.post_id,
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
          postsMap[row.post_id] = postsArr[postsArr.length - 1];
        }

        if (row.comment_id) {
          postsMap[row.post_id].comments.push({
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

  // Topic change for post
  const handleTopicChange = (e) => {
    setSelectedTopic(e.target.value);
    setSelectedSubTopic("");
  };

  // Add Topic
  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    try {
      const res = await fetchWithToken("/topic/newtopic", {
        method: "POST",
        body: JSON.stringify({ name: newTopicName }),
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

  // Add SubTopic
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
          name: newSubTopicName,
          topic_id: subTopicParent, // ✅ use selected parent
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create subtopic"]);
        return;
      }
      fetchSubTopics();
      setNewSubTopicName("");
      setSubTopicParent("");
    } catch {
      setErrors(["Failed to create subtopic"]);
    }
  };

  // Create Post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim() || !selectedTopic) return;

    try {
      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
        body: JSON.stringify({
          title: postTitle,
          description: postDesc,
          topic_id: selectedTopic,
          subtopic_id: selectedSubTopic || null,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create post"]);
        return;
      }

      const newPost = {
        post_id: data.result.id,
        title: postTitle,
        description: postDesc,
        topic_id: selectedTopic,
        topic_name: topics.find((t) => t.id === Number(selectedTopic))?.name || "",
        subtopic_id: selectedSubTopic,
        subtopic_name: subTopics.find((st) => st.id === Number(selectedSubTopic))?.name || "",
        post_user_first_name: user.first_name,
        post_user_last_name: user.last_name,
        post_user_id: user.id,
        comments: [],
      };

      setPosts([newPost, ...posts]);
      setPostTitle("");
      setPostDesc("");
      setSelectedTopic("");
      setSelectedSubTopic("");
    } catch {
      setErrors(["Failed to create post"]);
    }
  };

  // Comments
  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    if (!commentText[postId]?.trim()) return;

    try {
      const res = await fetchWithToken("/comment/newcomment", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, comment: commentText[postId] }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to add comment"]);
        return;
      }

      setPosts(
        posts.map((p) =>
          p.post_id === postId
            ? {
              ...p,
              comments: [
                ...p.comments,
                {
                  comment_id: data.result.comment_id,
                  comment_text: commentText[postId],
                  comment_user_first_name: user.first_name,
                },
              ],
            }
            : p
        )
      );
      setCommentText({ ...commentText, [postId]: "" });
    } catch {
      setErrors(["Failed to add comment"]);
    }
  };

  // Edit post
  const startEditing = (post) => {
    setEditingPostId(post.post_id);
    setEditTitle(post.title);
    setEditDesc(post.description);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditTitle("");
    setEditDesc("");
  };

  const handleEditSubmit = async (e, postId) => {
    e.preventDefault();
    try {
      const res = await fetchWithToken(`/post/edit/${postId}`, {
        method: "PUT",
        body: JSON.stringify({ title: editTitle, description: editDesc }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to update post"]);
        return;
      }
      setPosts(posts.map((p) => (p.post_id === postId ? { ...p, title: editTitle, description: editDesc } : p)));
      cancelEditing();
    } catch {
      setErrors(["Failed to update post"]);
    }
  };

  // Delete post
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      const res = await fetchWithToken(`/post/delete/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to delete post"]);
        return;
      }
      setPosts(posts.filter((p) => p.post_id !== postId));
    } catch {
      setErrors(["Failed to delete post"]);
    }
  };

  // Logout
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
          value={subTopicParent}
          onChange={(e) => setSubTopicParent(e.target.value)}
          style={{ padding: "6px" }}
          required
        >
          <option value="">Select Parent Topic</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
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
        <select
          value={selectedTopic}
          onChange={handleTopicChange}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
          required
        >
          <option value="">Select Topic</option>
          {topics.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>

        {subTopics.filter(st => st.topic_id === Number(selectedTopic)).length > 0 && (
          <select
            value={selectedSubTopic}
            onChange={(e) => setSelectedSubTopic(e.target.value)}
            style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
          >
            <option value="">Select SubTopic (optional)</option>
            {subTopics.filter(st => st.topic_id === Number(selectedTopic)).map(st => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        )}

        <input
          placeholder="Post Title"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <textarea
          placeholder="Post Description"
          value={postDesc}
          onChange={(e) => setPostDesc(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <button type="submit">Post</button>
      </form>

      <hr />

      {/* Posts */}
      {posts.map((p) => (
        <div key={p.post_id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <h4 style={{ color: "#555" }}>
            Topic: {p.topic_name} {p.subtopic_name ? `/ SubTopic: ${p.subtopic_name}` : ""}
          </h4>

          {editingPostId === p.post_id ? (
            <form onSubmit={(e) => handleEditSubmit(e, p.post_id)}>
              <input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} style={{ width: "100%", marginBottom: "5px" }} />
              <textarea value={editDesc} onChange={(e) => setEditDesc(e.target.value)} style={{ width: "100%", marginBottom: "5px" }} />
              <button type="submit">Save</button>
              <button type="button" onClick={cancelEditing} style={{ marginLeft: "5px" }}>Cancel</button>
            </form>
          ) : (
            <>
              <h3>{p.title}</h3>
              <p>{p.description}</p>
              <small>By {p.post_user_first_name} {p.post_user_last_name}</small>
              {Number(p.post_user_id) === Number(user.id) && (
                <>
                  <button onClick={() => startEditing(p)} style={{ marginLeft: "10px" }}>Edit</button>
                  <button onClick={() => handleDeletePost(p.post_id)} style={{ marginLeft: "5px", color: "red" }}>Delete</button>
                </>
              )}
            </>
          )}

          {/* Comments */}
          <div style={{ marginTop: "10px" }}>
            {p.comments.map((c) => (
              <p key={c.comment_id}><b>{c.comment_user_first_name}</b>: {c.comment_text}</p>
            ))}
            <form onSubmit={(e) => handleCommentSubmit(e, p.post_id)} style={{ marginTop: "10px" }}>
              <input
                value={commentText[p.post_id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [p.post_id]: e.target.value })}
                placeholder="Write a comment..."
                style={{ width: "80%", padding: "6px" }}
              />
              <button type="submit" style={{ marginLeft: "5px" }}>Comment</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
