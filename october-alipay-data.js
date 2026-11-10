// 2号最新支付宝原始明细；金额为分，零元医保及不计收支还款保留。
const octoberTwoAlipayTransactions = [
  ["2026/10/31 22:05", "充值缴费", "北京燃气集团", "/", "燃气费", "支出", 20000, "花呗", "交易成功", "2026103100003001410004258257", "95197101752", "居住"],
  ["2026/10/31 20:28", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 1278, "Mastercard(7899)", "交易成功", "2026103123001448411419960605", "0003N202610310000000018197498769", "交通"],
  ["2026/10/31 16:41", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 1343, "Mastercard(7899)", "交易成功", "2026103123001448411417419974", "0003N202610310000000018120327290", "交通"],
  ["2026/10/30 18:32", "餐饮美食", "淘宝闪购", "e50***@alibaba-inc.com", "老乡鸡(北京三旗百汇店)外卖订单", "支出", 1000, "花呗", "交易成功", "2026103023001148411413161937", "13180600726103032208514598116", "餐饮"],
  ["2026/10/29 11:37", "医疗健康", "北京市昌平区龙泽园社区卫生服务中心", "/", "医保支付(不含自费)", "支出", 0, "", "支付成功", "20261029484133801844", "211620460C261029000341", "医疗"],
  ["2026/10/29 11:31", "生活服务", "丰巢网络技术有限公司", "fch***@fcbox.com", "1个月基础会员", "支出", 500, "Mastercard(7899)", "交易成功", "2026102923001448411455612765", "20261029113149741016100000904189", "其他"],
  ["2026/10/29 10:15", "医疗健康", "北京市昌平区龙泽园社区卫生服务中心", "/", "医保支付(不含自费)", "支出", 0, "", "支付成功", "20261029484133797602", "211620460C261029000233", "医疗"],
  ["2026/10/27 9:47", "医疗健康", "北京市昌平区龙泽园社区卫生服务中心", "/", "医保支付(不含自费)", "支出", 0, "", "支付成功", "20261027484132242701", "211620460C261027000165", "医疗"],
  ["2026/10/24 20:11", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 2112, "Mastercard(7899)", "交易成功", "2026102423001448411429564476", "0003N202610240000000018054126134", "交通"],
  ["2026/10/24 14:01", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 2800, "Mastercard(7899)", "交易成功", "2026102423001448411424682585", "0003N202610240000000018020727962", "交通"],
  ["2026/10/22 15:38", "餐饮美食", "美团", "zxp***@meituan.com", "天空之镜眼镜店蔡司授权折扣店（霍营店）-美团App-26102211200700001302169777302581", "支出", 57600, "花呗", "交易成功", "2026102223001448411418600633", "20261022153850U32074937631987436", "医疗"],
  ["2026/10/22 11:16", "其他", "Anysphere， Inc.", "dir***@antfinus.onmicrosoft.com", "CURSOR， AI POWERED IDE", "支出", 13422, "花呗", "交易成功", "2026102222001448411418552467", "2026102219074101000880076306402", "其他"],
  ["2026/10/20 8:05", "信用借还", "花呗|信用购", "/", "自动还款-花呗|信用购2026年10月账单", "不计收支", 13463, "郑州银行储蓄卡(3513)", "还款成功", "2026102029020999410175516597", "", "其他"],
  ["2026/10/18 12:56", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 4656, "Mastercard(7899)", "交易成功", "2026101823001448411436926222", "0003N202610180000000018003115012", "交通"],
  ["2026/10/18 8:04", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 4143, "Mastercard(7899)", "交易成功", "2026101823001448411436927002", "0003N202610180000000017958822402", "交通"],
  ["2026/10/14 10:44", "保险", "中国人民健康保险股份有限公司", "/", "2026.10月保费缴清-好医保·长期医疗-**龙", "支出", 2542, "北京银行信用购", "交易成功", "20261014102553010448410064745534", "202610141100300700170207515021", "保险"],
  ["2026/10/12 18:27", "餐饮美食", "my**店", "myp***@thehutgroup.com", "Myprotein 2.2磅增肌配方粉熊猫增肌蛋白粉碳水瘦子增肌健身补剂", "支出", 13730, "北京银行信用购", "交易成功", "2026101223001148411458910066", "T2700P3316488099096003998", "餐饮"],
  ["2026/10/12 18:24", "日用百货", "xi**7", "159******12", "肌肉公爵蛋白粉摇摇杯奶昔杯健身杯子运动水杯大容量摇杯", "支出", 650, "Mastercard(7899)", "交易成功", "2026101223001148411458282296", "T200P3316505126091068371", "其他"],
  ["2026/10/11 20:34", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 2334, "Mastercard(7899)", "交易成功", "2026101123001448411441106834", "0003N202610110000000017912387793", "交通"],
  ["2026/10/10 18:27", "餐饮美食", "ni**7", "153******81", "麦当劳代下单优惠券麦辣板烧鸡腿堡巨无霸随心配薯条可乐辣翅鸡排", "支出", 2992, "北京银行信用购", "交易成功", "2026101023001148411437463592", "T200P3316937449001013180", "餐饮"],
  ["2026/10/7 13:36", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 5948, "Mastercard(7899)", "交易成功", "2026100723001448411405892383", "0003N202610070000000017787703130", "交通"],
  ["2026/10/7 6:51", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 2100, "Mastercard(7899)", "交易成功", "2026100723001448411407899784", "0003N202610070000000017857977943", "交通"],
  ["2026/10/3 17:05", "交通出行", "哈啰出行", "zij***@hellobike.com", "哈啰助力车骑行", "支出", 250, "Mastercard(7899)", "交易成功", "2026100323001448411447785640", "CPR261003170523492306912345H", "交通"],
  ["2026/10/1 14:50", "交通出行", "高德打车", "aut***@autonavi.com", "高德打车订单", "支出", 1034, "Mastercard(7899)", "交易成功", "2026100123001448411430533658", "0003N202610010000000017767881762", "交通"],
  ["2026/10/1 12:08", "充值缴费", "国网北京市电力公司", "z50***@alipay.com", "电费自动缴费-龙锦苑一区-根据每期出账后自动缴费", "支出", 10000, "Mastercard(7899)", "交易成功", "2026100123001448411435309209", "1102119031800", "居住"],
  ["2026/10/1 9:32", "信用借还", "美团金融", "it_***@meituan.com", "美团订单-【美团月付】主动还款2026年10月账单", "支出", 8017, "郑州银行储蓄卡(3513)", "交易成功", "2026100123001448411433395595", "20261001093204U07684476765777675", "其他"]
].map(([date, sourceCategory, party, account, description, direction, cents, payment, status, transactionId, merchantId, category]) => ({
  date, sourceCategory, party, account, description, direction, cents, payment, status, transactionId, merchantId, category,
  treatment: direction === "不计收支" ? "不计收支" : party === "国网北京市电力公司" ? "计入固定" : "非固定支出",
  note: direction === "不计收支" ? "按原账单不计收支，保留还款记录，不加到支出"
    : party === "国网北京市电力公司" ? "已纳入固定电费，非固定项剔除100元；固定电费暂保留原标准200元，待确认是否替换"
    : party === "美团金融" ? "原账单标记支出，按付款计一次；后续补充对应消费时须去重，不代表原消费发生于10月"
    : party === "美团" ? "商品为眼镜，家庭分类调整为医疗，原账单餐饮分类保留"
    : cents === 0 ? "医保支付不含自费，实付0元，保留记录" : "按本次明细计入，替换旧汇总，不再额外叠加该卡金额"
}));

function summarizeOctoberTwo() {
  const sum = rows => rows.reduce((total, row) => total + row.cents, 0);
  const expenses = octoberTwoAlipayTransactions.filter(row => row.direction === "支出");
  const daily = expenses.filter(row => row.treatment === "非固定支出");
  const cardRows = expenses.filter(row => row.payment === "Mastercard(7899)");
  const wechat = octoberTwoLedger.wechatTransactions;
  const wechatOut = wechat.filter(row => row.direction === "支出");
  const wechatFamily = wechatOut.filter(row => row.payment.includes("亲属卡"));
  const wechatFullRefund = wechatOut.filter(row => !row.payment.includes("亲属卡") && row.status === "已全额退款");
  const wechatCardRows = wechatOut.filter(row => row.payment.toUpperCase() === "MASTERCARD(7899)");
  const wechatCardRefunds = wechat.filter(row => row.direction === "收入" && row.payment.toUpperCase() === "MASTERCARD(7899)");
  const wechatDailyCents = wechat.reduce((total, row) => total + row.budgetCents, 0);
  const wechatCardOutCents = sum(wechatCardRows);
  const wechatCardRefundCents = sum(wechatCardRefunds);
  return {
    alipayOutCents: sum(expenses), alipayDailyCents: sum(daily),
    alipayFixedCents: sum(expenses.filter(row => row.treatment === "计入固定")),
    nonBudgetRepaymentCents: sum(octoberTwoAlipayTransactions.filter(row => row.direction === "不计收支")),
    wechatOutCents: sum(wechatOut), wechatFamilyOutCents: sum(wechatFamily),
    wechatNonFamilyFullRefundCents: sum(wechatFullRefund),
    wechatPartialRefundCents: wechat.reduce((total, row) => total + row.refundCents, 0),
    wechatNetCents: wechat.reduce((total, row) => total + row.netCents, 0),
    wechatFixedCents: wechat.filter(row => row.fixedKey !== null).reduce((total, row) => total + row.netCents, 0),
    wechatDailyCents,
    duplicateFixedInsuranceCents: wechat.filter(row => row.treatment === "剔除重复医保").reduce((total, row) => total + row.netCents, 0),
    twoRecordedCents: sum(daily) + wechatDailyCents + octoberTwoLedger.extraMeituanCents,
    mastercard: {
      alipayOutCents: sum(cardRows), wechatOutCents: wechatCardOutCents,
      outCents: sum(cardRows) + wechatCardOutCents, count: cardRows.length + wechatCardRows.length,
      refundCents: wechatCardRefundCents, netCents: sum(cardRows) + wechatCardOutCents - wechatCardRefundCents,
      scope: "本次2号支付宝和微信明细，未核对独立卡账单"
    }
  };
}
