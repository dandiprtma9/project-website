// ============================================================
// GOOGLE APPS SCRIPT - EVALUASI WEBSITE
// Spreadsheet ID sudah disesuaikan dengan spreadsheet Anda.
// ============================================================
const SPREADSHEET_ID = "1hs4sylpt7E9WIOSLvmx78ciPHFTtpmHl";
const SHEET_NAME = "Evaluasi";

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return response({status:"error", message:"Data POST tidak ditemukan."});
    }

    const data = JSON.parse(e.postData.contents);

    if (data.type !== "evaluasi") {
      return response({status:"error", message:"Tipe data tidak dikenali."});
    }

    const email = String(data.email || "").trim();
    const password = String(data.password || "");
    const answers = [data.j1,data.j2,data.j3,data.j4,data.j5].map(Number);

    if (!email || !email.includes("@")) {
      return response({status:"error", message:"Email tidak valid."});
    }

    if (!password) {
      return response({status:"error", message:"Password kosong."});
    }

    if (answers.some(v => !Number.isInteger(v) || v < 1 || v > 5)) {
      return response({status:"error", message:"Jawaban harus 1 sampai 5."});
    }

    const average = Number(
      (answers.reduce((a,b)=>a+b,0) / answers.length).toFixed(2)
    );

    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);

    if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp","Email","Password",
        "J1","J2","J3","J4","J5","Rata-rata"
      ]);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      new Date(),
      email,
      password,
      answers[0],
      answers[1],
      answers[2],
      answers[3],
      answers[4],
      average
    ]);

    return response({
      status:"success",
      message:"Evaluasi berhasil disimpan."
    });

  } catch (error) {
    console.error(error);
    return response({status:"error", message:String(error)});
  }
}

function response(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

// Jalankan fungsi ini SEKALI secara manual untuk membuat sheet/header.
// Jangan menjalankan doPost(e) dari tombol Run.
function setupEvaluasi() {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);

  if (!sheet) sheet = spreadsheet.insertSheet(SHEET_NAME);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp","Email","Password",
      "J1","J2","J3","J4","J5","Rata-rata"
    ]);
    sheet.setFrozenRows(1);
  }
}
