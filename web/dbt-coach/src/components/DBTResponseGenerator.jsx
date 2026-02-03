import { useState, useRef, useEffect, useCallback } from "react";

const DBT_SYSTEM_PROMPT = `You are a DBT (Dialectical Behavior Therapy) communication coach. The user will provide a casual message they received from someone. Your job is to generate multiple response options using DBT interpersonal effectiveness skills.

Generate exactly 5 response options in the following categories. Each response should be written in a natural, conversational tone matching the casualness of the original message — NOT robotic or clinical:

1. **Accepting** (GIVE skills - warm, relationship-maintaining yes)
2. **Declining** (DEAR MAN - honest, clear boundary with no over-justification or excessive apology)
3. **Soft Maybe / Buying Time** (FAST - staying truthful without committing prematurely)
4. **Declining but Maintaining Connection** (GIVE + DEAR MAN - says no but keeps the door open)
5. **Conditional Accept** (clear about personal limits without dampening the vibe)

Rules:
- Match the tone and energy of the original message. If it's casual, keep responses casual.
- No over-apologizing or excessive justification.
- Validate the other person's gesture where appropriate ("appreciate you," "that's generous," etc.)
- Use clear, direct language without hedging.
- Maintain warmth while being honest.
- Stick to the facts without manufacturing excuses.
- Keep each response to 1-3 sentences max.

Return your output as valid JSON only, with no markdown formatting, no backticks, no preamble. Use this exact structure:
{
"responses": [
{
"category": "Accepting",
"skill": "GIVE skills - warm, relationship-maintaining yes",
"text": "the response text"
},
{
"category": "Declining",
"skill": "DEAR MAN - honest boundary, no over-justification",
"text": "the response text"
},
{
"category": "Soft Maybe / Buying Time",
"skill": "FAST - truthful without premature commitment",
"text": "the response text"
},
{
"category": "Declining + Maintaining Connection",
"skill": "GIVE + DEAR MAN - says no, keeps door open",
"text": "the response text"
},
{
"category": "Conditional Accept",
"skill": "Clear about limits without dampening the vibe",
"text": "the response text"
}
]
}`;

const SKILL_DESCRIPTIONS = {
  GIVE: {
    full: "Gentle, Interested, Validate, Easy manner",
    focus: "relationship maintenance",
    icon: "◈",
  },
  "DEAR MAN": {
    full: "Describe, Express, Assert, Reinforce, Mindful, Appear confident, Negotiate",
    focus: "getting what you need",
    icon: "◇",
  },
  FAST: {
    full: "Fair, no Apologies, Stick to values, Truthful",
    focus: "self-respect",
    icon: "◆",
  },
  "GIVE + DEAR MAN": {
    full: "Combines relationship maintenance with clear assertion",
    focus: "balanced communication",
    icon: "◈◇",
  },
};

const CATEGORY_CONFIG = {
  Accepting: {
    gradient: "linear-gradient(135deg, #00ff87 0%, #60efff 100%)",
    glow: "#00ff87",
    glowRgb: "0, 255, 135",
    icon: "⬡",
    label: "ACCEPT",
  },
  Declining: {
    gradient: "linear-gradient(135deg, #ff0080 0%, #ff4d4d 100%)",
    glow: "#ff0080",
    glowRgb: "255, 0, 128",
    icon: "⬢",
    label: "DECLINE",
  },
  "Soft Maybe / Buying Time": {
    gradient: "linear-gradient(135deg, #ffd000 0%, #ff9500 100%)",
    glow: "#ffd000",
    glowRgb: "255, 208, 0",
    icon: "◐",
    label: "PAUSE",
  },
  "Declining + Maintaining Connection": {
    gradient: "linear-gradient(135deg, #a855f7 0%, #6366f1 100%)",
    glow: "#a855f7",
    glowRgb: "168, 85, 247",
    icon: "◑",
    label: "BRIDGE",
  },
  "Conditional Accept": {
    gradient: "linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)",
    glow: "#00f0ff",
    glowRgb: "0, 240, 255",
    icon: "◧",
    label: "TERMS",
  },
};

// Animated background grid component
function CyberGrid() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {/* Gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-20%",
          left: "-10%",
          width: "50%",
          height: "50%",
          background: "radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          animation: "float 20s ease-in-out infinite",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-20%",
          right: "-10%",
          width: "60%",
          height: "60%",
          background: "radial-gradient(circle, rgba(0, 240, 255, 0.1) 0%, transparent 70%)",
          filter: "blur(80px)",
          animation: "float 25s ease-in-out infinite reverse",
        }}
      />
      {/* Grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black 30%, transparent 80%)",
        }}
      />
      {/* Scan line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(0, 240, 255, 0.3), transparent)",
          animation: "scanline 8s linear infinite",
        }}
      />
    </div>
  );
}

// Glowing orb loader
function OrbLoader() {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: "16px", padding: "40px 0" }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, ${Object.values(CATEGORY_CONFIG)[i].glow}, transparent)`,
            boxShadow: `0 0 20px ${Object.values(CATEGORY_CONFIG)[i].glow}`,
            animation: `orbPulse 1.5s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// Response card component
function ResponseCard({ response, index, onCopy }) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const config = CATEGORY_CONFIG[response.category] || CATEGORY_CONFIG.Accepting;

  const handleCopy = () => {
    onCopy(response.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        position: "relative",
        borderRadius: "20px",
        padding: "2px",
        background: isHovered
          ? config.gradient
          : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
        opacity: 0,
        transform: "translateY(30px) scale(0.95)",
        animation: `cardReveal 0.6s cubic-bezier(0.16, 1, 0.3, 1) ${index * 0.1 + 0.2}s forwards`,
        transition: "background 0.3s ease, box-shadow 0.3s ease",
        boxShadow: isHovered
          ? `0 0 40px rgba(${config.glowRgb}, 0.3), 0 20px 60px rgba(0,0,0,0.4)`
          : "0 10px 40px rgba(0,0,0,0.2)",
      }}
    >
      <div
        style={{
          background: "linear-gradient(135deg, rgba(18, 18, 26, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)",
          borderRadius: "18px",
          overflow: "hidden",
          backdropFilter: "blur(20px)",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "12px",
                background: `linear-gradient(135deg, rgba(${config.glowRgb}, 0.2) 0%, rgba(${config.glowRgb}, 0.05) 100%)`,
                border: `1px solid rgba(${config.glowRgb}, 0.3)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                color: config.glow,
                textShadow: `0 0 20px ${config.glow}`,
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
                transform: isHovered ? "scale(1.1)" : "scale(1)",
                boxShadow: isHovered ? `0 0 30px rgba(${config.glowRgb}, 0.4)` : "none",
              }}
            >
              {config.icon}
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  fontSize: "11px",
                  fontWeight: "700",
                  letterSpacing: "0.2em",
                  color: config.glow,
                  textShadow: `0 0 20px rgba(${config.glowRgb}, 0.5)`,
                  marginBottom: "4px",
                }}
              >
                {config.label}
              </div>
              <div
                style={{
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {response.skill.split(" - ")[0]}
              </div>
            </div>
          </div>

          {/* Category indicator */}
          <div
            style={{
              padding: "6px 14px",
              borderRadius: "100px",
              background: `linear-gradient(135deg, rgba(${config.glowRgb}, 0.15) 0%, rgba(${config.glowRgb}, 0.05) 100%)`,
              border: `1px solid rgba(${config.glowRgb}, 0.2)`,
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: config.glow,
              letterSpacing: "0.05em",
            }}
          >
            {response.category}
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: "24px" }}>
          <div
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "17px",
              lineHeight: "1.7",
              color: "rgba(255,255,255,0.9)",
              position: "relative",
              paddingLeft: "20px",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 0,
                bottom: 0,
                width: "3px",
                borderRadius: "3px",
                background: config.gradient,
                boxShadow: `0 0 15px rgba(${config.glowRgb}, 0.5)`,
              }}
            />
            {response.text}
          </div>

          {/* Copy button */}
          <button
            onClick={handleCopy}
            style={{
              marginTop: "20px",
              padding: "12px 24px",
              borderRadius: "12px",
              border: `1px solid rgba(${config.glowRgb}, ${copied ? 0.6 : 0.3})`,
              background: copied
                ? `linear-gradient(135deg, rgba(${config.glowRgb}, 0.2) 0%, rgba(${config.glowRgb}, 0.1) 100%)`
                : "rgba(255,255,255,0.03)",
              color: copied ? config.glow : "rgba(255,255,255,0.7)",
              fontSize: "13px",
              fontWeight: "600",
              fontFamily: "'Space Grotesk', sans-serif",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              letterSpacing: "0.02em",
            }}
            onMouseEnter={(e) => {
              if (!copied) {
                e.currentTarget.style.background = `linear-gradient(135deg, rgba(${config.glowRgb}, 0.1) 0%, rgba(${config.glowRgb}, 0.05) 100%)`;
                e.currentTarget.style.borderColor = `rgba(${config.glowRgb}, 0.5)`;
                e.currentTarget.style.color = config.glow;
              }
            }}
            onMouseLeave={(e) => {
              if (!copied) {
                e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                e.currentTarget.style.borderColor = `rgba(${config.glowRgb}, 0.3)`;
                e.currentTarget.style.color = "rgba(255,255,255,0.7)";
              }
            }}
          >
            <span style={{ fontSize: "14px" }}>{copied ? "✓" : "⎘"}</span>
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Main component
export default function DBTResponseGenerator() {
  const [message, setMessage] = useState("");
  const [responses, setResponses] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [focused, setFocused] = useState(false);
  const resultsRef = useRef(null);
  const textareaRef = useRef(null);

  const generateResponses = useCallback(async () => {
    if (!message.trim() || loading) return;
    setLoading(true);
    setError(null);
    setResponses(null);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: DBT_SYSTEM_PROMPT,
          messages: [{ role: "user", content: `Here is the message I received:\n\n"${message}"` }],
        }),
      });

      const data = await res.json();
      const text = data.content?.map((b) => b.text || "").join("") || "";
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setResponses(parsed.responses);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      console.error(err);
      setError("Neural pathway disrupted. Recalibrating...");
    } finally {
      setLoading(false);
    }
  }, [message, loading]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      generateResponses();
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const examples = [
    "Heading to rabbit hole with Ruva if you're free and wanna swing through!",
    "Doing a birthday dinner Friday and got free tickets to a comedy show Saturday",
    "Hey we're doing game night at my place tonight, you should come through",
    "Want to grab coffee tomorrow morning before work?",
  ];

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)",
        fontFamily: "'Inter', sans-serif",
        color: "#fff",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap');

        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          33% { transform: translate(30px, -30px) rotate(5deg); }
          66% { transform: translate(-20px, 20px) rotate(-3deg); }
        }

        @keyframes scanline {
          0% { top: -2px; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }

        @keyframes orbPulse {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.5); opacity: 1; }
        }

        @keyframes cardReveal {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(0, 240, 255, 0.3); }
          50% { box-shadow: 0 0 40px rgba(0, 240, 255, 0.5), 0 0 60px rgba(0, 240, 255, 0.2); }
        }

        @keyframes textGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(0, 240, 255, 0.5); }
          50% { text-shadow: 0 0 30px rgba(0, 240, 255, 0.8), 0 0 50px rgba(0, 240, 255, 0.4); }
        }

        @keyframes borderGlow {
          0%, 100% { border-color: rgba(0, 240, 255, 0.3); }
          50% { border-color: rgba(0, 240, 255, 0.6); }
        }

        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }

        textarea::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        textarea:focus {
          outline: none;
        }

        * {
          box-sizing: border-box;
        }

        ::-webkit-scrollbar {
          width: 6px;
        }

        ::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }

        ::-webkit-scrollbar-thumb {
          background: rgba(0, 240, 255, 0.3);
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 240, 255, 0.5);
        }

        ::selection {
          background: rgba(0, 240, 255, 0.3);
          color: #fff;
        }
      `}</style>

      <CyberGrid />

      {/* Main content */}
      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <header
          style={{
            padding: "60px 24px 40px",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 auto",
          }}
        >
          {/* Badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              padding: "8px 20px",
              borderRadius: "100px",
              background: "rgba(0, 240, 255, 0.08)",
              border: "1px solid rgba(0, 240, 255, 0.2)",
              marginBottom: "32px",
              animation: "glowPulse 3s ease-in-out infinite",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#00f0ff",
                boxShadow: "0 0 10px #00f0ff",
                animation: "orbPulse 2s ease-in-out infinite",
              }}
            />
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "11px",
                fontWeight: "600",
                letterSpacing: "0.15em",
                color: "#00f0ff",
                textTransform: "uppercase",
              }}
            >
              DBT Neural Interface
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: "clamp(36px, 6vw, 64px)",
              fontWeight: "700",
              lineHeight: "1.1",
              margin: "0 0 20px",
              letterSpacing: "-0.03em",
              background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.7) 50%, #00f0ff 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Mindful Response
            <br />
            <span
              style={{
                background: "linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #ff0080 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Generator
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontFamily: "'Inter', sans-serif",
              fontSize: "16px",
              color: "rgba(255, 255, 255, 0.5)",
              maxWidth: "500px",
              margin: "0 auto",
              lineHeight: "1.7",
            }}
          >
            Transform any message into 5 DBT-informed responses.
            <br />
            <span style={{ color: "rgba(0, 240, 255, 0.7)" }}>From full acceptance to graceful boundaries.</span>
          </p>
        </header>

        {/* Input Section */}
        <div style={{ maxWidth: "720px", margin: "0 auto", padding: "0 24px" }}>
          <div
            style={{
              borderRadius: "24px",
              padding: "2px",
              background: focused
                ? "linear-gradient(135deg, #00f0ff 0%, #a855f7 50%, #ff0080 100%)"
                : "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
              transition: "all 0.3s ease",
              boxShadow: focused
                ? "0 0 60px rgba(0, 240, 255, 0.2), 0 20px 80px rgba(0, 0, 0, 0.4)"
                : "0 10px 60px rgba(0, 0, 0, 0.3)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, rgba(18, 18, 26, 0.98) 0%, rgba(10, 10, 15, 0.99) 100%)",
                borderRadius: "22px",
                overflow: "hidden",
                backdropFilter: "blur(20px)",
              }}
            >
              {/* Input header */}
              <div
                style={{
                  padding: "16px 24px",
                  borderBottom: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "16px" }}>◈</span>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: "10px",
                      fontWeight: "600",
                      letterSpacing: "0.15em",
                      color: "rgba(255,255,255,0.4)",
                      textTransform: "uppercase",
                    }}
                  >
                    Input Signal
                  </span>
                </div>
                <span
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {message.length} chars
                </span>
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                placeholder="Paste the message you received..."
                rows={4}
                style={{
                  width: "100%",
                  border: "none",
                  padding: "20px 24px",
                  fontSize: "17px",
                  fontFamily: "'Inter', sans-serif",
                  lineHeight: "1.7",
                  color: "#fff",
                  resize: "vertical",
                  background: "transparent",
                  minHeight: "120px",
                }}
              />

              {/* Action bar */}
              <div
                style={{
                  padding: "16px 24px",
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: "12px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "11px",
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  <span style={{ color: "rgba(0, 240, 255, 0.6)" }}>⌘</span> + <span style={{ color: "rgba(0, 240, 255, 0.6)" }}>↵</span> to generate
                </div>

                <button
                  onClick={generateResponses}
                  disabled={loading || !message.trim()}
                  style={{
                    padding: "14px 32px",
                    borderRadius: "12px",
                    border: "none",
                    background:
                      loading || !message.trim()
                        ? "rgba(255,255,255,0.05)"
                        : "linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)",
                    color: loading || !message.trim() ? "rgba(255,255,255,0.3)" : "#000",
                    fontSize: "14px",
                    fontWeight: "700",
                    fontFamily: "'Space Grotesk', sans-serif",
                    cursor: loading || !message.trim() ? "not-allowed" : "pointer",
                    transition: "all 0.3s ease",
                    letterSpacing: "0.02em",
                    boxShadow:
                      loading || !message.trim() ? "none" : "0 0 30px rgba(0, 240, 255, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  {loading ? (
                    <>
                      <span
                        style={{
                          display: "inline-block",
                          width: "16px",
                          height: "16px",
                          border: "2px solid rgba(255,255,255,0.2)",
                          borderTopColor: "rgba(255,255,255,0.6)",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Processing...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "16px" }}>◈</span>
                      Generate Responses
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Example chips */}
          <div
            style={{
              marginTop: "20px",
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: "10px",
                color: "rgba(255,255,255,0.3)",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "8px 0",
              }}
            >
              Examples:
            </span>
            {examples.map((ex, i) => (
              <button
                key={i}
                onClick={() => setMessage(ex)}
                style={{
                  padding: "8px 16px",
                  borderRadius: "100px",
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.03)",
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.5)",
                  cursor: "pointer",
                  fontFamily: "'Inter', sans-serif",
                  transition: "all 0.2s ease",
                  maxWidth: "200px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(0, 240, 255, 0.1)";
                  e.currentTarget.style.borderColor = "rgba(0, 240, 255, 0.3)";
                  e.currentTarget.style.color = "#00f0ff";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                  e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                }}
              >
                {ex.substring(0, 35)}...
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ maxWidth: "720px", margin: "24px auto 0", padding: "0 24px" }}>
            <div
              style={{
                padding: "16px 24px",
                borderRadius: "16px",
                background: "rgba(255, 0, 128, 0.1)",
                border: "1px solid rgba(255, 0, 128, 0.3)",
                color: "#ff0080",
                fontFamily: "'Inter', sans-serif",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                animation: "shake 0.5s ease",
              }}
            >
              <span style={{ fontSize: "18px" }}>⚠</span>
              {error}
            </div>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ maxWidth: "720px", margin: "40px auto", padding: "0 24px", textAlign: "center" }}>
            <OrbLoader />
            <p
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: "14px",
                color: "rgba(255,255,255,0.4)",
                letterSpacing: "0.05em",
              }}
            >
              Analyzing communication patterns...
            </p>
          </div>
        )}

        {/* Results */}
        {responses && (
          <div
            ref={resultsRef}
            style={{
              maxWidth: "720px",
              margin: "48px auto 0",
              padding: "0 24px 100px",
            }}
          >
            {/* Results header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
                marginBottom: "32px",
                opacity: 0,
                animation: "cardReveal 0.6s ease forwards",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to right, transparent, rgba(0, 240, 255, 0.3))" }} />
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  fontWeight: "600",
                  letterSpacing: "0.2em",
                  color: "#00f0ff",
                  textTransform: "uppercase",
                  textShadow: "0 0 20px rgba(0, 240, 255, 0.5)",
                }}
              >
                Response Matrix
              </span>
              <div style={{ flex: 1, height: "1px", background: "linear-gradient(to left, transparent, rgba(0, 240, 255, 0.3))" }} />
            </div>

            {/* Response cards */}
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {responses.map((r, i) => (
                <ResponseCard key={i} response={r} index={i} onCopy={handleCopy} />
              ))}
            </div>

            {/* Skills reference */}
            <div
              style={{
                marginTop: "48px",
                padding: "2px",
                borderRadius: "20px",
                background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.02) 100%)",
                opacity: 0,
                animation: "cardReveal 0.6s ease 0.8s forwards",
              }}
            >
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(18, 18, 26, 0.95) 0%, rgba(10, 10, 15, 0.98) 100%)",
                  borderRadius: "18px",
                  padding: "24px",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: "10px",
                    fontWeight: "600",
                    letterSpacing: "0.15em",
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "uppercase",
                    marginBottom: "20px",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span style={{ color: "#a855f7" }}>◆</span>
                  DBT Skills Reference
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {Object.entries(SKILL_DESCRIPTIONS).map(([skill, data]) => (
                    <div
                      key={skill}
                      style={{
                        padding: "16px 20px",
                        borderRadius: "12px",
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.06)",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          marginBottom: "8px",
                        }}
                      >
                        <span style={{ color: "#a855f7", fontSize: "14px" }}>{data.icon}</span>
                        <span
                          style={{
                            fontFamily: "'Space Grotesk', sans-serif",
                            fontWeight: "600",
                            fontSize: "14px",
                            color: "#fff",
                          }}
                        >
                          {skill}
                        </span>
                      </div>
                      <p
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontSize: "12px",
                          color: "rgba(255,255,255,0.5)",
                          margin: 0,
                          lineHeight: "1.6",
                        }}
                      >
                        {data.full}
                      </p>
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "10px",
                          padding: "4px 10px",
                          borderRadius: "100px",
                          background: "rgba(168, 85, 247, 0.1)",
                          border: "1px solid rgba(168, 85, 247, 0.2)",
                          fontFamily: "'JetBrains Mono', monospace",
                          fontSize: "9px",
                          color: "#a855f7",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {data.focus}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "16px 24px",
            background: "linear-gradient(to top, rgba(10,10,15,0.95), transparent)",
            textAlign: "center",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: "10px",
              color: "rgba(255,255,255,0.2)",
              letterSpacing: "0.1em",
            }}
          >
            NEURAL INTERFACE v1.0 // DBT COMMUNICATION FRAMEWORK
          </span>
        </footer>
      </div>

      {/* Add spin animation */}
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
