// ============================================================
// EVALUASI WEBSITE
// GANTI APP_SCRIPT_URL dengan URL Web App Apps Script Anda.
// ============================================================
const APP_SCRIPT_URL =
"https://script.google.com/macros/s/AKfycbwMPhEihjIgZ5wxSRVrbfxTA43XB9_fceEOLOhDgzw_6CNylXk7C6iZphHu_2vY6NJS/exec";

const QUESTIONS = [
  "Website ini mudah digunakan.",
  "Tampilan website ini menarik dan nyaman dilihat.",
  "Materi yang disajikan mudah dipahami.",
  "Fitur-fitur website membantu proses pembelajaran.",
  "Secara keseluruhan, saya puas menggunakan website ini."
];

const $ = id => document.getElementById(id);
let activeEmail = "";

$("questions").innerHTML = QUESTIONS.map((q,i) => `
  <div class="question">
    <h2>${i+1}. ${q}</h2>
    <div class="options">
      ${[1,2,3,4,5].map(v => `
        <label class="option">
          <input type="radio" name="j${i+1}" value="${v}">
          ${v}
        </label>`).join("")}
    </div>
  </div>
`).join("");

function showMessage(el, text, error=false) {
  el.textContent = text;
  el.className = "message" + (error ? " error" : "");
}

$("togglePassword").onclick = () => {
  const input = $("password");
  const visible = input.type === "password";
  input.type = visible ? "text" : "password";
  $("togglePassword").textContent = visible ? "Sembunyikan" : "Lihat";
};

$("loginForm").onsubmit = event => {
  event.preventDefault();

  if (APP_SCRIPT_URL.includes("PASTE_URL")) {
    showMessage($("loginMessage"), "URL Apps Script belum dipasang.", true);
    return;
  }

  const email = $("email").value.trim();
  const password = $("password").value;

  if (!email || !email.includes("@")) {
    showMessage($("loginMessage"), "Masukkan email yang valid.", true);
    return;
  }
  if (!password) {
    showMessage($("loginMessage"), "Masukkan password.", true);
    return;
  }

  activeEmail = email;
  $("loggedEmail").textContent = email;
  $("loginCard").classList.add("hidden");
  $("surveyCard").classList.remove("hidden");
  window.scrollTo({top:0, behavior:"smooth"});
};

$("surveyForm").onchange = () => {
  const total = QUESTIONS.filter((_,i) =>
    document.querySelector(`input[name="j${i+1}"]:checked`)
  ).length;
  $("answered").textContent = total;
};

$("surveyForm").onsubmit = async event => {
  event.preventDefault();

  const answers = QUESTIONS.map((_,i) => {
    const selected = document.querySelector(`input[name="j${i+1}"]:checked`);
    return selected ? Number(selected.value) : null;
  });

  if (answers.some(v => v === null)) {
    showMessage($("surveyMessage"), "Silakan jawab semua 5 pertanyaan.", true);
    return;
  }

  const data = {
    type: "evaluasi",
    email: activeEmail,
    password: $("password").value,
    j1: answers[0],
    j2: answers[1],
    j3: answers[2],
    j4: answers[3],
    j5: answers[4],
    rata_rata: Number((answers.reduce((a,b)=>a+b,0)/5).toFixed(2))
  };

  const button = $("submitButton");
  button.disabled = true;
  button.textContent = "Mengirim...";

  try {
    // text/plain + no-cors menghindari preflight CORS pada Apps Script.
    await fetch(APP_SCRIPT_URL, {
      method: "POST",
      headers: {"Content-Type":"text/plain;charset=utf-8"},
      body: JSON.stringify(data),
      mode: "no-cors"
    });

    // Password tidak disimpan di browser setelah pengiriman.
    $("password").value = "";
    $("surveyCard").classList.add("hidden");
    $("successCard").classList.remove("hidden");
  } catch (error) {
    console.error(error);
    showMessage($("surveyMessage"),
      "Gagal mengirim. Periksa URL Apps Script dan koneksi internet.", true);
    button.disabled = false;
    button.textContent = "Kirim Evaluasi";
  }
};

$("againButton").onclick = () => {
  $("successCard").classList.add("hidden");
  $("loginCard").classList.remove("hidden");
  $("loginForm").reset();
  $("surveyForm").reset();
  $("answered").textContent = "0";
  activeEmail = "";
};
