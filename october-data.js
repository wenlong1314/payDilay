// 金额使用分。按实际付款月统计，保留原始流水并单独计算去重后的支出。
const octoberLedger = {
  month: "2026-10", owner: "1号", wechatCents: 8800,
  fixedBaselineCents: 1393200,
  // 社保按已确认的支出与到账组合计净额，原始流水仍保留毛额。
  get socialSecurityCents() {
    return -this.transactions.filter(row => row.fixedKey === "1号社保").reduce((sum, row) => sum + row.cents, 0);
  },
  schoolCents: 169800,
  openingBalanceCents: 1833792, closingBalanceCents: 4876665,
  transactions: [
    { date: "2026-10-03", cents: -400, balanceCents: 1833392, method: "银联快捷支付", party: "秦子茗", status: "日常支出", category: "其他", note: "与微信88元不重复；用途未细分" },
    { date: "2026-10-03", cents: -4410, balanceCents: 1828982, method: "快捷支付", party: "荟集里店", status: "日常支出", category: "其他", note: "与微信88元不重复；用途未细分" },
    { date: "2026-10-03", cents: -50000, balanceCents: 1778982, method: "银联快捷支付", party: "微信转账", status: "往返抵销", note: "已确认与10月4日500元转入成对，不计支出" },
    { date: "2026-10-03", cents: -500, balanceCents: 1778482, method: "快捷支付", party: "袁小能", status: "日常支出", category: "其他", note: "与微信88元不重复；用途未细分" },
    { date: "2026-10-04", cents: 50000, balanceCents: 1828482, method: "银联快捷支付", party: "微信转账", status: "往返抵销", note: "已确认与10月3日500元转出成对，不另计收入或支出" },
    { date: "2026-10-06", cents: -377551, balanceCents: 1450931, method: "快捷支付", party: "深圳市中融小额贷款有限公司", status: "日常支出", category: "其他", note: "已更正为抖音还款，按10月付款计入一次；与支付宝花呗还款分属不同平台，不能用于抵销支付宝消费；抖音对应消费尚未提供" },
    { date: "2026-10-08", cents: -50000, balanceCents: 1400931, method: "黄金定投", party: "MX零售活期账户金成本", status: "投资", note: "单列投资，不计入家庭消费" },
    { date: "2026-10-08", cents: -4213, balanceCents: 1396718, method: "银联无卡自助消费", party: "（特约）美团", status: "日常支出", category: "其他", note: "与微信88元不重复；用途未细分" },
    { date: "2026-10-10", cents: 200000, balanceCents: 1596718, method: "代发住房公积金", party: "北京住房公积金管理中心", status: "转入", note: "公积金到账，单列流入，不冲减消费" },
    { date: "2026-10-10", cents: -18000, balanceCents: 1578718, method: "转账汇款", party: "北京市昌平区爱蕾幼儿园", status: "计入固定", category: "教育", note: "与1518元共1698元，替换10月小班费1650元；日常不再计入" },
    { date: "2026-10-12", cents: -882456, balanceCents: 696262, method: "转账汇款", party: "侯兴帆", status: "计入固定", category: "保险", fixedKey: "1号社保", note: "与10月20日到账5396.39元配对，固定社保净额3428.17元，替换10月原3392元；本笔毛额不再计入非固定支出" },
    { date: "2026-10-12", cents: 2307400, balanceCents: 3003662, method: "银联代付", party: "高惠莹", status: "转入", note: "对应支付宝同日余额宝转余额后提现23074元，为内部资金转移；不作为新增收入或冲减支出" },
    { date: "2026-10-15", cents: -89616, balanceCents: 2914046, method: "黄金定投", party: "MX零售活期账户金成本", status: "投资", note: "单列投资，不计入家庭消费" },
    { date: "2026-10-15", cents: -10000, balanceCents: 2904046, method: "银联线上有卡支付", party: "北京市政交通一卡通有限公司", status: "日常支出", category: "交通", note: "交通账户支付，与微信88元不重复" },
    { date: "2026-10-20", cents: 539639, balanceCents: 3443685, method: "代发工资", party: "北京梦境拾光科技有限公司", status: "社保抵减", category: "保险", fixedKey: "1号社保", note: "原交易方式为代发工资；已确认与侯兴帆8824.56元社保支出组合，仅抵减固定社保5396.39元，不再抵减非固定支出" },
    { date: "2026-10-20", cents: -151800, balanceCents: 3291885, method: "转账汇款", party: "北京市昌平区爱蕾幼儿园", status: "计入固定", category: "教育", note: "与180元共1698元，替换10月小班费1650元；日常不再计入" },
    { date: "2026-10-21", cents: 1500000, balanceCents: 4791885, method: "行内转账转入", party: "杨文龙", status: "转入", note: "个人转入，不作为支出或消费抵减" },
    { date: "2026-10-23", cents: -43620, balanceCents: 4748265, method: "掌上生活还款", party: "高惠莹", status: "日常支出", category: "其他", note: "信用卡还款，按10月付款计入一次，未再添加对应消费明细" },
    { date: "2026-10-27", cents: 131400, balanceCents: 4879665, method: "汇入汇款", party: "杨文龙", status: "转入", note: "转入，不作为支出" },
    { date: "2026-10-27", cents: 52000, balanceCents: 4931665, method: "汇入汇款", party: "杨文龙", status: "转入", note: "转入，不作为支出" },
    { date: "2026-10-31", cents: -55000, balanceCents: 4876665, method: "银联快捷支付", party: "洪情宜", status: "日常支出", category: "教育", note: "不固定教育支出，独立于幼儿园固定费" }
  ]
};

function summarizeOctober() {
  const sumStatus = status => octoberLedger.transactions.filter(row => row.cents < 0 && row.status === status).reduce((sum, row) => sum - row.cents, 0);
  const { twoRecordedCents } = summarizeOctoberTwo();
  const fixedCents = octoberLedger.fixedBaselineCents - 339200 - 165000 + octoberLedger.socialSecurityCents + octoberLedger.schoolCents;
  const dailyCents = sumStatus("日常支出") + octoberLedger.wechatCents;
  return {
    fixedCents, dailyCents, twoRecordedCents,
    recordedTotalCents: fixedCents + dailyCents + twoRecordedCents,
    matchedFixedCents: sumStatus("计入固定"), investmentCents: sumStatus("投资"),
    offsetCents: sumStatus("往返抵销"),
    outCents: octoberLedger.transactions.filter(row => row.cents < 0).reduce((sum, row) => sum - row.cents, 0),
    inCents: octoberLedger.transactions.filter(row => row.cents > 0).reduce((sum, row) => sum + row.cents, 0)
  };
}
