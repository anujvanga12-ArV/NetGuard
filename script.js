const securityMap = {
  open: {
    label: "Open (No password)",
    score: 0,
    severityClass: "danger",
    reason: "Anyone nearby can join and sniff unencrypted local traffic.",
    advice: [
      "Turn on WPA2 or WPA3 in router settings immediately.",
      "Set a long, unique Wi-Fi password and disable WPS.",
    ],
  },
  wep: {
    label: "WEP",
    score: 10,
    severityClass: "danger",
    reason: "WEP is outdated and can often be cracked in minutes.",
    advice: [
      "Upgrade router security mode to WPA2-PSK or WPA3.",
      "Replace old router firmware/hardware if WPA2/3 is unavailable.",
    ],
  },
  wpa: {
    label: "WPA/WPA2 (Personal)",
    score: 30,
    severityClass: "warn",
    reason: "WPA2 is still common, but weak passwords and old settings are risky.",
    advice: [
      "Use a strong Wi-Fi passphrase (at least 16 characters).",
      "Prefer WPA3 mode if your router and devices support it.",
    ],
  },
  wpa3: {
    label: "WPA3",
    score: 40,
    severityClass: "safe",
    reason: "WPA3 offers stronger protection against password guessing attacks.",
    advice: [
      "Keep router firmware updated to patch security issues.",
      "Still use a unique, strong password for best protection.",
    ],
  },
  unknown: {
    label: "Unknown",
    score: 15,
    severityClass: "warn",
    reason: "Without the router security type, risk cannot be fully evaluated.",
    advice: ["Open your router admin page and confirm it uses WPA2 or WPA3."],
  },
};

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
];

function setStatus(element, text, className) {
  element.textContent = text;
  element.classList.remove("safe", "warn", "danger");
  if (className) element.classList.add(className);
}

function scoreToRating(score) {
  if (score >= 85) return "Excellent";
  if (score >= 70) return "Good";
  if (score >= 50) return "Fair";
  return "High Risk";
}

function inferVpnFromOrg(org = "") {
  const normalized = org.toLowerCase();
  return vpnKeywords.some((k) => normalized.includes(k));
}

async function getPublicIpInfo() {
  const response = await fetch("https://ipapi.co/json/");
  if (!response.ok) {
    throw new Error("Unable to fetch IP intelligence data.");
  }
  return response.json();
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("wifi-form");
  const ssidInput = document.getElementById("ssid");
  const securityInput = document.getElementById("security");

  const wifiNameEl = document.getElementById("wifi-name");
  const wifiSecurityEl = document.getElementById("wifi-security");
  const httpsEl = document.getElementById("https-status");
  const ipEl = document.getElementById("ip-status");
  const networkEl = document.getElementById("network-status");
  const ispEl = document.getElementById("isp-status");
  const vpnEl = document.getElementById("vpn-status");
  const scoreEl = document.getElementById("security-score");
  const ratingEl = document.getElementById("rating");
  const explanationEl = document.getElementById("explanation");
  const recommendationsEl = document.getElementById("recommendations");

  let score = 0;
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

  /* HTTPS CHECK */
  if (location.protocol === "https:") {
    httpsEl.textContent = "HTTPS Encryption: Secure";
    httpsEl.style.color = "lime";
    score += 40;
  } else {
    httpsEl.textContent = "HTTPS Encryption: Not Secure";
    httpsEl.style.color = "red";
  }
    const securityType = securityInput.value;
    const securityDetails = securityMap[securityType] || securityMap.unknown;
    const ssid = ssidInput.value.trim() || "Unknown / hidden";

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
    let score = securityDetails.score;
    setStatus(wifiNameEl, `Wi-Fi Name (SSID): ${ssid}`, "warn");
    setStatus(
      wifiSecurityEl,
      `Wi-Fi Security: ${securityDetails.label}`,
      securityDetails.severityClass,
    );

    if (location.protocol === "https:") {
      setStatus(httpsEl, "Website Encryption (HTTPS): Secure", "safe");
      score += 20;
    } else {
      setStatus(httpsEl, "Website Encryption (HTTPS): Not secure", "danger");
    }

    try {
      const ipInfo = await getPublicIpInfo();
      const org = ipInfo.org || "Unknown provider";
      const city = ipInfo.city || "Unknown city";
      const region = ipInfo.region || "Unknown region";
      const country = ipInfo.country_name || ipInfo.country || "Unknown country";

      setStatus(ipEl, `Public IP Address: ${ipInfo.ip || "Unavailable"}`, "warn");
      setStatus(ispEl, `Network Provider: ${org} (${city}, ${region}, ${country})`, "warn");

      const vpnLikely = inferVpnFromOrg(org);
      if (vpnLikely) {
        setStatus(vpnEl, "VPN Status: Likely ON (heuristic, based on provider)", "safe");
        score += 20;
      } else {
        setStatus(vpnEl, "VPN Status: Not detected (heuristic only)", "warn");
      }
    } catch (error) {
      setStatus(ipEl, "Public IP Address: Could not fetch", "danger");
      setStatus(ispEl, "Network Provider: Could not fetch", "danger");
      setStatus(vpnEl, "VPN Status: Unknown (IP service unavailable)", "warn");
    }

    const connection = navigator.connection;
    if (connection?.effectiveType) {
      if (connection.effectiveType === "4g") {
        score += 10;
      } else {
        score += 5;
      }
    }

    const normalizedScore = Math.min(Math.max(score, 0), 100);
    scoreEl.textContent = `Security Score: ${normalizedScore}/100`;
    ratingEl.textContent = `Overall Rating: ${scoreToRating(normalizedScore)}`;

    explanationEl.textContent = `${securityDetails.reason} This score combines Wi-Fi setup, HTTPS protection, and public IP intelligence.`;

  /* IP INFO (NOT AVAILABLE ON STATIC SITES) */
  ipEl.textContent = "IP information unavailable (browser privacy protection)";
  ipEl.style.color = "orange";
    recommendationsEl.innerHTML = "";
    securityDetails.advice.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      recommendationsEl.appendChild(li);
    });

  /* VPN DETECTION (HEURISTIC ONLY) */
  vpnEl.textContent =
    "VPN detection: Cannot be reliably determined from a website";
  vpnEl.style.color = "yellow";
    if (normalizedScore < 70) {
      const extra = document.createElement("li");
      extra.textContent = "Use a trusted VPN on public Wi-Fi to reduce tracking and interception risks.";
      recommendationsEl.appendChild(extra);
    }
  });

  /* FINAL SCORE */
  scoreEl.textContent = `Security Score: ${Math.min(score, 100)}/100`;
  form.requestSubmit();
});
