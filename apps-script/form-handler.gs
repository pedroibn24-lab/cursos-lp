var SHEET_NAME = "Leads"; // Nome da aba na planilha

var HEADERS = [
  "Data e hora",
  "Nome completo",
  "WhatsApp",
  "Cidade",
  "Empresa",
  "Escolaridade",
  "Tipo de formação",
  "Curso / Área",
  "Modalidade",
  "Quando pretende começar",
  "Como ficou sabendo",
  "Contato preferido",
  "Autorizou contato",
  "Aceitou política de privacidade"
];

function doPost(e) {
  try {
    var ss    = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    var p     = e.parameter;

    // Cria cabeçalho automaticamente se a planilha estiver vazia
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      sheet.getRange(1, 1, 1, HEADERS.length)
        .setFontWeight("bold")
        .setBackground("#f3f3f3");
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([
      p.dataHora          || new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" }),
      p.nome              || "",
      p.whatsapp          || "",
      p.cidade            || "",
      p.empresa           || "",
      p.escolaridade      || "",
      p.formacao          || "",
      p.curso             || "",
      p.modalidade        || "",
      p.quando            || "",
      p.origem            || "",
      p.contatoPref       || "",
      p.autorizaContato   || "",
      p.politicaPriv      || ""
    ]);

    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
