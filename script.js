document.addEventListener("DOMContentLoaded", () => {
  const httpsEl = document.getElementById("https-status");
  const ipEl = document.getElementById("ip-status");
  const networkEl = document.getElementById("network-status");
  const vpnEl = document.getElementById("vpn-status");
  const scoreEl = document.getElementById("security-score");

  let score = 0;

  /* HTTPS CHECK */
  if (location.protocol === "https:") {
    httpsEl.textContent = "HTTPS Encryption: Secure";
    httpsEl.style.color = "lime";
    score += 40;
  } else {
    httpsEl.textContent = "HTTPS Encryption: Not Secure";
    httpsEl.style.color = "red";
const vpnKeywords = ["vpn", "proxy", "hosting", "cloud", "digitalocean", "ovh", "linode", "vultr", "datacenter", "tunnel"];

function setStatus(el, text, className = "warn") {
  el.textContent = text;
  el.classList.remove("safe", "warn", "danger");
  el.classList.add(className);
}

function scoreToRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "High Risk";
}

function inferVpnFromOrg(org = "") {
  const norm = org.toLowerCase();
  return vpnKeywords.some((k) => norm.includes(k));
}

async function fetchWithTimeout(url, ms = 5000) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    const res = await fetch(url, { signal: ctrl.signal, cache: "no-store" });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function getPublicIpInfo() {
  const response = await fetchWithTimeout("https://ipapi.co/json/", 5000);
  if (!response.ok) throw new Error("IP service unavailable");
  return response.json();
}

  /* CONNECTION INFO (SAFE API) */
  if ("connection" in navigator) {
    const conn = navigator.connection;
    networkEl.textContent = `Connection type: ${conn.effectiveType}`;
    networkEl.style.color = "lightgreen";
    score += 20;
  } else {
    networkEl.textContent = "Network info unavailable (browser restricted)";
    networkEl.style.color = "orange";
async function detectLocalIps() {
  if (!("RTCPeerConnection" in window)) return [];
  return new Promise((resolve) => {
    const found = new Set();
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("netguard");
    pc.onicecandidate = (event) => {
      const c = event.candidate?.candidate;
      if (!c) return;
      const hits = c.match(/(\b(?:\d{1,3}\.){3}\d{1,3}\b)|([a-f0-9:]{2,})/gi);
      if (!hits) return;
      hits.forEach((v) => found.add(v));
    };
    pc.createOffer().then((offer) => pc.setLocalDescription(offer)).catch(() => resolve([]));
    setTimeout(() => {
      pc.close();
      resolve([...found].filter((v) => !["udp", "tcp"].includes(v.toLowerCase())).slice(0, 3));
    }, 1200);
  });
}

function getConnectionInfo() {
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!conn) return { type: "unknown", ssid: null, scoreDelta: 0, profile: "No browser network metrics", className: "warn" };
  const type = conn.type || "unknown";
  const et = conn.effectiveType || "unknown";
  let scoreDelta = et === "4g" ? 8 : et === "3g" ? 4 : 0;
  return {
    type,
    ssid: typeof conn.ssid === "string" && conn.ssid.trim() ? conn.ssid.trim() : null,
    scoreDelta,
    className: et === "4g" ? "safe" : "warn",
    profile: `type=${type}, effective=${et}, downlink=${conn.downlink || "?"}Mbps, rtt=${conn.rtt || "?"}ms, saveData=${conn.saveData ? "on" : "off"}`,
  };
}

function securityEstimate(connectionType) {
  if (connectionType === "wifi") {
    return {
      label: "Unknown from browser (check router: WPA3/WPA2-AES)",
      reason: "Browsers cannot directly read your router encryption mode.",
      advice: [
        "Enable WPA3 (or WPA2-AES if WPA3 unavailable).",
        "Disable WPS and use a strong unique Wi‑Fi password.",
        "Update router firmware regularly.",
      ],
      scoreDelta: 10,
    };
  }
  return {
    label: "Not on Wi‑Fi / unknown transport",
    reason: "Wi‑Fi encryption checks apply when using Wi‑Fi.",
    advice: ["If you connect to Wi‑Fi, avoid open hotspots and verify WPA2/WPA3."],
    scoreDelta: 6,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const el = {
    btn: document.getElementById("analyze-btn"),
    updated: document.getElementById("last-updated"),
    wifi: document.getElementById("wifi-name"),
    sec: document.getElementById("wifi-security"),
    vpn: document.getElementById("vpn-status"),
    https: document.getElementById("https-status"),
    app: document.getElementById("app-address"),
    pubip: document.getElementById("public-ip"),
    localip: document.getElementById("local-ip"),
    provider: document.getElementById("provider"),
    net: document.getElementById("network-profile"),
    dev: document.getElementById("device-profile"),
    score: document.getElementById("security-score"),
    rating: document.getElementById("rating"),
    why: document.getElementById("explanation"),
    recs: document.getElementById("recommendations"),
  };

  async function runAnalysis() {
    el.btn.disabled = true;
    el.btn.textContent = "Analyzing…";
    el.updated.textContent = "Running checks…";

    setStatus(el.wifi, "Detecting…");
    setStatus(el.sec, "Detecting…");
    setStatus(el.vpn, "Detecting…");
    setStatus(el.pubip, "Detecting…");

  /* IP INFO (NOT AVAILABLE ON STATIC SITES) */
  ipEl.textContent = "IP information unavailable (browser privacy protection)";
  ipEl.style.color = "orange";
    try {
      let score = 25;
      const reasons = [];
      const recs = [];

  /* VPN DETECTION (HEURISTIC ONLY) */
  vpnEl.textContent =
    "VPN detection: Cannot be reliably determined from a website";
  vpnEl.style.color = "yellow";
      const conn = getConnectionInfo();
      score += conn.scoreDelta;

      if (conn.ssid) {
        setStatus(el.wifi, conn.ssid, "safe");
        score += 8;
      } else {
        setStatus(el.wifi, "Not exposed by browser", "warn");
        reasons.push("SSID is hidden by browser privacy policies.");
        recs.push("Check device Wi‑Fi settings to confirm SSID.");
      }

      const sec = securityEstimate(conn.type);
      setStatus(el.sec, sec.label, "warn");
      score += sec.scoreDelta;
      reasons.push(sec.reason);
      recs.push(...sec.advice);

      if (location.protocol === "https:") {
        setStatus(el.https, "Secure (HTTPS)", "safe");
        score += 20;
      } else {
        setStatus(el.https, "Not secure (HTTP)", "danger");
        reasons.push("This app page is on HTTP, so traffic can be intercepted.");
        recs.push("Use HTTPS sites, especially on public Wi‑Fi.");
      }

      setStatus(el.app, `${location.origin}${location.pathname}`);
      setStatus(el.net, conn.profile, conn.className);
      setStatus(
        el.dev,
        `platform=${navigator.platform || "?"}, language=${navigator.language || "?"}, timezone=${Intl.DateTimeFormat().resolvedOptions().timeZone || "?"}, online=${navigator.onLine ? "yes" : "no"}`,
      );

      try {
        const [ipInfo, localIps] = await Promise.all([getPublicIpInfo(), detectLocalIps()]);
        const org = ipInfo.org || "Unknown provider";
        const place = `${ipInfo.city || "?"}, ${ipInfo.region || "?"}, ${ipInfo.country_name || ipInfo.country || "?"}`;
        setStatus(el.pubip, ipInfo.ip || "Unavailable");
        setStatus(el.provider, `${org} (${place})`);

        if (localIps.length) {
          setStatus(el.localip, localIps.join(", "));
          score += 4;
        } else {
          setStatus(el.localip, "Not available");
          recs.push("Check OS network settings for exact local IP.");
        }

        if (inferVpnFromOrg(org)) {
          setStatus(el.vpn, "Likely ON (provider heuristic)", "safe");
          score += 18;
        } else {
          setStatus(el.vpn, "Not detected (heuristic)", "warn");
          recs.push("Use a trusted VPN on public or shared Wi‑Fi.");
        }
      } catch (error) {
        setStatus(el.pubip, "Could not fetch", "danger");
        setStatus(el.provider, "Could not fetch", "danger");
        setStatus(el.localip, "Could not determine", "warn");
        setStatus(el.vpn, "Unknown (lookup unavailable)", "warn");
        reasons.push("IP lookup timed out or failed.");
        recs.push("Retry analysis with stable internet.");
      }

      const finalScore = Math.max(0, Math.min(100, score));
      el.score.textContent = `${finalScore}/100`;
      el.rating.textContent = scoreToRating(finalScore);
      el.why.textContent = reasons.join(" ") || "Score combines transport, HTTPS, ISP/VPN heuristic, and available browser signals.";

      el.recs.innerHTML = "";
      [...new Set(recs)].forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        el.recs.appendChild(li);
      });

      el.updated.textContent = `Last analyzed: ${new Date().toLocaleString()}`;
    } catch (error) {
      el.why.textContent = "Analysis failed unexpectedly. Please refresh and try again.";
      el.recs.innerHTML = "<li>Refresh the page and tap Analyze again.</li>";
      el.updated.textContent = "Analysis failed.";
    } finally {
      el.btn.disabled = false;
      el.btn.textContent = "Analyze My Connection";
    }
  }

  /* FINAL SCORE */
  scoreEl.textContent = `Security Score: ${Math.min(score, 100)}/100`;
  el.btn.addEventListener("click", runAnalysis);
  runAnalysis();
});
