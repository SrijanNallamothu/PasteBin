import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const BASE_URL = process.env.REACT_APP_BASE_URL || "http://localhost:3000";
// const BASE_URL = "http://localhost:3000";

const PasteView = () => {
  const { id } = useParams();
  const [paste, setPaste] = useState(null);
  const [error, setError] = useState("");

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchPaste = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/pastes/${id}`);

        let updated = res.data;

        if (updated.remaining_views !== null) {
          updated.remaining_views = Math.max(updated.remaining_views - 1, 0);
        }

        setPaste(updated);
      } catch (err) {
        console.error(err);
        setError(err.response?.data?.error || "Paste not found or expired");
      }
    };

    fetchPaste();
  }, [id]);

  return (
    <div style={{ maxWidth: 600, margin: "50px auto", textAlign: "center" }}>
      <h1>View Paste</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {paste && (
        <div>
          <pre
            style={{
              background: "#f0f0f0",
              padding: "15px",
              borderRadius: "5px",
              whiteSpace: "pre-wrap",
              wordWrap: "break-word",
            }}
          >
            {paste.content}
          </pre>
          <p>
            Remaining Views:{" "}
            {paste.remaining_views !== null
              ? paste.remaining_views
              : "Unlimited"}
          </p>
          <p>
            Expires At:{" "}
            {paste.expires_at
              ? new Date(paste.expires_at).toLocaleString()
              : "Never"}
          </p>
        </div>
      )}
    </div>
  );
};

export default PasteView;
