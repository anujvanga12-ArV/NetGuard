document.addEventListener("DOMContentLoaded", async () => {

  let score = 100;
  const recommendations = [];

  const httpsEl = document.getElementById("https-status");
  const connectionEl = document.getElementById("connection-status");
  const speedEl = document.getElementById("speed-status");
  const ipEl = document.getElementById("ip-status");
  const ispEl = document.getElementById("isp-status");
  const locationEl = document.getElementById("location-status");
  const vpnEl = document.getElementById("vpn-status");
  const scoreEl = document.getElementById("security-score");
  const riskEl = document.getElementById("risk-level");
  const recEl = document.getElementById("recommendations");

  /* HTTPS CHECK */
  if (location.protocol === "https:") {
    httpsEl.innerHTML = "HTTPS Encryption: <span class='safe'>Secure</span>";
  } else {
    httpsEl.innerHTML = "HTTPS Encryption: <span class='danger'>Not Secure</span>";
    score -= 30;
    recommendations.push("Use websites that support HTTPS encryption.");
  }

  /* CONNECTION INFO */
  if (navigator.connection) {
    const conn = navigator.connection;
    connectionEl.innerHTML = `Connection Type: <span class='safe'>${conn.effectiveType}</span>`;
    speedEl.innerHTML = `Estimated Downlink Speed: ${conn.downlink} Mbps`;

    if (conn.effectiveType === "2g") {
      score -= 15;
      recommendations.push("Your connection appears slow. Avoid sensitive activity on unstable networks.");
    }
  } else {
    connectionEl.innerHTML = "Connection Info: <span class='warning'>Unavailable</span>";
  }

  /* BACKEND NETWORK ANALYSIS */
  try {
    const response = await fetch("http://localhost:3000/analyze");
    const data = await response.json();

    ipEl.innerHTML = `Public IP: <span class='warning'>${data.ip}</span>`;
    ispEl.innerHTML = `ISP: ${data.isp}`;
    locationEl.innerHTML = `Location: ${data.city}, ${data.region}, ${data.country}`;

    if (data.vpn) {
      vpnEl.innerHTML = "VPN Detected: <span class='safe'>Yes</span>";
      recommendations.push("VPN detected. Ensure it is a trusted provider.");
    } else {
      vpnEl.innerHTML = "VPN Detected: <span class='danger'>No</span>";
      score -= 15;
      recommendations.push("Consider using a reputable VPN on public networks.");
    }

  } catch (error) {
    ipEl.innerHTML = "<span class='danger'>Backend unreachable</span>";
    score -= 20;
    recommendations.push("Network analysis unavailable. Backend may not be running.");
  }

  /* SCORE LOGIC */
  if (score >= 80) {
    riskEl.innerHTML = "<span class='safe'>Low Risk Network</span>";
  } else if (score >= 50) {
    riskEl.innerHTML = "<span class='warning'>Moderate Risk Network</span>";
  } else {
    riskEl.innerHTML = "<span class='danger'>High Risk Network</span>";
  }

  scoreEl.textContent = `Security Score: ${score}/100`;

  /* RECOMMENDATIONS DISPLAY */
  if (recommendations.length === 0) {
    recommendations.push("Your network appears secure. Keep software and devices updated.");
  }

  recommendations.push("Enable your device firewall.");
  recommendations.push("Keep your operating system updated.");
  recommendations.push("Avoid unknown public Wi-Fi networks.");
  recommendations.push("Use WPA3 encryption on your router if available.");

  recommendations.forEach(rec => {
    const li = document.createElement("li");
    li.textContent = rec;
    recEl.appendChild(li);
  });

});
