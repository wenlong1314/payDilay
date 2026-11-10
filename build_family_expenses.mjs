import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const outputDir = "outputs/01a13eba-508c-7d03-a6f7-761291d3068c";
const outputPath = `${outputDir}/家庭支出整理.xlsx`;
const previewDir = ".preview";
const fontFamily = "Arial";

await fs.mkdir(previewDir, { recursive: true });

const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const summary = workbook.worksheets.getItem("支出概览");
const details = workbook.worksheets.getItem("支出明细");

details.getRange("K2:K12").values = [
  ["餐饮"], ["居住"], ["交通"], ["日用品"], ["医疗"], ["教育"],
  ["娱乐"], ["人情往来"], ["保险"], ["通讯"], ["其他"],
];
details.getRange("B7:B306").dataValidation = {
  rule: { type: "list", formula1: "=$K$2:$K$12" },
};

details.getRange("L2:L9").values = [
  ["微信"], ["支付宝"], ["银行卡"], ["现金"],
  ["信用卡"], ["美团"], ["抖音"], ["其他"],
];
details.getRange("E7:E306").dataValidation = {
  rule: { type: "list", formula1: "=$L$2:$L$9" },
};

details.getRange("M2:M10").values = [
  ["父亲"], ["母亲"], ["丈夫"], ["妻子"], ["孩子"],
  ["父母"], ["夫妻"], ["全家"], ["其他"],
];
details.getRange("F7:F306").dataValidation = {
  rule: { type: "list", formula1: "=$M$2:$M$10" },
};

details.getRange("A7:H14").values = [
  [new Date(Date.UTC(2026, 8, 15)), "其他", "妻子微信支出汇总", 1212, "微信", "妻子", null, "未提供明细分类"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "妻子支付宝支出汇总", 3306, "支付宝", "妻子", null, "未提供明细分类"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "妻子银行卡支出汇总", 619, "银行卡", "妻子", null, "100+100+99+320"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "丈夫微信未分类支出", 1763, "微信", "丈夫", null, "微信3263扣除生活费1000及随份子500"],
  [new Date(Date.UTC(2026, 8, 15)), "人情往来", "随份子", 500, "微信", "丈夫", "是", "微信总额3263中的500"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "丈夫支付宝支出", 683, "支付宝", "丈夫", null, "未提供明细分类"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "丈夫美团支出", 200, "美团", "丈夫", null, "约200；无账单；后续尽量用微信支付"],
  [new Date(Date.UTC(2026, 8, 15)), "其他", "丈夫抖音支出", 66, "抖音", "丈夫", null, "后续尽量用微信支付"],
];
details.getRange("A15:H15").clear({ applyTo: "contents" });
details.getRange("A7:A15").format.numberFormat = "yyyy-mm-dd";
details.getRange("D7:D15").format.numberFormat = "¥#,##0.00";

summary.getRange("B4").values = [[new Date(Date.UTC(2026, 8, 1))]];

details.getRange("P1:S1").values = [["每月固定支出", null, null, null]];
details.getRange("P1:S1").format = {
  fill: "#315B3E",
  font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
  borders: { preset: "outside", style: "thin", color: "#315B3E" },
};
details.getRange("P2:S2").values = [["项目", "类别", "金额（元）", "归属"]];
details.getRange("P3:S12").values = [
  ["房租", "居住", 4600, "全家"],
  ["房贷", "居住", 2450, "全家"],
  ["父母买菜钱", "餐饮", 1250, "父母"],
  ["孩子小班", "教育", 1650, "孩子"],
  ["妻子社保", "保险", 3392, "妻子"],
  ["水费", "居住", 80, "全家"],
  ["电费", "居住", 200, "全家"],
  ["手机话费", "通讯", 160, "全家"],
  ["父母医保", "保险", 150, "父母"],
  [null, null, null, null],
];

let fixedTable = details.tables.items.find((table) => table.name === "FixedExpensesTable");
if (!fixedTable) {
  fixedTable = details.tables.add("P2:S12", true, "FixedExpensesTable");
}
fixedTable.style = "TableStyleLight1";
fixedTable.showBandedColumns = false;
fixedTable.showFilterButton = true;
details.getRange("P2:S2").format = {
  fill: "#315B3E",
  font: { name: fontFamily, size: 10, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  borders: {
    insideVertical: { style: "thin", color: "#FFFFFF" },
    bottom: { style: "thin", color: "#315B3E" },
  },
};
details.getRange("Q3:Q12").dataValidation = {
  rule: { type: "list", formula1: "=$K$2:$K$12" },
};
details.getRange("S3:S12").dataValidation = {
  rule: { type: "list", formula1: "=$M$2:$M$10" },
};
details.getRange("R3:R12").format.fill = "#FFF3BF";
details.getRange("R3:R12").format.numberFormat = "¥#,##0.00";

details.getRange("P14:S14").values = [["固定支出合计", null, null, null]];
details.getRange("R14").formulas = [["=SUM(R3:R12)"]];
details.getRange("P14:S14").format = {
  fill: "#E7F1EA",
  font: { name: fontFamily, size: 10, bold: true, color: "#23452D" },
  borders: { top: { style: "double", color: "#315B3E" } },
};
details.getRange("R14").format.numberFormat = "¥#,##0.00";

details.getRange("P16:S16").values = [["家庭情况", null, null, null]];
details.getRange("P16:S16").format = {
  fill: "#E7F1EA",
  font: { name: fontFamily, size: 10, bold: true, color: "#315B3E" },
  borders: { bottom: { style: "thin", color: "#9BB7A3" } },
};
details.getRange("P17:Q18").values = [
  ["家庭成员", "父母、夫妻、一个孩子"],
  ["孩子情况", "3岁男孩，小班"],
];
details.getRange("P17:P18").format.font = { name: fontFamily, size: 10, bold: true, color: "#374151" };
details.getRange("Q17:Q18").format.font = { name: fontFamily, size: 10, color: "#374151" };
details.getRange("P20:S20").values = [["固定支出会自动计入概览，无需在明细中重复录入。", null, null, null]];
details.getRange("P20").format.font = { name: fontFamily, size: 10, italic: true, color: "#6B7280" };

details.getRange("P1:P306").format.columnWidth = 18;
details.getRange("Q1:Q306").format.columnWidth = 22;
details.getRange("R1:R306").format.columnWidth = 14;
details.getRange("S1:S306").format.columnWidth = 13;

summary.getRange("A7:K7").clear({ applyTo: "all" });
summary.getRange("A7:K7").values = [["本月合计", null, null, "每月固定支出", null, null, "本月日常支出", null, null, "支出笔数", null]];
summary.getRange("B7").formulas = [["=SUMIFS('支出明细'!$D$7:$D$306,'支出明细'!$A$7:$A$306,\">=\"&$B$4,'支出明细'!$A$7:$A$306,\"<\"&DATE(YEAR($B$4),MONTH($B$4)+1,1))+'支出明细'!$R$14"]];
summary.getRange("E7").formulas = [["='支出明细'!$R$14"]];
summary.getRange("H7").formulas = [["=SUMIFS('支出明细'!$D$7:$D$306,'支出明细'!$A$7:$A$306,\">=\"&$B$4,'支出明细'!$A$7:$A$306,\"<\"&DATE(YEAR($B$4),MONTH($B$4)+1,1))"]];
summary.getRange("K7").formulas = [["=COUNTIFS('支出明细'!$A$7:$A$306,\">=\"&$B$4,'支出明细'!$A$7:$A$306,\"<\"&DATE(YEAR($B$4),MONTH($B$4)+1,1))+COUNT('支出明细'!$R$3:$R$12)"]];
for (const label of ["A7", "D7", "G7", "J7"]) {
  summary.getRange(label).format = {
    fill: "#E7F1EA",
    font: { name: fontFamily, size: 10, bold: true, color: "#315B3E" },
  };
}
summary.getRange("A7:K7").format.borders = { preset: "outside", style: "thin", color: "#C9D7CE" };
summary.getRange("B7:E7").format.horizontalAlignment = "right";
summary.getRange("H7:K7").format.horizontalAlignment = "right";
summary.getRange("B7").format.numberFormat = "¥#,##0.00";
summary.getRange("E7").format.numberFormat = "¥#,##0.00";
summary.getRange("H7").format.numberFormat = "¥#,##0.00";
summary.getRange("K7").format.numberFormat = "0\" 笔\"";
summary.getRange("I1:I40").format.columnWidth = 3;
summary.getRange("J1:J40").format.columnWidth = 13;
summary.getRange("K1:K40").format.columnWidth = 12;

summary.getRange("A22:C23").clear({ applyTo: "all" });
for (let i = 0; i < 11; i += 1) {
  const row = 12 + i;
  const categoryRow = 2 + i;
  summary.getRange(`A${row}`).formulas = [[`='支出明细'!K${categoryRow}`]];
  summary.getRange(`B${row}`).formulas = [[`=SUMIFS('支出明细'!$D$7:$D$306,'支出明细'!$B$7:$B$306,$A${row},'支出明细'!$A$7:$A$306,\">=\"&$B$4,'支出明细'!$A$7:$A$306,\"<\"&DATE(YEAR($B$4),MONTH($B$4)+1,1))+SUMIFS('支出明细'!$R$3:$R$12,'支出明细'!$Q$3:$Q$12,$A${row})`]];
  summary.getRange(`C${row}`).formulas = [[`=IF($B$23=0,0,B${row}/$B$23)`]];
}
summary.getRange("A12:C22").format.borders = {
  bottom: { style: "thin", color: "#E2E8E4" },
};
summary.getRange("A23:C23").values = [["合计", null, null]];
summary.getRange("B23").formulas = [["=SUM(B12:B22)"]];
summary.getRange("C23").formulas = [["=IF(B23=0,0,SUM(C12:C22))"]];
summary.getRange("A23:C23").format = {
  fill: "#E7F1EA",
  font: { name: fontFamily, size: 10, bold: true, color: "#23452D" },
  borders: { top: { style: "double", color: "#315B3E" } },
};
summary.getRange("B12:B23").format.numberFormat = "¥#,##0.00";
summary.getRange("C12:C23").format.numberFormat = "0.0%";
summary.charts.items[0].setData(summary.getRange("A11:B22"));
summary.charts.items[0].series.items[0].fill = "#4F7A5B";

summary.getRange("A25:B25").values = [["全年月度支出（含固定）", null]];
for (let i = 0; i < 12; i += 1) {
  const row = 27 + i;
  summary.getRange(`B${row}`).formulas = [[`=SUMIFS('支出明细'!$D$7:$D$306,'支出明细'!$A$7:$A$306,\">=\"&A${row},'支出明细'!$A$7:$A$306,\"<\"&DATE(YEAR(A${row}),MONTH(A${row})+1,1))+'支出明细'!$R$14`]];
}
summary.charts.items[1].title = "全年月度支出（含固定）";

workbook.recalculate();

const expectedFixed = 4600 + 2450 + 1250 + 1650 + 3392 + 80 + 200 + 160 + 150;
const expectedWifeVariable = 1212 + 3306 + 619;
const expectedHusbandGross = 3263 + 683 + 200 + 66 + 2450;
const expectedHusbandVariable = expectedHusbandGross - 2450 - 1000;
const expectedVariable = expectedWifeVariable + expectedHusbandVariable;
const expectedMonthly = expectedFixed + expectedVariable;
const fixedTotal = details.getRange("R14").values[0][0];
const mortgageFixed = details.getRange("R4").values[0][0];
const parentFoodFixed = details.getRange("R5").values[0][0];
const husbandVariableTotal = details.getRange("D10:D14").values.reduce((sum, row) => sum + row[0], 0);
const monthlyTotal = summary.getRange("B7").values[0][0];
const variableTotal = summary.getRange("H7").values[0][0];
const expenseCount = summary.getRange("K7").values[0][0];
const housingTotal = summary.getRange("B13").values[0][0];
const foodTotal = summary.getRange("B12").values[0][0];
const educationTotal = summary.getRange("B17").values[0][0];
const relationshipTotal = summary.getRange("B19").values[0][0];
const insuranceTotal = summary.getRange("B20").values[0][0];
const communicationTotal = summary.getRange("B21").values[0][0];
const otherTotal = summary.getRange("B22").values[0][0];
const categoryTotal = summary.getRange("B23").values[0][0];
const septemberTotal = summary.getRange("B35").values[0][0];
const octoberTotal = summary.getRange("B36").values[0][0];
if (expectedHusbandGross !== 6662 || mortgageFixed !== 2450 || parentFoodFixed !== 1250 || husbandVariableTotal !== expectedHusbandVariable || fixedTotal !== expectedFixed || monthlyTotal !== expectedMonthly || variableTotal !== expectedVariable || expenseCount !== 17 || categoryTotal !== expectedMonthly || otherTotal !== 7849 || relationshipTotal !== 500 || septemberTotal !== expectedMonthly || octoberTotal !== expectedFixed || housingTotal !== 7330 || foodTotal !== 1250 || educationTotal !== 1650 || insuranceTotal !== 3542 || communicationTotal !== 160) {
  throw new Error(`支出校验失败: husbandGross=${expectedHusbandGross}, mortgageFixed=${mortgageFixed}, parentFoodFixed=${parentFoodFixed}, husbandVariable=${husbandVariableTotal}, fixed=${fixedTotal}, month=${monthlyTotal}, variable=${variableTotal}, count=${expenseCount}, category=${categoryTotal}, other=${otherTotal}, relationship=${relationshipTotal}, september=${septemberTotal}, october=${octoberTotal}, housing=${housingTotal}, food=${foodTotal}, education=${educationTotal}, insurance=${insuranceTotal}, communication=${communicationTotal}`);
}
console.log(`EXPENSE_CHECK=PASS husbandGross=${expectedHusbandGross} mortgageDeduped=${mortgageFixed} parentSupportDeduped=1000 husbandVariable=${expectedHusbandVariable} fixed=${expectedFixed} variable=${expectedVariable} month=${expectedMonthly}`);

const summaryCheck = await workbook.inspect({
  kind: "table", range: "支出概览!A4:K38", include: "values,formulas",
  tableMaxRows: 38, tableMaxCols: 11, maxChars: 12000,
});
console.log("SUMMARY_CHECK");
console.log(summaryCheck.ndjson);

const detailCheck = await workbook.inspect({
  kind: "table", range: "支出明细!A6:H14", include: "values,formulas",
  tableMaxRows: 9, tableMaxCols: 8, maxChars: 8000,
});
console.log("DETAIL_CHECK");
console.log(detailCheck.ndjson);

const fixedCheck = await workbook.inspect({
  kind: "table", range: "支出明细!M1:S20", include: "values,formulas",
  tableMaxRows: 20, tableMaxCols: 7, maxChars: 7000,
});
console.log("FIXED_CHECK");
console.log(fixedCheck.ndjson);

const errors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A|#NUM!|#NULL!|#SPILL!|#CALC!",
  options: { useRegex: true, maxResults: 300 },
  summary: "final formula error scan",
});
console.log("ERROR_SCAN");
console.log(errors.ndjson);

const summaryPreview = await workbook.render({
  sheetName: "支出概览", range: "A1:L40", scale: 1.25, format: "png",
});
await fs.writeFile(`${previewDir}/支出概览_更新.png`, new Uint8Array(await summaryPreview.arrayBuffer()));

const detailPreview = await workbook.render({
  sheetName: "支出明细", range: "A1:S22", scale: 1.25, format: "png",
});
await fs.writeFile(`${previewDir}/支出明细_更新.png`, new Uint8Array(await detailPreview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

const savedWorkbook = await SpreadsheetFile.importXlsx(await FileBlob.load(outputPath));
const savedSummary = savedWorkbook.worksheets.getItem("支出概览");
const savedDetails = savedWorkbook.worksheets.getItem("支出明细");
const savedTotalRaw = savedSummary.getRange("B7").values[0][0];
const savedTotal = savedTotalRaw instanceof Date
  ? Math.round((savedTotalRaw.getTime() - Date.UTC(1899, 11, 30)) / 86400000)
  : savedTotalRaw;
const savedFixed = savedDetails.getRange("R14").values[0][0];
if (savedTotal !== expectedMonthly || savedFixed !== expectedFixed) {
  throw new Error(`导出后校验失败: total=${savedTotal}, fixed=${savedFixed}`);
}
const savedCheck = await savedWorkbook.inspect({
  kind: "sheet,drawing", include: "id,name,type", maxChars: 3000,
});
console.log("SAVED_FILE_CHECK");
console.log(savedCheck.ndjson);

const savedPreview = await savedWorkbook.render({
  sheetName: "支出概览", range: "A1:L40", scale: 1, format: "png",
});
await fs.writeFile(`${previewDir}/支出概览_更新_导出后.png`, new Uint8Array(await savedPreview.arrayBuffer()));
await fs.rm(`${outputPath}.inspect.ndjson`, { force: true });
console.log(`OUTPUT=${outputPath}`);
