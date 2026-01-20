let score = 100;

// HTTPS
if (location.protocol === "https:") {
  document.getElementById("https").innerHTML =
    "HTTPS Encryption: <span class='safe'>Secure</span>";
} else {
  document.getElementById("https").innerHTML =
    "HTTPS Encryption: <span class='danger'>Not Secure</span>";
  score -= 30;
}

// IP + ISP
fetch("https://ipapi.co/json/")
  .then(res => res.json())
  .then(data => {
    document.getElementById("ip").innerHTML =
      `Public IP: <span class='warn'>${data.ip}</span>`;

    document.getElementById("isp").innerHTML =
      `Network Provider: <span class='warn'>${data.org}</span>`;

    if (data.org.toLowerCase().includes("school") ||
        data.org.toLowerCase().includes("public")) {
      score -= 15;
    }

    // VPN heuristic
    if (data.org.toLowerCase().includes("vpn")) {
      document.getElementById("vpn").innerHTML =
        "VPN Detected: <span class='safe'>Yes</span>";
    } else {
      document.getElementById("vpn").innerHTML =
        "VPN Detected: <span class='warn'>No</span>";
      score -= 20;
    }

    finalizeScore();
  });

function finalizeScore() {
  document.getElementById("score").innerText =
    `Security Score: ${score}/100`;

  let rating = "High Risk";
  if (score >= 80) rating = "Secure";
  else if (score >= 60) rating = "Moderate Risk";

  document.getElementById("rating").innerText = rating;
}
