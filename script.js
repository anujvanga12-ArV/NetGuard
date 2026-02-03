let score = 100;

/* =========================
   HTTPS CHECK
========================= */
if (location.protocol === "https:") {
  document.getElementById("https").innerHTML =
    "HTTPS Encryption: <span class='safe'>Secure</span>";
} else {
  document.getElementById("https").innerHTML =
    "HTTPS Encryption: <span class='danger'>Not Secure</span>";
  score -= 30;
}

/* =========================
   IP / ISP / VPN ANALYSIS
========================= */
fetch("https://ipapi.co/json/")
  .then(res => {
    if (!res.ok) {
      throw new Error("IP API blocked or rate limited");
    }
    return res.json();
  })
  .then(data => {
    // Display IP
    document.getElementById("ip").innerHTML =
      `Public IP: <span class='warn'>${data.ip}</span>`;

    // Display ISP
    document.getElementById("isp").innerHTML =
      `Network Provider: <span class='warn'>${data.org}</span>`;

    const org = (data.org || "").toLowerCase();

    // Public / shared network heuristic
    if (org.includes("school") || org.includes("public")) {
      score -= 15;
    }

    // VPN heuristic
    const vpnKeywords = [
      "vpn", "proxy", "hosting", "cloud",
      "digitalocean", "linode", "ovh",
      "amazon", "aws", "google", "azure",
      "mullvad", "nord", "express", "surfshark"
    ];

    const vpnDetected = vpnKeywords.some(keyword => org.includes(keyword));

    if (vpnDetected) {
      document.getElementById("vpn").innerHTML =
        "VPN Detected: <span class='safe'>Likely</span>";
    } else {
      document.getElementById("vpn").innerHTML =
        "VPN Detected: <span class='warn'>Not detected</span>";
      score -= 20;
    }

    finalizeScore();
  })
  .catch(() => {
    document.getElementById("ip").innerHTML =
      "<span class='danger'>IP information unavailable</span>";

    document.getElementById("isp").innerHTML =
      "<span class='danger'>Network analysis blocked</span>";

    document.getElementById("vpn").innerHTML =
      "<span class='warn'>VPN detection unavailable</span>";

    finalizeScore();
  });

/* =========================
   FINAL SCORE + EXPLANATION
========================= */
function finalizeScore() {
  document.getElementById("score").innerText =
    `Security Score: ${score}/100`;

  const explanation = document.getElementById("explanation");
  const recs = document.getElementById("recommendations");
  recs.innerHTML = "";

  if (score >= 80) {
    explanation.innerHTML =
      "<span class='safe'>Your network appears secure.</span> " +
      "Traffic is encrypted and no major exposure risks were detected.";

    [
      "Continue using HTTPS websites",
      "Avoid unknown public Wi-Fi networks",
      "Keep your OS and browser updated"
    ].forEach(r => recs.innerHTML += `<li>${r}</li>`);

  } else if (score >= 60) {
    explanation.innerHTML =
      "<span class='warn'>Your network has moderate risk.</span> " +
      "Some indicators suggest potential exposure.";

    [
      "Use a VPN on public or shared Wi-Fi",
      "Avoid logging into sensitive accounts",
      "Verify website certificates"
    ].forEach(r => recs.innerHTML += `<li>${r}</li>`);

  } else {
    explanation.innerHTML =
      "<span class='danger'>High-risk network detected.</span> " +
      "Your connection may be vulnerable to monitoring or attacks.";

    [
      "Disconnect from this network if possible",
      "Use a trusted VPN immediately",
      "Avoid entering passwords or payment info",
      "Switch to mobile data if available"
    ].forEach(r => recs.innerHTML += `<li>${r}</li>`);
  }
}
