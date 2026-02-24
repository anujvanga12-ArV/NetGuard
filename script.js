const vpnKeywords = [
  "vpn",
  "proxy",
  "hosting",
  "cloud",
  "digitalocean",
  "m247",
  "ovh",
  "linode",
  "vultr",
  "data center",
  "datacenter",
  "colo",
  "tunnel",
];

function setStatus(element, text, className = "warn") {
  element.textContent = text;
  element.classList.remove("safe", "warn", "danger");
  element.classList.add(className);
}

function scoreToRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "High Risk";
}

function inferVpnFromOrg(org = "") {
  const normalized = org.toLowerCase();
  return vpnKeywords.some((keyword) => normalized.includes(keyword));
}

async function getPublicIpInfo() {
  const response = await fetch("https://ipapi.co/json/", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Unable to fetch public network intelligence.");
  }
  return response.json();
}

async function detectLocalIps() {
  if (!("RTCPeerConnection" in window)) {
    return [];
  }

  return new Promise((resolve) => {
    const found = new Set();
    const pc = new RTCPeerConnection({ iceServers: [] });

    pc.createDataChannel("netguard");

    pc.onicecandidate = (event) => {
      if (!event.candidate || !event.candidate.candidate) {
        return;
      }

      const matches = event.candidate.candidate.match(
        /(\b(?:\d{1,3}\.){3}\d{1,3}\b)|([a-f0-9:]{2,})/gi,
      );

      if (!matches) return;

      matches.forEach((value) => {
        const normalized = value.toLowerCase();
        if (normalized.includes(":")) {
          if (normalized.length >= 4 && normalized !== "udp" && normalized !== "tcp") {
            found.add(normalized);
          }
        } else if (!Number.isNaN(Number(value.split(".")[0]))) {
          found.add(value);
        }
      });
    };

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(() => resolve([]));

    setTimeout(() => {
      pc.close();
      resolve([...found].slice(0, 3));
    }, 1500);
  });
}

function getConnectionInfo() {
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!connection) {
    return {
      profile: "Browser does not expose network metrics",
      className: "warn",
      scoreDelta: 0,
      ssid: null,
      type: "unknown",
    };
  }

  const type = connection.type || "unknown";
  const effectiveType = connection.effectiveType || "unknown";
  const downlink = connection.downlink ? `${connection.downlink} Mbps` : "Unknown";
  const rtt = connection.rtt ? `${connection.rtt} ms` : "Unknown";
  const saveData = connection.saveData ? "On" : "Off";
  const ssid = typeof connection.ssid === "string" && connection.ssid.trim() ? connection.ssid.trim() : null;

  let className = "warn";
  let scoreDelta = 0;

  if (effectiveType === "4g") {
    className = "safe";
    scoreDelta += 8;
  } else if (effectiveType === "3g") {
    scoreDelta += 4;
  }

  return {
    profile: `type=${type}, effective=${effectiveType}, downlink=${downlink}, rtt=${rtt}, saveData=${saveData}`,
    className,
    scoreDelta,
    ssid,
    type,
  };
}

function getSecurityEstimate(connectionType) {
  if (connectionType === "wifi") {
    return {
      label: "Unknown (browser cannot directly read WPA/WPA2/WPA3)",
      className: "warn",
      reason: "Your browser cannot directly inspect router encryption settings, so Wi-Fi protection cannot be fully verified automatically.",
      advice: [
        "Open router settings and enforce WPA3 (or WPA2-AES if WPA3 is unavailable).",
        "Disable WPS and use a unique Wi-Fi password with at least 16 characters.",
        "Update router firmware monthly or enable automatic firmware updates.",
      ],
      scoreDelta: 10,
    };
  }

  return {
    label: "Not on Wi-Fi (or transport unknown)",
    className: "warn",
    reason: "A Wi-Fi encryption check is most relevant when you are connected through Wi-Fi.",
    advice: [
      "If you switch to Wi-Fi, verify the router uses WPA2/WPA3 before sensitive tasks.",
      "Avoid open hotspots unless you are using a trusted VPN.",
    ],
    scoreDelta: 6,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const httpsEl = document.getElementById("https-status");
  const ipEl = document.getElementById("ip-status");
  const networkEl = document.getElementById("network-status");
  const analyzeBtn = document.getElementById("analyze-btn");
  const lastUpdatedEl = document.getElementById("last-updated");

  const wifiNameEl = document.getElementById("wifi-name");
  const wifiSecurityEl = document.getElementById("wifi-security");
  const vpnEl = document.getElementById("vpn-status");
  const httpsEl = document.getElementById("https-status");
  const appAddressEl = document.getElementById("app-address");
  const publicIpEl = document.getElementById("public-ip");
  const localIpEl = document.getElementById("local-ip");
  const providerEl = document.getElementById("provider");
  const networkProfileEl = document.getElementById("network-profile");
  const deviceProfileEl = document.getElementById("device-profile");
  const scoreEl = document.getElementById("security-score");
  const ratingEl = document.getElementById("rating");
  const explanationEl = document.getElementById("explanation");
  const recommendationsEl = document.getElementById("recommendations");

  let score = 0;
  async function runAnalysis() {
    analyzeBtn.disabled = true;
    analyzeBtn.textContent = "Analyzing...";

  /* HTTPS CHECK */
  if (location.protocol === "https:") {
    httpsEl.textContent = "HTTPS Encryption: Secure";
    httpsEl.style.color = "lime";
    score += 40;
  } else {
    httpsEl.textContent = "HTTPS Encryption: Not Secure";
    httpsEl.style.color = "red";
  }
    try {
      let score = 25;
      const reasons = [];
      const recommendations = [];

  /* CONNECTION INFO (SAFE API) */
  if ("connection" in navigator) {
    const conn = navigator.connection;
    networkEl.textContent = `Connection type: ${conn.effectiveType}`;
    networkEl.style.color = "lightgreen";
    score += 20;
  } else {
    networkEl.textContent = "Network info unavailable (browser restricted)";
    networkEl.style.color = "orange";
  }
      const connectionInfo = getConnectionInfo();
      score += connectionInfo.scoreDelta;

      if (connectionInfo.ssid) {
        setStatus(wifiNameEl, connectionInfo.ssid, "safe");
        score += 8;
      } else {
        setStatus(wifiNameEl, "Not exposed by this browser/device", "warn");
        reasons.push("SSID auto-detection is blocked by browser privacy rules on most devices.");
        recommendations.push("Confirm exact Wi-Fi name in your device Wi-Fi settings.");
      }

      const securityEstimate = getSecurityEstimate(connectionInfo.type);
      setStatus(wifiSecurityEl, securityEstimate.label, securityEstimate.className);
      score += securityEstimate.scoreDelta;
      reasons.push(securityEstimate.reason);
      recommendations.push(...securityEstimate.advice);

  /* IP INFO (NOT AVAILABLE ON STATIC SITES) */
  ipEl.textContent = "IP information unavailable (browser privacy protection)";
  ipEl.style.color = "orange";
      if (window.isSecureContext && location.protocol === "https:") {
        setStatus(httpsEl, "Secure (HTTPS)", "safe");
        score += 20;
      } else {
        setStatus(httpsEl, "Not secure (HTTP)", "danger");
        reasons.push("This page is not protected by HTTPS, so traffic can be intercepted.");
        recommendations.push("Use HTTPS-only sites, especially on public networks.");
      }

  /* VPN DETECTION (HEURISTIC ONLY) */
  vpnEl.textContent =
    "VPN detection: Cannot be reliably determined from a website";
  vpnEl.style.color = "yellow";
      setStatus(appAddressEl, `${location.origin}${location.pathname}`, "warn");
      setStatus(networkProfileEl, connectionInfo.profile, connectionInfo.className);

      const language = navigator.language || "Unknown";
      const platform = navigator.platform || "Unknown";
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Unknown";
      const deviceMemory = navigator.deviceMemory ? `${navigator.deviceMemory} GB` : "Unknown";
      const cores = navigator.hardwareConcurrency || "Unknown";
      const online = navigator.onLine ? "Online" : "Offline";

      setStatus(
        deviceProfileEl,
        `platform=${platform}, language=${language}, timezone=${timezone}, memory=${deviceMemory}, cpuCores=${cores}, status=${online}`,
        "warn",
      );

      try {
        const [ipInfo, localIps] = await Promise.all([getPublicIpInfo(), detectLocalIps()]);
        const org = ipInfo.org || "Unknown provider";
        const city = ipInfo.city || "Unknown city";
        const region = ipInfo.region || "Unknown region";
        const country = ipInfo.country_name || ipInfo.country || "Unknown country";

        setStatus(publicIpEl, ipInfo.ip || "Unavailable", "warn");
        setStatus(providerEl, `${org} (${city}, ${region}, ${country})`, "warn");

        if (localIps.length > 0) {
          setStatus(localIpEl, localIps.join(", "), "warn");
          score += 4;
        } else {
          setStatus(localIpEl, "Not available", "warn");
          recommendations.push("For exact LAN IP, check your OS network settings.");
        }

        const vpnLikely = inferVpnFromOrg(org);
        if (vpnLikely) {
          setStatus(vpnEl, "Likely ON (provider heuristic)", "safe");
          score += 18;
        } else {
          setStatus(vpnEl, "Not detected (heuristic only)", "warn");
          recommendations.push("Use a trusted VPN on public/shared Wi-Fi.");
        }
      } catch (error) {
        setStatus(publicIpEl, "Could not fetch", "danger");
        setStatus(providerEl, "Could not fetch", "danger");
        setStatus(localIpEl, "Could not determine", "warn");
        setStatus(vpnEl, "Unknown (IP lookup unavailable)", "warn");
        reasons.push("IP intelligence lookup failed, so VPN/provider checks are incomplete.");
        recommendations.push("Retry analysis when internet access is stable.");
      }

      const normalizedScore = Math.max(0, Math.min(100, score));
      const uniqueRecommendations = [...new Set(recommendations)];

      scoreEl.textContent = `Security Score: ${normalizedScore}/100`;
      ratingEl.textContent = `Overall Rating: ${scoreToRating(normalizedScore)}`;
      explanationEl.textContent = reasons.length
        ? reasons.join(" ")
        : "Score is based on transport, HTTPS, VPN heuristic, and available browser network signals.";

      recommendationsEl.innerHTML = "";
      uniqueRecommendations.forEach((item) => {
        const li = document.createElement("li");
        li.textContent = item;
        recommendationsEl.appendChild(li);
      });

      lastUpdatedEl.textContent = `Last analyzed: ${new Date().toLocaleString()}`;
    } catch (error) {
      explanationEl.textContent = "Analysis failed due to an unexpected browser error. Please retry.";
      recommendationsEl.innerHTML = "<li>Refresh the page and try Analyze again.</li>";
    } finally {
      analyzeBtn.disabled = false;
      analyzeBtn.textContent = "Analyze Current Connection";
    }
  }

  /* FINAL SCORE */
  scoreEl.textContent = `Security Score: ${Math.min(score, 100)}/100`;
  analyzeBtn.addEventListener("click", runAnalysis);
});
