const fixedExpenses = [
  { item: "房租", category: "居住", owner: "全家", amount: 4600, icon: "house" },
  { item: "房贷", category: "居住", owner: "全家", amount: 2450, icon: "landmark" },
  { item: "父母买菜钱", category: "餐饮", owner: "父母", amount: 1250, icon: "shopping-basket" },
  { item: "孩子小班", category: "教育", owner: "孩子", amount: 1650, icon: "school" },
  { item: "1号社保", category: "保险", owner: "1号", amount: 3392, icon: "shield-plus" },
  { item: "水费", category: "居住", owner: "全家", amount: 80, icon: "droplets" },
  { item: "电费", category: "居住", owner: "全家", amount: 200, icon: "zap" },
  { item: "手机话费", category: "通讯", owner: "全家", amount: 160, icon: "smartphone" },
  { item: "父母医保", category: "保险", owner: "父母", amount: 150, icon: "heart-pulse" }
];

const dailyExpenses = [
  { item: "1号微信支出汇总", category: "其他", owner: "1号", payment: "微信", amount: 1212, note: "未提供明细分类" },
  ...septemberOneAlipayTransactions.filter(row => row.budgetCents > 0).map(row => ({
    item: row.party, category: row.category, owner: "1号", payment: "支付宝", amount: row.budgetCents / 100,
    date: row.date, sourcePayment: row.payment, transactionId: row.transactionId,
    note: `${row.description}；付款方式：${row.payment}；${row.note}`
  })),
  { item: "1号银行卡支出汇总", category: "其他", owner: "1号", payment: "银行卡", amount: 619, note: "100 + 100 + 99 + 320" },
  { item: "2号微信未分类支出", category: "其他", owner: "2号", payment: "微信", amount: 1763, note: "微信3263扣除生活费1000及随份子500" },
  { item: "随份子", category: "人情往来", owner: "2号", payment: "微信", amount: 500, note: "微信总额3263中的500" },
  { item: "2号支付宝支出", category: "其他", owner: "2号", payment: "支付宝", amount: 683, note: "未提供明细分类" },
  { item: "2号美团支出", category: "其他", owner: "2号", payment: "美团", amount: 200, note: "约200；无账单" },
  { item: "2号抖音支出", category: "其他", owner: "2号", payment: "抖音", amount: 66, note: "后续尽量用微信支付" }
];

function groupSeptemberExpenses(rows, key) {
  const groups = new Map();
  rows.forEach(row => groups.set(row[key], (groups.get(row[key]) || 0) + Math.round(row.amount * 100)));
  return [...groups].map(([name, cents]) => ({name, amount: cents / 100})).sort((a, b) => b.amount - a.amount);
}
const categoryColors = {"居住":"#276749", "其他":"#73538f", "保险":"#356b8f", "教育":"#b85f25", "餐饮":"#c28a1c", "人情往来":"#a84545", "通讯":"#5f7b6b", "文娱":"#986247", "日用百货":"#6e8292", "服饰":"#9a6684", "医疗":"#427f7c", "交通":"#748843", "宠物":"#8c8051"};
const categoryData = groupSeptemberExpenses([...fixedExpenses, ...dailyExpenses], "category").map(row => ({...row, color: categoryColors[row.name] || "#667169"}));
const paymentData = groupSeptemberExpenses(dailyExpenses, "payment");

const formatMoney = value => `¥${value.toLocaleString("zh-CN", { minimumFractionDigits: Number.isInteger(value) ? 0 : 2, maximumFractionDigits: 2 })}`;
const escapeText = value => String(value).replace(/[&<>"']/g, char => ({"&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;"}[char]));

function renderSeptemberOverview() {
  const sumCents = rows => rows.reduce((sum, row) => sum + Math.round(row.amount * 100), 0);
  const fixed = sumCents(fixedExpenses);
  const daily = sumCents(dailyExpenses);
  const one = sumCents(dailyExpenses.filter(row => row.owner === "1号"));
  const two = sumCents(dailyExpenses.filter(row => row.owner === "2号"));
  const total = fixed + daily;
  document.getElementById("september-total").textContent = formatMoney(total / 100);
  document.getElementById("september-fixed-share").textContent = `${(fixed / total * 100).toFixed(1)}%`;
  document.getElementById("september-daily").textContent = formatMoney(daily / 100);
  document.getElementById("september-daily-note").textContent = `1号 ${formatMoney(one / 100)} · 2号 ${formatMoney(two / 100)}`;
  document.getElementById("september-category-total").textContent = formatMoney(total / 100);
  document.getElementById("september-donut-total").textContent = `${(total / 1000000).toFixed(2)} 万`;
  document.getElementById("donut-desc").textContent = categoryData.map(row => `${row.name}${formatMoney(row.amount)}`).join("，");
  document.getElementById("september-one-total").textContent = formatMoney(one / 100);
  document.getElementById("september-two-total").textContent = formatMoney(two / 100);
  document.querySelector(".wife-bar").style.width = `${one / daily * 100}%`;
  document.querySelector(".husband-bar").style.width = `${two / daily * 100}%`;
  document.getElementById("september-one-alipay-body").innerHTML = septemberOneAlipayTransactions.map(row => `
    <tr><td>${escapeText(row.date)}</td><td>${escapeText(row.party)}<br>${escapeText(row.description)}<br>交易号：${escapeText(row.transactionId)}</td>
    <td>${escapeText(row.payment || "未列")}<br>${escapeText(row.sourceCategory)}</td><td>${escapeText(row.direction)} ${formatMoney(row.cents / 100)}</td>
    <td>${escapeText(row.status)}<br>${escapeText(row.treatment)}</td><td class="amount-cell">${formatMoney(row.budgetCents / 100)}</td><td>${escapeText(row.note)}</td></tr>
  `).join("");
}

function renderDonut() {
  const group = document.getElementById("donut-segments");
  const bars = document.getElementById("category-bars");
  const total = categoryData.reduce((sum, item) => sum + item.amount, 0);
  const radius = 78;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  group.innerHTML = categoryData.map((item, index) => {
    const length = (item.amount / total) * circumference;
    const svg = `<circle class="donut-segment" cx="110" cy="110" r="${radius}" stroke="${item.color}" stroke-dasharray="${length} ${circumference - length}" stroke-dashoffset="${-offset}" tabindex="0"><title>${item.name}：${formatMoney(item.amount)}，${(item.amount / total * 100).toFixed(1)}%</title></circle>`;
    offset += length;
    return svg;
  }).join("");

  const max = Math.max(...categoryData.map(item => item.amount));
  bars.innerHTML = categoryData.map(item => `
    <div class="category-row">
      <span class="category-name"><i class="legend-swatch" style="background:${item.color}"></i>${item.name}</span>
      <span class="category-track" aria-hidden="true"><i class="category-fill" style="width:${item.amount / max * 100}%;background:${item.color}"></i></span>
      <span class="category-amount">${formatMoney(item.amount)}</span>
    </div>
  `).join("");
}

function renderPayments() {
  const max = Math.max(...paymentData.map(item => item.amount));
  document.getElementById("payment-list").innerHTML = paymentData.map(item => `
    <div class="payment-row">
      <span>${item.name}</span>
      <span class="payment-track" aria-hidden="true"><i class="payment-fill" style="width:${item.amount / max * 100}%"></i></span>
      <span class="payment-value">${formatMoney(item.amount)}</span>
    </div>
  `).join("");
}

function selectedFixedExpenses(month = document.getElementById("month-select").value) {
  if (month !== "2026-10") return fixedExpenses;
  return fixedExpenses.map(item => ({...item, amount: item.item === "1号社保"
    ? octoberLedger.socialSecurityCents / 100
    : item.item === "孩子小班" ? octoberLedger.schoolCents / 100 : item.amount }));
}

function renderFixedList() {
  const rows = selectedFixedExpenses();
  document.getElementById("fixed-total").textContent = `${formatMoney(rows.reduce((sum, row) => sum + row.amount, 0))} / 月`;
  document.getElementById("fixed-list").innerHTML = rows.map(item => `
    <article class="fixed-item">
      <span class="fixed-icon" aria-hidden="true"><i data-lucide="${item.icon}"></i></span>
      <div><strong>${item.item}</strong><span>${item.category} · ${item.owner}</span></div>
      <span class="fixed-amount">${formatMoney(item.amount)}</span>
    </article>
  `).join("");
}

function getExpenseRows(filter) {
  const fixedRows = fixedExpenses.map(item => ({ ...item, type: "fixed", payment: "固定支出", note: "每月自动计入" }));
  const dailyRows = dailyExpenses.map(item => ({ ...item, type: "daily" }));
  if (filter === "fixed") return fixedRows;
  if (filter === "daily") return dailyRows;
  return [...fixedRows, ...dailyRows];
}

function renderTable(filter = "all") {
  const october = document.getElementById("month-select").value === "2026-10";
  document.querySelector("#view-details .eyebrow").textContent = october ? "2026 年 10 月 · 微信已补齐，亲属卡及退款已剔除" : "2026 年 9 月";
  document.querySelector(".filter-group").hidden = october;
  document.getElementById("details-title").textContent = october ? "1号、2号流水与渠道汇总" : "全部支出明细";
  document.querySelector(".expense-table thead").innerHTML = october
    ? '<tr><th>日期/项目</th><th>处理状态</th><th>归属</th><th>交易方式</th><th class="amount-cell">流水金额</th><th>核对说明</th></tr>'
    : '<tr><th>项目</th><th>类别</th><th>归属</th><th>支付方式</th><th class="amount-cell">金额</th><th>备注</th></tr>';
  if (october) {
    document.getElementById("expense-table-body").innerHTML = octoberLedger.transactions.map(item => `
      <tr><td>${item.date}<br>${item.party}</td><td>${item.status}</td><td>1号</td><td>${item.method}</td>
      <td class="amount-cell">${item.cents > 0 ? "+" : "−"}${formatMoney(Math.abs(item.cents) / 100)}</td><td>${item.note}</td></tr>
    `).join("") + '<tr><td>10月微信汇总</td><td>日常支出</td><td>1号</td><td>微信</td><td class="amount-cell">−¥88</td><td>未提供具体日期；已确认与银行卡不重复，另计一次</td></tr>'
      + octoberTwoLedger.alipayTransactions.map(row => `
        <tr><td>${row.date}<br>${row.party}</td><td>${row.treatment} · ${row.category}</td><td>2号</td><td>支付宝 · ${row.payment || "未列付款方式"}</td>
        <td class="amount-cell">${formatMoney(row.cents / 100)}${row.direction === "不计收支" ? "（不计）" : ""}</td><td>${row.description}<br>原分类：${row.sourceCategory}；${row.direction}；${row.status}<br>${row.note}</td></tr>
      `).join("")
      + `<tr><td>10月美团旧汇总</td><td>汇总已替换·不计入</td><td>2号</td><td>美团</td><td class="amount-cell">原${formatMoney(octoberTwoLedger.replacedMeituanSummaryCents / 100)}<br>计入：¥0</td><td>已确认是汇总；由支付宝80.17元、微信178.07元两笔明细共258.24元替代，不再叠加</td></tr>`
      + octoberTwoLedger.wechatTransactions.map(row => `
        <tr><td>${row.date}<br>${row.party}</td><td>${row.treatment} · ${row.category}</td><td>2号</td><td>微信 · ${row.payment}<br>${row.method}</td>
        <td class="amount-cell">${row.direction === "收入" ? "+" : "−"}${formatMoney(row.cents / 100)}<br>计入非固定：${formatMoney(row.budgetCents / 100)}</td><td>${row.description}<br>${row.status}<br>${octoberTwoReviewNote(row)}</td></tr>
      `).join("");
    const report = summarizeOctober();
    const two = summarizeOctoberTwo();
    document.getElementById("table-summary").textContent = `1号非固定${formatMoney(report.dailyCents / 100)}；2号支付宝非固定${formatMoney(two.alipayDailyCents / 100)} + 微信非固定${formatMoney(two.wechatDailyCents / 100)} = ${formatMoney(report.twoRecordedCents / 100)}。微信${octoberTwoLedger.wechatTransactions.length}条原始记录供核对；生活费1000元、话费50元归入已有固定，泰康医保140.60元与父母医保重复已剔除，保留父母医保150元。美团旧汇总258元已去重，仅计明细258.24元。两渠道MASTERCARD(7899)退款后净额${formatMoney(two.mastercard.netCents / 100)}，不再另加。`;
    return;
  }
  const rows = getExpenseRows(filter);
  document.getElementById("expense-table-body").innerHTML = rows.map(item => `
    <tr>
      <td><span class="type-label ${item.type}">${item.item}</span></td>
      <td>${item.category}</td>
      <td>${item.owner}</td>
      <td>${item.payment}</td>
      <td class="amount-cell">${formatMoney(item.amount)}</td>
      <td>${item.note}</td>
    </tr>
  `).join("");
  const total = rows.reduce((sum, item) => sum + item.amount, 0);
  document.getElementById("table-summary").textContent = `共 ${rows.length} 笔，合计 ${formatMoney(total)}`;
}

function getPersonExpenseRows(owner, month) {
  if (month !== "2026-10") {
    return dailyExpenses.filter(row => row.owner === owner).map(row => ({
      date: row.date || "未提供", item: row.item, channel: row.payment, category: row.category,
      cents: Math.round(row.amount * 100), note: row.note
    }));
  }
  if (owner === "1号") {
    return [
      ...octoberLedger.transactions.filter(row => row.status === "日常支出").map(row => ({
        date: row.date, item: row.party, channel: "银行卡", category: row.category, cents: -row.cents, note: row.note
      })),
      { date: "10月汇总", item: "微信支出汇总", channel: "微信", category: "其他", cents: octoberLedger.wechatCents, note: "已确认与银行卡不重复；未提供逐笔分类" }
    ];
  }
  return [
    ...octoberTwoLedger.alipayTransactions.filter(row => row.direction === "支出" && row.treatment === "非固定支出" && row.cents > 0).map(row => ({
      date: row.date, item: row.party, channel: "支付宝", category: row.category, cents: row.cents, note: `${row.description}；${row.note}`
    })),
    ...octoberTwoLedger.wechatTransactions.filter(row => row.budgetCents > 0).map(row => ({
      date: row.date, item: row.party, channel: "微信", category: row.category, cents: row.budgetCents, note: `${row.description}；${row.note}`
    })),
    ...(octoberTwoLedger.extraMeituanCents > 0 ? [{ date: "10月汇总", item: "额外美团支出", channel: "美团", category: "其他", cents: octoberTwoLedger.extraMeituanCents, note: "未包含在其他渠道的额外支出" }] : [])
  ];
}

let personDetailRows = [];

function renderPersonDetails() {
  const category = document.getElementById("person-category-filter").value;
  const rows = category === "all" ? personDetailRows : personDetailRows.filter(row => row.category === category);
  const subtotal = rows.reduce((sum, row) => sum + row.cents, 0);
  document.getElementById("person-summary-count").textContent = category === "all"
    ? `共${rows.length}条记录 · ${formatMoney(subtotal / 100)}`
    : `${category} · 共${rows.length}条记录 · 小计 ${formatMoney(subtotal / 100)}`;
  document.getElementById("person-summary-body").innerHTML = rows.map(row => `
    <tr><td>${escapeText(row.date)}</td><td>${escapeText(row.item)}</td><td>${escapeText(row.channel)}</td><td>${escapeText(row.category)}</td>
    <td class="amount-cell">${formatMoney(row.cents / 100)}</td><td>${escapeText(row.note)}</td></tr>
  `).join("") || '<tr><td colspan="6">暂无此类支出</td></tr>';
  document.querySelector(".person-detail-panel .table-wrap").scrollTop = 0;
}

document.getElementById("person-category-filter").addEventListener("change", renderPersonDetails);

function renderPersonSummary(owner, month) {
  const rows = getPersonExpenseRows(owner, month);
  personDetailRows = rows;
  const categories = [...new Set(rows.map(row => row.category))];
  document.getElementById("person-category-filter").innerHTML = '<option value="all">全部类别</option>'
    + categories.map(category => `<option value="${escapeText(category)}">${escapeText(category)}</option>`).join("");
  const total = rows.reduce((sum, row) => sum + row.cents, 0);
  document.getElementById("person-summary-month").textContent = month === "2026-10" ? "2026 年 10 月" : "2026 年 9 月";
  document.getElementById("person-summary-title").textContent = `${owner}非固定支出总结`;
  document.getElementById("person-summary-total").textContent = formatMoney(total / 100);
  document.getElementById("person-summary-note").textContent = month === "2026-10"
    ? owner === "1号"
      ? "当前仅统计银行卡去重后支出 + 微信汇总，支付宝新明细尚待合并。中融3775.51元已更正为抖音还款，与支付宝花呗分开；抖音及信用卡还款按付款月计入一次，不代表原消费均发生于10月。固定项、黄金定投及往返转账已剔除。"
      : "支付宝与微信按最新明细统计。已剔除亲属卡、全额退款、固定项及重复泰康医保，部分退款按净额计入；美团旧汇总不再叠加。花呗及信用购订单已计入，之后还款不可再次计入。"
    : owner === "1号"
      ? "支付宝已用9月逐笔明细替换原3306元汇总，净支出3306.51元；服装退款200元已扣除，关闭订单、往返转账及花呗还款不计消费。微信1212元与银行卡619元仍按原汇总保留，银行卡实付32.17元暂无匹配原619元四笔金额，待取得完整银行卡明细进一步核对。"
      : "房贷2,450元、给母亲生活费1,000元已归入固定支出，本页不再计入；美团200元为估算，缺少逐笔分类的支出暂列其他。";
  for (const [key, id] of [["channel", "person-summary-channels"], ["category", "person-summary-categories"]]) {
    const grouped = new Map();
    rows.forEach(row => grouped.set(row[key], (grouped.get(row[key]) || 0) + row.cents));
    const sorted = [...grouped].sort((a, b) => b[1] - a[1]);
    const max = sorted[0]?.[1] || 1;
    document.getElementById(id).innerHTML = sorted.map(([label, cents]) => `
      <div class="category-row"><span class="category-name">${escapeText(label)}</span>
      <span class="category-track" aria-hidden="true"><span class="category-fill" style="width:${cents / max * 100}%;background:var(--green)"></span></span>
      <span class="category-amount">${formatMoney(cents / 100)}</span></div>
    `).join("");
  }
  renderPersonDetails();
}

const viewTitles = {
  overview: "支出概览",
  details: "支出明细",
  fixed: "固定支出",
  rules: "记账规则",
  "person-one": "1号非固定支出总结",
  "person-two": "2号非固定支出总结"
};

function showView(target) {
  const october = document.getElementById("month-select").value === "2026-10";
  const monthLabel = october ? "2026 年 10 月" : "2026 年 9 月";
  const personOwner = target === "person-one" ? "1号" : target === "person-two" ? "2号" : null;
  const viewId = personOwner ? "view-person-summary" : october && target === "overview" ? "view-october" : `view-${target}`;
  if (personOwner) renderPersonSummary(personOwner, document.getElementById("month-select").value);
  document.querySelectorAll(".nav-item").forEach(item => {
    const active = item.dataset.view === target;
    item.classList.toggle("is-active", active);
    if (active) item.setAttribute("aria-current", "page");
    else item.removeAttribute("aria-current");
  });
  document.querySelectorAll(".view").forEach(view => {
    const active = view.id === viewId;
    view.classList.toggle("is-visible", active);
    view.hidden = !active;
  });
  document.getElementById("page-title").textContent = october && target === "overview" ? "10月支出汇总" : viewTitles[target];
  document.getElementById("month-caption").textContent = `家庭支出 · ${monthLabel}`;
  document.getElementById("sidebar-month").textContent = monthLabel;
  document.getElementById("fixed-caption").textContent = october ? "10月社保和小班费已替换，重复泰康医保已剔除" : "9月固定支出";
  renderFixedList();
  if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
  const filter = document.querySelector(".filter-button.is-active").dataset.filter;
  renderTable(filter);
}

document.querySelectorAll(".nav-item").forEach(button => {
  button.addEventListener("click", () => {
    showView(button.dataset.view);
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});
document.getElementById("month-select").addEventListener("change", () => {
  showView(document.querySelector(".nav-item.is-active").dataset.view);
});
document.getElementById("october-details-button").addEventListener("click", () => showView("details"));

function renderOctober() {
  const report = summarizeOctober();
  const two = summarizeOctoberTwo();
  document.getElementById("october-total").textContent = formatMoney(report.recordedTotalCents / 100);
  document.getElementById("october-fixed").textContent = formatMoney(report.fixedCents / 100);
  document.getElementById("october-daily").textContent = formatMoney(report.dailyCents / 100);
  document.getElementById("october-two-daily").textContent = formatMoney(report.twoRecordedCents / 100);
  document.getElementById("october-summary-equation").textContent = `支出合计 ${formatMoney(report.recordedTotalCents / 100)} = 固定支出 ${formatMoney(report.fixedCents / 100)} + 1号非固定 ${formatMoney(report.dailyCents / 100)} + 2号非固定 ${formatMoney(report.twoRecordedCents / 100)}。`;
  document.getElementById("october-investment").textContent = formatMoney(report.investmentCents / 100);
  document.getElementById("october-two-alipay").textContent = formatMoney(two.alipayOutCents / 100);
  document.getElementById("october-two-alipay-daily").textContent = formatMoney(two.alipayDailyCents / 100);
  document.getElementById("october-mastercard-total").textContent = formatMoney(two.mastercard.netCents / 100);
  document.getElementById("october-mastercard-body").innerHTML = [
    ...octoberTwoLedger.alipayTransactions.filter(row => row.payment.toUpperCase() === "MASTERCARD(7899)").map(row => ({...row, channel:"支付宝"})),
    ...octoberTwoLedger.wechatTransactions.filter(row => row.payment.toUpperCase() === "MASTERCARD(7899)").map(row => ({...row, channel:"微信"}))
  ].map(row => `
    <tr><td>${row.date}</td><td>${row.channel}</td><td>${row.party}</td><td class="amount-cell">${row.direction === "收入" ? "退款 " : ""}${formatMoney(row.cents / 100)}</td><td>${row.treatment}</td></tr>
  `).join("");
  document.getElementById("october-two-meituan").textContent = formatMoney((8017 + 17807) / 100);
  document.getElementById("october-two-status").textContent = `微信原始支出${formatMoney(two.wechatOutCents / 100)} − 亲属卡${formatMoney(two.wechatFamilyOutCents / 100)} − 非亲属卡全额退款${formatMoney(two.wechatNonFamilyFullRefundCents / 100)} − 部分退款${formatMoney(two.wechatPartialRefundCents / 100)} = 净支出${formatMoney(two.wechatNetCents / 100)}；再按已有固定项去重${formatMoney(two.wechatFixedCents / 100)}（生活费1000元 + 话费50元 + 重复医保140.60元）后，非固定${formatMoney(two.wechatDailyCents / 100)}。泰康医保不再另列固定支出，保留父母医保150元。85条原始记录保留供核对，已剔除的记录不计合计。`;
  document.getElementById("october-balance").textContent = `余额核对：首笔交易前${formatMoney(octoberLedger.openingBalanceCents / 100)} + 流入${formatMoney(report.inCents / 100)} − 流出${formatMoney(report.outCents / 100)} = 10月31日${formatMoney(octoberLedger.closingBalanceCents / 100)}。21笔余额逐笔核对一致。`;
  document.getElementById("october-reconciliation").textContent = `1号非固定支出去重：银行卡流出${formatMoney(report.outCents / 100)} − 投资${formatMoney(report.investmentCents / 100)} − 往返转账${formatMoney(report.offsetCents / 100)} − 固定社保与小班费的原始扣款${formatMoney(report.matchedFixedCents / 100)} + 微信${formatMoney(octoberLedger.wechatCents / 100)} = ${formatMoney(report.dailyCents / 100)}。社保到账5,396.39元仅在固定社保中抵减一次，非固定支出不再抵减。`;
  const categories = {};
  selectedFixedExpenses("2026-10").forEach(row => { categories[row.category] = (categories[row.category] || 0) + Math.round(row.amount * 100); });
  octoberLedger.transactions.filter(row => row.status === "日常支出").forEach(row => { categories[row.category] = (categories[row.category] || 0) - row.cents; });
  categories["其他"] = (categories["其他"] || 0) + octoberLedger.wechatCents + octoberTwoLedger.extraMeituanCents;
  octoberTwoLedger.alipayTransactions.filter(row => row.direction === "支出" && row.treatment === "非固定支出").forEach(row => { categories[row.category] = (categories[row.category] || 0) + row.cents; });
  octoberTwoLedger.wechatTransactions.forEach(row => { categories[row.category] = (categories[row.category] || 0) + row.budgetCents; });
  const sorted = Object.entries(categories).sort((a,b) => b[1] - a[1]);
  document.getElementById("october-category-bars").innerHTML = sorted.map(([name,cents]) => `
    <div class="category-row"><span class="category-name">${name}</span>
    <span class="category-track" aria-hidden="true"><span class="category-fill" style="width:${cents / sorted[0][1] * 100}%;background:var(--green)"></span></span>
    <span class="category-amount">${formatMoney(cents / 100)}</span></div>
  `).join("");
}

document.querySelectorAll(".filter-button").forEach(button => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".filter-button").forEach(item => item.classList.toggle("is-active", item === button));
    renderTable(button.dataset.filter);
  });
});

document.getElementById("print-button").addEventListener("click", () => window.print());

renderDonut();
renderPayments();
renderSeptemberOverview();
renderFixedList();
renderOctober();
showView("overview");
if (window.lucide) window.lucide.createIcons({ attrs: { "stroke-width": 1.8 } });
