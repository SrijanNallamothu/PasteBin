import React, { useState, useEffect } from "react";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
// const BASE_URL = "http://localhost:3000";

const Home = () => {
  const [content, setContent] = useState("");
  const [ttlSeconds, setTtlSeconds] = useState("");
  const [maxViews, setMaxViews] = useState("");
  const [useHeader, setUseHeader] = useState(false);
  const [headerTime, setHeaderTime] = useState("");
  const [error, setError] = useState("");
  const [pastes, setPastes] = useState([]);


  useEffect(() => {
    const fetchPastes = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/pastes`);
        const now = new Date();

        const hydrated = res.data.map((p) => ({
          ...p,
          timeRemaining: p.expires_at ? new Date(p.expires_at) - now : null,
        }));

        setPastes(hydrated);
      } catch {
        console.log("No pastes available");
      }
    };

    fetchPastes();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setPastes((prev) =>
        prev.map((p) => {
          if (!p.expires_at) return p;

          const diff = new Date(p.expires_at) - new Date();
          return {
            ...p,
            timeRemaining: diff > 0 ? diff : 0,
          };
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (ms) => {
    if (ms === null) return "-";
    const total = Math.max(0, Math.floor(ms / 1000));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${h}h ${m}m ${s}s`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const payload = {
        content,
        ...(ttlSeconds && { ttl_seconds: Number(ttlSeconds) }),
        ...(maxViews && { max_views: Number(maxViews) }),
      };

      const headers = {};
      if (useHeader && headerTime) headers["x-test-now-ms"] = headerTime;

      const res = await axios.post(`${BASE_URL}/api/pastes`, payload, {
        headers,
      });

      const now = new Date();
      const expires_at = ttlSeconds
        ? new Date(now.getTime() + ttlSeconds * 1000)
        : null;

      setPastes((prev) => [
        ...prev,
        {
          id: res.data.id,
          url: res.data.url,
          remaining_views: maxViews ? Number(maxViews) : null,
          expires_at,
          timeRemaining: expires_at ? expires_at - now : null,
        },
      ]);

      setContent("");
      setTtlSeconds("");
      setMaxViews("");
      setHeaderTime("");
    } catch (err) {
      setError(err.response?.data?.error || "Creation failed");
    }
  };


  const handleOpenPaste = (paste) => {
    if (paste.remaining_views === 0) {
      alert("View limit exceeded");
      return;
    }

    setPastes((prev) =>
      prev.map((p) => {
        if (p.id === paste.id && p.remaining_views !== null) {
          return {
            ...p,
            remaining_views: Math.max(p.remaining_views - 1, 0),
          };
        }
        return p;
      })
    );

    window.open(paste.url, "_blank");
  };

  return (
    <div style={{ maxWidth: 900, margin: "50px auto", textAlign: "center" }}>
      <h1>PasteBin Lite</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 20 }}>
        <textarea
          required
          rows={4}
          cols={50}
          placeholder="Enter your text..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
        <br />

        <input
          type="number"
          placeholder="TTL in seconds (optional)"
          value={ttlSeconds}
          onChange={(e) => setTtlSeconds(e.target.value)}
        />
        <br />

        <input
          type="number"
          placeholder="Max views (optional)"
          value={maxViews}
          onChange={(e) => setMaxViews(e.target.value)}
        />
        <br />

        <label>
          <input
            type="checkbox"
            checked={useHeader}
            onChange={(e) => setUseHeader(e.target.checked)}
          />{" "}
          Use x-test-now-ms header
        </label>

        {useHeader && (
          <input
            type="number"
            placeholder="Header time in ms"
            value={headerTime}
            onChange={(e) => setHeaderTime(e.target.value)}
          />
        )}
        <br />

        <button type="submit">Create Paste</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* ---------- TABLE ---------- */}
      {pastes.length > 0 && (
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: 20,
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Link</th>
              <th>Remaining Views</th>
              <th>Expires In</th>
            </tr>
          </thead>

          <tbody>
            {pastes.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>
                  <a
                    href={p.url}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenPaste(p);
                    }}
                  >
                    {p.url}
                  </a>
                </td>
                <td>{p.remaining_views ?? "Unlimited"}</td>
                <td>{formatTime(p.timeRemaining)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Home;
