import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [commentText, setCommentText] = useState({});
  const [errors, setErrors] = useState([]);

  const API_BASE = "http://localhost:5000/api/v1";

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

  const fetchUser = async () => {
    try {
      const res = await fetchWithToken("/user/user");
      const data = await res.json();
      if (!res.ok || !data.result?.id) {
        navigate("/login");
        return;
      }
      setUser(data.result);
    } catch (err) {
      navigate("/login");
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetchWithToken("/post/post");
      const data = await res.json();
      const rows = data.result || [];

      // Transform flat rows into posts with comments array
      const postsMap = {};
      rows.forEach((row) => {
        if (!postsMap[row.post_id]) {
          postsMap[row.post_id] = {
            post_id: row.post_id,
            title: row.title,
            description: row.description,
            post_user_first_name: row.post_user_first_name,
            post_user_last_name: row.post_user_last_name,
            comments: [],
          };
        }
        if (row.comment_id) {
          postsMap[row.post_id].comments.push({
            comment_id: row.comment_id,
            comment_text: row.comment_text,
            comment_user_first_name: row.comment_user_first_name,
          });
        }
      });

      setPosts(Object.values(postsMap));
    } catch (err) {
      setErrors(["Failed to fetch posts"]);
    }
  };

  useEffect(() => {
    fetchUser();
    fetchPosts();
  }, []);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim()) return;

    try {
      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
        body: JSON.stringify({ title: postTitle, description: postDesc }),
      });
      const data = await res.json();
      if (!res.ok || data.status === false) {
        setErrors([data.error || "Failed to create post"]);
        return;
      }
      setPostTitle("");
      setPostDesc("");
      fetchPosts();
    } catch (err) {
      setErrors(["Failed to create post"]);
    }
  };

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
      setCommentText({ ...commentText, [postId]: "" });
      fetchPosts();
    } catch (err) {
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
    <div style={{ maxWidth: "800px", margin: "20px auto" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
        <h1>Welcome, {user.first_name || "User"}!</h1>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e, i) => <li key={i}>{e}</li>)}
        </ul>
      )}

      {/* New Post Form */}
      <form onSubmit={handlePostSubmit} style={{ marginBottom: "20px" }}>
        <input
          placeholder="Post Title"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <textarea
          placeholder="Post Description"
          value={postDesc}
          onChange={(e) => setPostDesc(e.target.value)}
          required
          style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
        />
        <button type="submit">Post</button>
      </form>

      <hr />

      {/* Posts */}
      {posts.map((p) => (
        <div key={p.post_id} style={{ border: "1px solid #ccc", marginBottom: "10px", padding: "10px" }}>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>By {p.post_user_first_name} {p.post_user_last_name}</small>

          {/* Comments */}
          <div style={{ marginTop: "10px" }}>
            {p.comments.map((c) => (
              <p key={c.comment_id}><b>{c.comment_user_first_name}</b>: {c.comment_text}</p>
            ))}

            {/* Comment Input */}
            <form onSubmit={(e) => handleCommentSubmit(e, p.post_id)} style={{ marginTop: "10px" }}>
              <input
                value={commentText[p.post_id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [p.post_id]: e.target.value })}
                placeholder="Write a comment..."
                required
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
