// 2号以最新支付宝及微信逐笔记录为准，美团旧汇总由两笔还款明细替代。
const octoberTwoLedger = {
  month: "2026-10", owner: "2号", extraMeituanCents: 0,
  replacedMeituanSummaryCents: 25800,
  alipayTransactions: octoberTwoAlipayTransactions,
  wechatTransactions: octoberTwoWechatTransactions
};

function octoberTwoReviewNote(row) { return row.note; }
