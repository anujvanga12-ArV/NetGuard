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
  }

  /* IP INFO (NOT AVAILABLE ON STATIC SITES) */
  ipEl.textContent = "IP information unavailable (browser privacy protection)";
  ipEl.style.color = "orange";

  /* VPN DETECTION (HEURISTIC ONLY) */
  vpnEl.textContent =
    "VPN detection: Cannot be reliably determined from a website";
  vpnEl.style.color = "yellow";

  /* FINAL SCORE */
  scoreEl.textContent = `Security Score: ${Math.min(score, 100)}/100`;
});
