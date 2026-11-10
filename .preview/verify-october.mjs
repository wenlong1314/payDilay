import assert from "node:assert/strict";
import fs from "node:fs/promises";
import vm from "node:vm";
import { pathToFileURL } from "node:url";
import path from "node:path";
import { chromium } from "playwright";

const source = (await Promise.all(["october-data.js", "october-alipay-data.js", "october-wechat-data.js", "october-two-data.js", "september-one-alipay-data.js"].map(file => fs.readFile(file, "utf8")))).join("\n");
const septemberRows = vm.runInNewContext(`${source}\nseptemberOneAlipayTransactions;`);
const septemberReport = vm.runInNewContext(`${source}\nsummarizeSeptemberOneAlipay();`);
assert.deepEqual(JSON.parse(JSON.stringify(septemberReport)), {
  rawCount:72, purchaseCount:27, grossPurchaseCents:350651, partialRefundCents:20000,
  netExpenseCents:330651, closedOrderCents:145174, repaymentCents:202019,
  crossMonthRefundCents:134200, replacedSummaryCents:330600
});
assert.equal(new Set(septemberRows.map(row => row.transactionId)).size, 72);
assert.equal(septemberRows.find(row => row.transactionId === "2026092723001455431414857510").budgetCents, 9992);
assert.ok(septemberRows.filter(row => row.status === "交易关闭" || row.sourceCategory === "退款" || row.sourceCategory === "信用借还" || row.treatment.includes("往返转账")).every(row => row.budgetCents === 0));
const crossRefunds = vm.runInNewContext(`${source}\nseptemberOneCrossMonthRefunds;`);
assert.equal(crossRefunds.reduce((sum, row) => sum + row.cents, 0), septemberRows.find(row => row.transactionId === crossRefunds[0].originalId).cents);
const ledger = vm.runInNewContext(`${source}\noctoberLedger;`);
const twoLedger = vm.runInNewContext(`${source}\noctoberTwoLedger;`);
assert.equal(twoLedger.wechatTransactions.length, 85);
assert.equal(new Set(twoLedger.wechatTransactions.map(row => row.transactionId)).size, 85);
assert.ok(twoLedger.wechatTransactions.every(row => Number.isSafeInteger(row.cents)));
assert.equal(twoLedger.wechatTransactions.filter(row => row.method.includes("退款")).length, 4);
assert.equal(twoLedger.wechatTransactions.filter(row => row.payment.includes("亲属卡")).length, 6);
assert.ok(twoLedger.wechatTransactions.filter(row => row.payment.includes("亲属卡") || row.direction === "收入" || row.status === "已全额退款").every(row => row.budgetCents === 0));
assert.deepEqual(Array.from(twoLedger.wechatTransactions.filter(row => row.refundCents > 0), row => row.budgetCents), [81,68]);
assert.equal(twoLedger.wechatTransactions.find(row => row.transactionId === "53010003508172202610220031085064").budgetCents, 0);
assert.equal(twoLedger.wechatTransactions.find(row => row.transactionId === "53010003508172202610220031085064").fixedKey, "父母买菜钱");
const duplicateInsurance = twoLedger.wechatTransactions.filter(row => row.party === "泰康在线");
assert.equal(duplicateInsurance.length, 2);
assert.equal(duplicateInsurance.reduce((sum, row) => sum + row.cents, 0), 14060);
assert.ok(duplicateInsurance.every(row => row.budgetCents === 0 && row.fixedKey === "父母医保" && row.treatment === "剔除重复医保"));
assert.equal(twoLedger.extraMeituanCents, 0);
assert.equal(twoLedger.replacedMeituanSummaryCents, 25800);
assert.equal(twoLedger.wechatTransactions.find(row => row.party === "手机充值-中国移动").budgetCents, 0);
const twoReport = vm.runInNewContext(`${source}\nsummarizeOctoberTwo();`);
assert.equal(twoLedger.alipayTransactions.length, 26);
assert.equal(new Set(twoLedger.alipayTransactions.map(row => row.transactionId)).size, 26);
assert.equal(twoLedger.alipayTransactions.filter(row => row.cents === 0).length, 3);
assert.deepEqual(JSON.parse(JSON.stringify(twoReport)), {
  alipayOutCents: 158451, alipayDailyCents: 148451, alipayFixedCents: 10000,
  nonBudgetRepaymentCents: 13463,
  wechatOutCents:571647, wechatFamilyOutCents:84500, wechatNonFamilyFullRefundCents:100000,
  wechatPartialRefundCents:154, wechatNetCents:386993, wechatFixedCents:119060, wechatDailyCents:267933,
  duplicateFixedInsuranceCents:14060, twoRecordedCents: 416384,
  mastercard: {alipayOutCents:39148,wechatOutCents:245280,outCents:284428,count:78,refundCents:154,netCents:284274,scope:"本次2号支付宝和微信明细，未核对独立卡账单"}
});
const paymentTotals = {};
for (const row of twoLedger.alipayTransactions.filter(row => row.direction === "支出")) paymentTotals[row.payment || "未列"] = (paymentTotals[row.payment || "未列"] || 0) + row.cents;
assert.deepEqual(paymentTotals, {"花呗":92022,"Mastercard(7899)":39148,"未列":0,"北京银行信用购":19264,"郑州银行储蓄卡(3513)":8017});
const report = vm.runInNewContext(`${source}\nsummarizeOctober();`);
assert.deepEqual(JSON.parse(JSON.stringify(report)), {
  fixedCents: 1401617, dailyCents: 504494, twoRecordedCents: 416384, recordedTotalCents: 2322495,
  matchedFixedCents: 1052256, investmentCents: 139616, offsetCents: 50000,
  outCents: 1737566, inCents: 4780439
});
assert.equal(ledger.transactions.length, 21);
const socialPair = ledger.transactions.filter(row => row.fixedKey === "1号社保");
assert.deepEqual(Array.from(socialPair, row => row.cents), [-882456, 539639]);
assert.equal(ledger.socialSecurityCents, 342817);
assert.equal(ledger.socialSecurityCents, -socialPair.reduce((sum, row) => sum + row.cents, 0));
assert.equal(socialPair[1].status, "社保抵减");
assert.equal(socialPair[1].method, "代发工资");
assert.equal(report.dailyCents, 504494, "social offset must not reduce nonfixed expenses again");
let balance = ledger.openingBalanceCents;
for (const row of ledger.transactions) {
  balance += row.cents;
  assert.equal(balance, row.balanceCents, `${row.date} ${row.party}: balance`);
}
assert.equal(balance, ledger.closingBalanceCents);
const out = ledger.transactions.filter(row => row.cents < 0).reduce((sum, row) => sum - row.cents, 0);
const incoming = ledger.transactions.filter(row => row.cents > 0).reduce((sum, row) => sum + row.cents, 0);
assert.equal(out, 1737566);
assert.equal(incoming, 4780439);
assert.equal(ledger.transactions.filter(row => row.status === "投资").reduce((sum, row) => sum - row.cents, 0), 139616);
assert.equal(report.outCents, report.dailyCents - ledger.wechatCents + report.matchedFixedCents + report.investmentCents + report.offsetCents);
assert.equal(ledger.transactions.filter(row => row.status === "往返抵销").reduce((sum, row) => sum + row.cents, 0), 0);
const markdown = await fs.readFile("家庭支出整理.md", "utf8");
for (const amount of ["23,224.95", "14,016.17", "3,428.17", "3,603.59", "4,163.84", "5,044.94", "2,842.74", "22,281.51", "5,137.51", "3,306.51"]) assert.ok(markdown.includes(amount), amount);
for (const row of septemberRows) assert.ok(markdown.includes(row.transactionId), row.transactionId);
assert.equal(markdown.includes("新增固定医保"), false);
assert.equal(markdown.includes("| 泰康医保（两笔） |"), false);
assert.match(markdown, /8,824.56 − 5,396.39 = 3,428.17/);
assert.match(markdown, /MASTERCARD\(7899\)卡支出汇总/);
for (const row of twoLedger.wechatTransactions) assert.ok(markdown.includes(row.transactionId), row.transactionId);
for (const row of twoLedger.alipayTransactions) assert.ok(markdown.includes(row.transactionId), row.transactionId);
assert.equal(markdown.includes("待补账单"), false);
assert.equal(markdown.includes("需要确认的去重事项"), false);

const browser = await chromium.launch({headless:true, executablePath:"C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"});
try {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on("pageerror", e => errors.push(e.message));
  await page.goto(pathToFileURL(path.resolve("index.html")).href);
  await page.locator("#october-total").getByText("¥23,224.95", {exact:true}).waitFor();
  assert.equal(await page.locator("#october-fixed").innerText(), "¥14,016.17");
  assert.match(await page.locator("#view-october").innerText(), /固定社保3,428.17元/);
  assert.equal(await page.locator("#october-daily").innerText(), "¥5,044.94");
  assert.equal(await page.locator("#october-two-daily").innerText(), "¥4,163.84");
  const summaryValues = await page.locator("#view-october .metric-grid .metric-value").allTextContents();
  const summaryCents = summaryValues.map(value => Math.round(Number(value.replace(/[¥,]/g, "")) * 100));
  assert.equal(summaryCents[0], summaryCents.slice(1).reduce((sum, value) => sum + value, 0));
  assert.equal(await page.locator("#view-october .metric-grid #october-investment").count(), 0);
  assert.match(await page.locator(".investment-note").innerText(), /不计入上方支出合计/);
  assert.equal(await page.locator("#october-investment").innerText(), "¥1,396.16");
  const categoryValues = await page.locator("#october-category-bars .category-amount").allTextContents();
  assert.equal(categoryValues.reduce((sum, value) => sum + Math.round(Number(value.replace(/[¥,]/g, "")) * 100), 0), 2322495);
  assert.match(await page.locator("#october-category-bars").innerText(), /3,603.59/);
  assert.equal(await page.locator("#october-two-alipay").innerText(), "¥1,584.51");
  assert.equal(await page.locator("#october-two-alipay-daily").innerText(), "¥1,484.51");
  assert.equal(await page.locator("#october-mastercard-total").innerText(), "¥2,842.74");
  assert.equal(await page.locator("#october-mastercard-body tr").count(), 80);
  assert.equal(await page.locator("#october-two-meituan").innerText(), "¥258.24");
  assert.match(await page.locator("#view-october").innerText(), /2,679.33/);
  assert.match(await page.locator("#view-october").innerText(), /原258元是汇总/);
  assert.match(await page.locator("#view-october").innerText(), /退款1.54/);
  assert.equal(await page.locator("#view-october").isVisible(), true);
  assert.equal(await page.locator("#view-overview").isVisible(), false);
  await page.screenshot({path:".preview/october-desktop.png",fullPage:true});
  await page.locator("#october-details-button").click();
  assert.equal(await page.locator("#expense-table-body tr").count(), 23 + twoLedger.alipayTransactions.length + twoLedger.wechatTransactions.length);
  assert.equal(await page.locator("#expense-table-body tr").filter({has:page.locator("td.amount-cell", {hasText:"待补金额"})}).count(), 0);
  assert.equal(await page.locator("#expense-table-body tr").filter({hasText:"剔除亲属卡"}).count(), 6);
  assert.match(await page.locator("#expense-table-body").innerText(), /仅计净额0.81元/);
  assert.match(await page.locator("#expense-table-body").innerText(), /50元手机话费/);
  assert.match(await page.locator("#table-summary").innerText(), /2,842.74/);
  assert.match(await page.locator("#expense-table-body").innerText(), /134.63（不计）/);
  assert.match(await page.locator("#expense-table-body").innerText(), /80.17/);
  assert.match(await page.locator("#table-summary").innerText(), /5,044.94/);
  assert.match(await page.locator("#expense-table-body").innerText(), /社保抵减/);
  assert.match(await page.locator("#expense-table-body").innerText(), /固定社保净额3428.17元/);
  assert.equal(await page.locator("#expense-table-body tr").filter({hasText:"剔除重复医保"}).count(), 2);
  assert.equal((await page.locator("#expense-table-body").innerText()).includes("待核对"), false);
  assert.equal(await page.locator(".filter-group").isVisible(), false);
  await page.locator("[data-view=fixed]").click();
  assert.match(await page.locator("#fixed-total").innerText(), /14,016.17/);
  assert.equal((await page.locator("#fixed-list").innerText()).includes("泰康"), false);
  const parentsInsurance = page.locator(".fixed-item").filter({hasText:"父母医保"});
  assert.equal(await parentsInsurance.count(), 1);
  assert.equal(await parentsInsurance.locator(".fixed-amount").innerText(), "¥150");
  assert.match(await page.locator("#fixed-list").innerText(), /1,250/);
  assert.equal(await page.locator(".fixed-item").count(), 9);
  assert.match(await page.locator("#fixed-list").innerText(), /3,428.17/);
  assert.match(await page.locator("#fixed-list").innerText(), /1,698/);
  async function verifyPerson(view, expectedCents) {
    await page.locator(`[data-view=${view}]`).click();
    assert.equal(await page.locator("#view-person-summary").isVisible(), true);
    assert.equal(await page.locator(`[data-view=${view}]`).getAttribute("aria-current"), "page");
    const centsFromText = value => Math.round(Number(value.replace(/[¥,]/g, "")) * 100);
    assert.equal(centsFromText(await page.locator("#person-summary-total").innerText()), expectedCents);
    for (const selector of ["#person-summary-channels .category-amount", "#person-summary-categories .category-amount", "#person-summary-body .amount-cell"]) {
      const amounts = await page.locator(selector).allTextContents();
      assert.equal(amounts.reduce((sum, value) => sum + centsFromText(value), 0), expectedCents, selector);
    }
  }
  async function verifyCategory(category, expectedCents) {
    const fullTotal = await page.locator("#person-summary-total").innerText();
    await page.locator(".person-detail-panel .table-wrap").evaluate(element => { element.scrollTop = element.scrollHeight; });
    await page.selectOption("#person-category-filter", category);
    const visibleCategories = await page.locator("#person-summary-body tr td:nth-child(4)").allTextContents();
    assert.ok(visibleCategories.length > 0);
    assert.ok(visibleCategories.every(value => value === category));
    const amounts = await page.locator("#person-summary-body .amount-cell").allTextContents();
    assert.equal(amounts.reduce((sum, value) => sum + Math.round(Number(value.replace(/[¥,]/g, ""))*100), 0), expectedCents);
    assert.equal(await page.locator("#person-summary-total").innerText(), fullTotal);
    assert.match(await page.locator("#person-summary-count").innerText(), /小计/);
    assert.equal(await page.locator(".person-detail-panel .table-wrap").evaluate(element => element.scrollTop), 0);
  }
  await verifyPerson("person-one", 504494);
  assert.equal(await page.locator("#person-summary-body tr").count(), 9);
  assert.match(await page.locator("#person-summary-body").innerText(), /洪情宜/);
  assert.equal((await page.locator("#person-summary-body").innerText()).includes("侯兴帆"), false);
  await verifyCategory("教育", 55000);
  assert.equal(await page.locator("#person-summary-body tr").count(), 1);
  await page.selectOption("#person-category-filter", "all");
  assert.equal(await page.locator("#person-summary-body tr").count(), 9);
  await page.screenshot({path:".preview/person-one-desktop.png",fullPage:true});
  await verifyPerson("person-two", 416384);
  assert.match(await page.locator("#person-summary-body").innerText(), /仅计净额0.81元/);
  assert.equal((await page.locator("#person-summary-body").innerText()).includes("泰康在线"), false);
  assert.equal((await page.locator("#person-summary-body").innerText()).includes("亲属卡"), false);
  await page.screenshot({path:".preview/person-two-desktop.png",fullPage:true});
  await verifyCategory("餐饮", 152649);
  await page.screenshot({path:".preview/person-two-category-desktop.png",fullPage:true});
  await page.selectOption("#month-select", "2026-09");
  assert.equal(await page.locator("#person-category-filter").inputValue(), "all");
  await verifyPerson("person-two", 321200);
  assert.match(await page.locator("#person-summary-note").innerText(), /估算/);
  await verifyPerson("person-one", 513751);
  assert.equal(await page.locator("#person-summary-body tr").count(), 29);
  assert.match(await page.locator("#person-summary-body").innerText(), /净额99.92元/);
  assert.match(await page.locator("#person-summary-body").innerText(), /Switch/);
  assert.equal((await page.locator("#person-summary-body").innerText()).includes("郑元"), false);
  await verifyCategory("服饰", 19797);
  assert.equal(await page.locator("#person-summary-body tr").count(), 2);
  await verifyCategory("文娱", 174800);
  await page.selectOption("#month-select", "2026-10");
  assert.equal(await page.locator("#person-category-filter").inputValue(), "all");
  assert.equal(await page.locator("#person-category-filter option[value='文娱']").count(), 0);
  assert.equal(await page.locator("#person-summary-total").innerText(), "¥5,044.94");
  await page.locator("[data-view=details]").click();
  await page.selectOption("#month-select", "2026-09");
  assert.match(await page.locator("#fixed-total").innerText(), /13,932/);
  assert.match(await page.locator("#fixed-list").innerText(), /3,392/);
  assert.match(await page.locator("#fixed-list").innerText(), /1,650/);
  assert.equal(await page.locator("#expense-table-body tr").count(), 43);
  assert.match(await page.locator("#table-summary").innerText(), /22,281.51/);
  await page.locator("[data-filter=daily]").click();
  assert.match(await page.locator("#table-summary").innerText(), /8,349.51/);
  await page.locator("[data-view=overview]").click();
  assert.equal(await page.locator("#view-overview").isVisible(), true);
  assert.equal(await page.locator("#view-october").isVisible(), false);
  assert.match(await page.locator(".person-comparison").innerText(), /1号/);
  assert.match(await page.locator(".person-comparison").innerText(), /2号/);
  assert.equal(await page.locator("#september-total").innerText(), "¥22,281.51");
  assert.equal(await page.locator("#september-one-total").innerText(), "¥5,137.51");
  assert.equal(await page.locator("#september-daily").innerText(), "¥8,349.51");
  const septemberCategories = await page.locator("#category-bars .category-amount").allTextContents();
  assert.equal(septemberCategories.reduce((sum, value) => sum + Math.round(Number(value.replace(/[¥,]/g, ""))*100), 0), 2228151);
  const septemberPayments = await page.locator("#payment-list .payment-value").allTextContents();
  assert.equal(septemberPayments.reduce((sum, value) => sum + Math.round(Number(value.replace(/[¥,]/g, ""))*100), 0), 834951);
  assert.equal(await page.locator("#september-one-alipay-body tr").count(), 72);
  await page.screenshot({path:".preview/september-desktop.png",fullPage:true});
  await page.selectOption("#month-select", "2026-10");
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:".preview/october-mobile.png",fullPage:true});
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  for (const [view, cents] of [["person-one", 504494], ["person-two", 416384]]) {
    await verifyPerson(view, cents);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  }
  await page.screenshot({path:".preview/person-two-mobile.png",fullPage:true});
  await verifyCategory("餐饮", 152649);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({path:".preview/person-two-category-mobile.png",fullPage:true});
  await page.locator("[data-view=fixed]").click();
  assert.equal(await page.locator(".fixed-item").count(),9);
  assert.match(await page.locator("#fixed-caption").innerText(), /10月社保和小班费已替换/);
  assert.match(await page.locator("#fixed-total").innerText(), /14,016.17/);
  await page.setViewportSize({width:320,height:800});
  await page.selectOption("#month-select", "2026-09");
  await page.locator("[data-view=overview]").click();
  await page.locator("#view-overview details summary").click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.locator("#view-overview details summary").click();
  await verifyPerson("person-one", 513751);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.screenshot({path:".preview/september-one-mobile.png",fullPage:true});
  await page.selectOption("#month-select", "2026-10");
  for (const [view, cents] of [["person-one", 504494], ["person-two", 416384]]) {
    await verifyPerson(view, cents);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  }
  await verifyCategory("医疗", 78472);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  await page.locator("[data-view=overview]").click();
  await page.locator("#view-october details summary").click();
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true);
  assert.equal(errors.length,0,errors.join("\n"));
  console.log("PASS: 85 WeChat source rows, family-card exclusions, full/partial refund accounting, fixed phone deduplication, 78 Mastercard charges/2 refunds, 26 Alipay rows, October totals/categories, 21 bank balances, MD figures, September/month navigation, 390px/320px layout, no runtime errors.");
} finally {
  await browser.close();
}
