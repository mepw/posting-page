import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const API_BASE = "http://localhost:5000/api/v1";

  const [user, setUser] = useState(null);
  const [topics, setTopics] = useState([]);
  const [subTopics, setSubTopics] = useState([]);
  const [posts, setPosts] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [selectedSubTopic, setSelectedSubTopic] = useState("");
  const [postTitle, setPostTitle] = useState("");
  const [postDesc, setPostDesc] = useState("");
  const [commentText, setCommentText] = useState({});
  const [errors, setErrors] = useState([]);

  const fetchWithToken = async (url, options = {}) => {
    const accessToken = localStorage.getItem("access_token");
    if (!accessToken) navigate("/login");

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
    }

    return res;
  };

  const fetchUser = async () => {
    try {
      const res = await fetchWithToken("/user/user");
      const data = await res.json();
      if (!data.result?.id) return navigate("/login");
      setUser(data.result);
    } catch {
      navigate("/login");
    }
  };

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

  const fetchPosts = async () => {
    try {
      const res = await fetchWithToken("/post/post");
      const data = await res.json();
      const rows = data.result || [];

      const postsArr = [];
      const map = {};

      rows.forEach((r) => {
        if (!map[r.post_id]) {
          map[r.post_id] = {
            post_id: r.post_id,
            title: r.title,
            description: r.description,
            post_topic_id: r.post_topic_id,
            post_sub_topic_id: r.post_sub_topic_id,
            topic_name: r.topic_name,
            subtopic_name: r.subtopic_name,
            post_user_first_name: r.post_user_first_name,
            post_user_last_name: r.post_user_last_name,
            post_user_id: r.post_user_id,
            comments: [],
          };
          postsArr.push(map[r.post_id]);
        }
        if (r.comment_id) {
          map[r.post_id].comments.push({
            id: r.comment_id,
            post_id: r.post_id,
            user_id: r.user_id,
            comment_text: r.comment,
            comment_user_first_name: r.comment_user_first_name,
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

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postDesc.trim() || !selectedTopic)
      return setErrors(["Fill all required fields"]);

    try {
      const postData = {
        title: postTitle,
        description: postDesc,
        post_topic_id: Number(selectedTopic),
        post_sub_topic_id: selectedSubTopic ? Number(selectedSubTopic) : null,
      };

      const res = await fetchWithToken("/post/newpost", {
        method: "POST",
        body: JSON.stringify(postData),
      });
      const data = await res.json();
      if (!data.status) return setErrors([data.error]);

      const newPost = {
        post_id: data.result.id,
        title: postTitle,
        description: postDesc,
        post_topic_id: Number(selectedTopic),
        post_sub_topic_id: selectedSubTopic ? Number(selectedSubTopic) : null,
        topic_name: topics.find((t) => t.id === Number(selectedTopic))?.name || "",
        subtopic_name:
          subTopics.find((st) => st.id === Number(selectedSubTopic))?.name || "",
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

  const handleCommentSubmit = async (e, postId) => {
    e.preventDefault();
    const comment = commentText[postId]?.trim();
    if (!comment) return;

    try {
      const res = await fetchWithToken("/comment/newcomment", {
        method: "POST",
        body: JSON.stringify({ post_id: postId, comment }),
      });

      const data = await res.json();
      if (!data.status) return setErrors([data.error]);

      setPosts(
        posts.map((p) =>
          p.post_id === postId
            ? {
                ...p,
                comments: [
                  ...p.comments,
                  {
                    id: data.result.id,
                    post_id: data.result.post_id, // ✅ included
                    user_id: data.result.user_id,
                    comment_text: data.result.comment,
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

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    navigate("/login");
  };

  if (!user) return <p>Loading user...</p>;

  return (
    <div style={{ maxWidth: 900, margin: "20px auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Welcome, {user.first_name}!</h2>
        <button onClick={handleLogout}>Logout</button>
      </div>

      {errors.length > 0 && (
        <ul style={{ color: "red" }}>
          {errors.map((e, i) => (
            <li key={i}>{e}</li>
          ))}
        </ul>
      )}

      {/* CREATE POST */}
      <form onSubmit={handlePostSubmit}>
        <select value={selectedTopic} onChange={(e) => setSelectedTopic(e.target.value)}>
          <option value="">Select Topic</option>
          {topics.map((t) => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        {subTopics.filter((s) => s.topic_id === Number(selectedTopic)).length > 0 && (
          <select value={selectedSubTopic} onChange={(e) => setSelectedSubTopic(e.target.value)}>
            <option value="">Select SubTopic (optional)</option>
            {subTopics.filter((s) => s.topic_id === Number(selectedTopic)).map((st) => (
              <option key={st.id} value={st.id}>{st.name}</option>
            ))}
          </select>
        )}

        <input placeholder="Post Title" value={postTitle} onChange={(e) => setPostTitle(e.target.value)} />
        <textarea placeholder="Post Description" value={postDesc} onChange={(e) => setPostDesc(e.target.value)} />
        <button>Create Post</button>
      </form>

      <hr />

      {/* POSTS */}
      {posts.map((p) => (
        <div key={p.post_id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 10 }}>
          <h4>Topic: {p.topic_name} {p.subtopic_name && `/ SubTopic: ${p.subtopic_name}`}</h4>
          <h3>{p.title}</h3>
          <p>{p.description}</p>
          <small>By {p.post_user_first_name} {p.post_user_last_name}</small>

          {/* COMMENTS */}
          <div>
            {p.comments.map((c) => (
              <p key={c.id}>
                <b>{c.comment_user_first_name}</b>: {c.comment_text}
              </p>
            ))}
            <form onSubmit={(e) => handleCommentSubmit(e, p.post_id)}>
              <input
                value={commentText[p.post_id] || ""}
                onChange={(e) => setCommentText({ ...commentText, [p.post_id]: e.target.value })}
                placeholder="Write a comment..."
              />
              <button>Comment</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
