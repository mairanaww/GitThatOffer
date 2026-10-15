"use client";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#111020",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <h1
        style={{ fontSize: "3rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        404 - Not Found
      </h1>
      <p style={{ color: "#ccc", marginBottom: "2rem" }}>
        The page you are looking for does not exist.
      </p>
      <button
        style={{
          background: "#2563eb",
          color: "#fff",
          padding: "0.4rem 0.8rem",
          borderRadius: "0.75rem",
          fontWeight: "bold",
          border: "none",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
        Go to Main Page
      </button>
      <div
        style={{
          marginTop: "3rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <svg
          className="w-8 h-8 text-blue-500"
          fill="currentColor"
          viewBox="0 0 20 20"
          width="32"
          height="32"
        >
          <path
            fillRule="evenodd"
            d="M3 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 2V5h1v1H5zM3 13a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1H4a1 1 0 01-1-1v-3zm2 2v-1h1v1H5zM13 4a1 1 0 011-1h3a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1V4zm2 2V5h1v1h-1z"
            clipRule="evenodd"
          />
        </svg>
        <span style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
          GitThatOffer
        </span>
      </div>
    </div>
  );
}
