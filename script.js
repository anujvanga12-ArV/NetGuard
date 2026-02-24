document.addEventListener("DOMContentLoaded", function () {

  let score = 100;
  let recommendations = [];

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

  /* -------- HTTPS CHECK -------- */

  if (window.location.protocol === "https:") {
    httpsEl.innerHTML = "HTTPS Encryption: <span class='safe'>Secure</span>";
  } else {
    httpsEl.innerHTML = "HTTPS Encryption: <span class='danger'>Not Secure</span>";
    score -= 30;
    recommendations.push("Use HTTPS websites for secure browsing.");
  }

  /* -------- CONNECTION INFO -------- */

  if (navigator.connection) {
    const conn = navigator.connection;
    connectionEl.innerHTML = 
      "Connection Type: <span class='safe'>" + conn.effectiveType + "</span>";
    speedEl.innerHTML = 
      "Estimated Speed: " + conn.downlink + " Mbps";
  } else {
    connectionEl.innerHTML = 
      "Connection Info: <span class='warning'>Unavailable</span>";
  }

  /* -------- PUBLIC IP (FALLBACK METHOD) -------- */

  fetch("https://ipapi.co/json/")
    .then(res => res.json())
    .then(data => {

      ipEl.innerHTML = 
        "Public IP: <span class='warning'>" + data.ip + "</span>";

      ispEl.innerHTML = 
        "ISP: " + data.org;

      locationEl.innerHTML = 
        "Location: " + data.city + ", " + data.region + ", " + data.country_name;

      if (data.org && (
          data.org.toLowerCase().includes("vpn") ||
          data.org.toLowerCase().includes("digitalocean") ||
          data.org.toLowerCase().includes("amazon") ||
          data.org.toLowerCase().includes("google") ||
          data.org.toLowerCase().includes("azure")
      )) {
        vpnEl.innerHTML =
          "VPN Detected: <span class='safe'>Possible VPN</span>";
      } else {
        vpnEl.innerHTML =
          "VPN Detected: <span class='danger'>Not Detected</span>";
        score -= 15;
        recommendations.push("Consider using a trusted VPN on public WiFi.");
      }

      finalizeScore();

    })
    .catch(() => {

      ipEl.innerHTML = "<span class='danger'>IP lookup failed</span>";
      ispEl.innerHTML = "";
      locationEl.innerHTML = "";
      vpnEl.innerHTML = 
        "<span class='warning'>VPN detection unavailable</span>";

      score -= 20;
      recommendations.push("Network lookup service unavailable.");

      finalizeScore();
    });

  /* -------- FINAL SCORE FUNCTION -------- */

  function finalizeScore() {

    if (score >= 80) {
      riskEl.innerHTML = "<span class='safe'>Low Risk Network</span>";
    } else if (score >= 50) {
      riskEl.innerHTML = "<span class='warning'>Moderate Risk Network</span>";
    } else {
      riskEl.innerHTML = "<span class='danger'>High Risk Network</span>";
    }

    scoreEl.textContent = "Security Score: " + score + "/100";

    if (recommendations.length === 0) {
      recommendations.push("Your network appears reasonably secure.");
    }

    recommendations.push("Enable your device firewall.");
    recommendations.push("Keep your operating system updated.");
    recommendations.push("Use WPA3 encryption on your router if available.");
    recommendations.push("Avoid connecting to unknown public WiFi networks.");

    recEl.innerHTML = "";

    recommendations.forEach(function (rec) {
      const li = document.createElement("li");
      li.textContent = rec;
      recEl.appendChild(li);
    });
  }

});
