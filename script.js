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

  const explanation = document.getElementById("explanation");
  const recs = document.getElementById("recommendations");
  recs.innerHTML = "";

  if (score >= 80) {
    explanation.innerHTML =
      "<span class='safe'>Your network appears secure.</span> " +
      "Traffic is encrypted and no major exposure risks were detected.";

    ["Continue using HTTPS websites",
     "Avoid unknown public Wi-Fi networks",
     "Keep your OS and browser updated"]
     .forEach(r => recs.innerHTML += `<li>${r}</li>`);

  } else if (score >= 60) {
    explanation.innerHTML =
      "<span class='warn'>Your network has moderate risk.</span> " +
      "Some indicators suggest potential exposure.";

    ["Use a VPN on public or shared Wi-Fi",
     "Avoid logging into sensitive accounts",
     "Verify website certificates"]
     .forEach(r => recs.innerHTML += `<li>${r}</li>`);

  } else {
    explanation.innerHTML =
      "<span class='danger'>High risk network detected.</span> " +
      "Your connection may be vulnerable to monitoring or attacks.";

    ["Disconnect from this network if possible",
     "Use a trusted VPN immediately",
     "Avoid entering passwords or payment info",
     "Switch to mobile data if available"]
     .forEach(r => recs.innerHTML += `<li>${r}</li>`);
  }
}
