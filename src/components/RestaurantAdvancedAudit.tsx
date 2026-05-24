export function RestaurantAdvancedAudit() {
    const copilotQuestions = [
      { question: '今晚 6-8 点应该推哪道菜？', answer: '先看预约、库存、毛利和天气；缺 POS/库存表前只给待确认建议。' },
      { question: '哪些客人值得社群优先跟？', answer: '把券领取、私信、复购标签和差评风险放进同一张跟进清单。' },
      { question: '要不要提高双人套餐曝光？', answer: '需要团购券领取、到店核销和桌均消费回填后再判断。' },
    ];
    const clawBenchmarks = [
      {
        claim: '开箱即用，无需额外训练',
        gap: '当前还需要解释“这从电商改来能干什么”，餐饮老板不能一眼开始。',
        internalFix: '把第一屏改成餐厅活动表单和 6 个餐饮任务包，默认带样例字段、证据要求和下一步。',
        externalNeed: '如果要做到真实门店自动诊断，需要导入历史经营数据、菜单、评价和门店权限。',
      },
      {
        claim: '跨平台数据分析能力',
        gap: '现在只能承接手工链接和截图，还不能像 Claw 那样打通线上线下经营壁垒。',
        internalFix: '先做手工数据槽位、证据账本、负责人和复盘摘要，避免空谈“数据分析”。',
        externalNeed: 'POS、外卖、点评、抖音、小红书、社群、会员系统的 API/OAuth 或合法导出。',
      },
      {
        claim: '餐饮技能内置',
        gap: '已有内容链路，但缺菜品研发、排班、库存、门店服务、选址、采购等经营技能入口。',
        internalFix: '补“餐饮开箱任务包”，把营销以外的门店问题也变成可填、可交付的任务。',
        externalNeed: '要自动执行排班、采购、库存和财务动作，必须接外部系统和管理授权。',
      },
      {
        claim: 'Hermes 架构：分层记忆 + 沙箱隔离 + 自我进化',
        gap: '现在有记忆概念，但还没有按门店、菜品、客群、禁用表达、负责人分层展示学习闭环。',
        internalFix: '把门店记忆拆成可见层级，明确每轮反馈写回哪里，哪些能力只在沙箱内运行。',
        externalNeed: '跨门店长期记忆、权限隔离、企业存储、审计日志需要后端账号体系和数据治理。',
      },
    ];
    const quickTasks = [
      { title: '经营日报', input: '昨日营业额、桌数、客单、差评、缺货', output: '异常点、店长追问、明日动作', boundary: '无 POS 前只支持手工导入' },
      { title: '菜单优化', input: '菜单图、价格、毛利、库存、顾客评价', output: '主推菜、下架风险、禁用表达', boundary: '不自动定价，不判断真实毛利' },
      { title: '本地生活内容', input: '菜品图、到店理由、团购券、平台', output: '点评/小红书/抖音/社群草稿', boundary: '无账号授权不自动发布' },
      { title: '排班与服务复盘', input: '时段客流、投诉、员工备注、等位情况', output: '高压时段、服务提醒、复盘清单', boundary: '无排班系统前不改班表' },
      { title: '社群跟进', input: '券领取、私信、群反馈、生日/复购标签', output: '负责人分配、话术、下次触达', boundary: '未授权不自动联系顾客' },
      { title: '食品安全审核', input: '食材来源、过敏原、功效词、限量说明', output: '红线提示、审核人、待确认字段', boundary: '不替代门店合规签字' },
    ];
    const connectorReadiness = [
      { source: 'POS / 收银 / 损益', today: 'CSV 或截图导入营业额、桌数、菜品销量', external: 'POS API、财务口径、门店账号权限', output: '经营日报、菜品贡献、异常提醒', risk: '未接入前不做实时盈亏和自动归因' },
      { source: '库存 / 采购 / 供应链', today: '手工录入缺货、采购价、损耗备注', external: '库存系统、供应商单据、采购审批', output: '缺货风险、采购提醒、菜单可售边界', risk: '未接入前不自动下采购单' },
      { source: '预订 / 排队 / 电话', today: '粘贴预约表、电话备注、爽约原因', external: '桌台库存、电话助手、小程序/WhatsApp', output: '待确认预约、取消风险、店长回拨清单', risk: '未授权前不自动确认客人' },
      { source: '点评 / 小红书 / 抖音', today: '链接、截图、评论摘录、发布证明', external: '平台 OAuth/API 或合法导出', output: '内容复盘、差评原因、下轮发布任务', risk: '无凭证不说已发布或已分析全量评价' },
      { source: '会员 / 私域 / 社群', today: '券领取、私信、群反馈、复购标签', external: '会员系统、短信/微信触达、权限审计', output: '高意向名单、负责人分配、社群话术', risk: '未授权前不自动触达顾客' },
    ];
    const skillMap = [
      { group: '运营中台', skills: ['经营日报', '排班复盘', '门店服务 SOP', '等位与翻台诊断'], internal: '表单 + 复盘模板', external: 'POS、排班、桌台数据' },
      { group: '增长中台', skills: ['本地生活内容', '团购券跟进', '社群私域', '评价复盘'], internal: '内容草稿 + 证据账本', external: '平台账号、评论和私信数据' },
      { group: '商品中台', skills: ['菜单优化', '主推菜选择', '新品研发', '食品安全红线'], internal: '菜单卡 + 禁用表达审核', external: '销量、毛利、库存、食材凭证' },
      { group: '财务成本', skills: ['毛利核对', '损耗记录', '采购异常', '人效复盘'], internal: '异常清单和店长追问', external: '财务系统、供应链和工资排班' },
      { group: '组织管理', skills: ['负责人分配', '交接班备注', '培训清单', '多店标准化'], internal: '任务流和责任人', external: '账号体系、权限、审计日志' },
    ];
    const evolutionLoop = [
      { layer: '门店记忆', writes: '餐厅定位、常用语气、服务红线、负责人', uses: '下次生成内容和任务时自动带入', gate: '仅当前试用工作区可见' },
      { layer: '菜品记忆', writes: '主推菜、价格边界、食材声明、禁用表达', uses: '菜单优化、内容脚本和食品安全审核', gate: '必须由门店确认后沉淀' },
      { layer: '客群记忆', writes: '高意向来源、复购标签、差评原因、社群反馈', uses: '社群跟进和本地生活经营假设', gate: '未授权不自动触达或导出' },
      { layer: '证据记忆', writes: '发布链接、截图、核销表、评价摘录', uses: '复盘、负责人追踪和下一轮任务', gate: '无来源不做趋势结论' },
    ];
    const finalStateDimensions = [
      {
        dimension: '数据底座',
        finalForm: '门店所有经营数据能被统一提问：POS、库存、采购、排班、会员、评价、外卖和本地生活都进入同一张语义账本。',
        currentGap: '现在只有手工表单、链接和截图槽位，不能自动汇总全量经营数据。',
        internalPath: '先做字段标准、手工导入模板、证据来源、数据缺口提示。',
        externalPath: 'POS/库存/排班/会员/平台 API 或合法导出，企业账号与权限。',
        proof: '每条建议都能追溯到来源字段、截图、链接或导入文件。',
      },
      {
        dimension: '餐饮技能内核',
        finalForm: '像 Claw 一样覆盖选址、菜单、运营、营销、服务、排班、采购、财务、人效和连锁标准化。',
        currentGap: '当前主要围绕本地内容和跟进，经营技能还不够深。',
        internalPath: '把技能拆成经营日报、菜单优化、排班复盘、食品安全、社群跟进等开箱任务。',
        externalPath: '真实毛利、销量、损耗、人效、采购价和多店对标数据。',
        proof: '技能输出不是泛建议，而是任务、负责人、字段缺口和下一步动作。',
      },
      {
        dimension: 'AI 问答与执行',
        finalForm: '店长用自然语言问“今晚推什么、谁要跟、哪里亏”，系统直接给分析、草稿、任务和审批。',
        currentGap: '现在能展示判断路径，但还不是可执行的经营 Copilot。',
        internalPath: '先把高频问题模板化，输出待确认建议、发布草稿和追问清单。',
        externalPath: '实时销售、库存、预订、客资和执行系统写入权限。',
        proof: '每个回答都区分可执行、待确认、缺数据、禁止自动化。',
      },
      {
        dimension: '分层记忆',
        finalForm: '系统持续记住门店、菜品、客群、证据和负责人，越用越像一个熟悉这家店的运营经理。',
        currentGap: '目前是页面展示记忆概念，还没有真实长期存储和跨轮学习。',
        internalPath: '先把写回层级、写回字段和下次使用场景展示清楚。',
        externalPath: '账号体系、数据库、权限隔离、审计日志、跨门店数据治理。',
        proof: '每次复盘明确写回哪一层，谁确认，下一次哪里会复用。',
      },
      {
        dimension: '安全沙箱',
        finalForm: '所有外部账号、顾客数据、财务数据和发布动作都在授权沙箱中运行，可审计、可撤回。',
        currentGap: '当前只能承诺不伪装自动化，还没有真实授权和审计链。',
        internalPath: '先把停止线产品化：无凭证不发布、无授权不触达、无来源不归因。',
        externalPath: 'OAuth、企业权限、日志、加密存储、数据处理协议。',
        proof: '页面上每个高风险动作都有授权状态、责任人和阻断原因。',
      },
      {
        dimension: '门店协同',
        finalForm: '老板、店长、运营、社群、后厨和财务能在同一工作台接任务、补证据、确认结果。',
        currentGap: '当前是单人试用工作台，还没有角色权限和多人交接。',
        internalPath: '先展示角色、负责人、状态和下一步动作。',
        externalPath: '登录、组织、消息通知、审批流和移动端触达。',
        proof: '任务从生成、审核、发布、回收、复盘都有负责人和时间线。',
      },
    ];
    const completionGates = [
      {
        dimension: '数据底座',
        internalClosed: '字段标准、手工导入、证据来源、缺口提示已产品化。',
        externalOpen: 'POS、库存、排班、会员、平台 API 或合法导出。',
        hundredPercentGate: '每条经营建议都能追溯来源，并标记实时/手工/缺失状态。',
        claimGuard: '未接入外部数据前，不宣称全量经营分析。',
      },
      {
        dimension: '餐饮技能内核',
        internalClosed: '经营日报、菜单优化、本地生活、排班复盘、社群跟进、食品安全任务已覆盖。',
        externalOpen: '销量、毛利、损耗、人效、采购、多店对标数据。',
        hundredPercentGate: '每个技能都有输入字段、输出物、负责人和禁止越界动作。',
        claimGuard: '未接入真实经营数据前，不宣称自动诊断或自动决策。',
      },
      {
        dimension: 'AI 问答与执行',
        internalClosed: '高频店长问题、判断路径、待确认建议和下一步任务已展示。',
        externalOpen: '实时销售、库存、预订、客资和执行系统写入权限。',
        hundredPercentGate: '回答必须拆成可执行、待确认、缺数据、禁止自动化四类。',
        claimGuard: '未授权前，不自动确认预订、改库存、发消息或发布内容。',
      },
      {
        dimension: '分层记忆',
        internalClosed: '门店、菜品、客群、证据四层写回闭环已显性化。',
        externalOpen: '账号体系、数据库、跨门店权限、审计日志。',
        hundredPercentGate: '每轮复盘都能说明写回哪一层、谁确认、下轮如何复用。',
        claimGuard: '没有长期存储前，不宣称跨会话或跨门店记忆。',
      },
      {
        dimension: '安全沙箱',
        internalClosed: '无凭证不发布、无授权不触达、无来源不归因的停止线已产品化。',
        externalOpen: 'OAuth、企业权限、加密存储、数据处理协议、操作日志。',
        hundredPercentGate: '所有高风险动作都有授权状态、责任人、阻断原因和可审计记录。',
        claimGuard: '无授权链路前，不宣称已接入平台账号或顾客数据。',
      },
      {
        dimension: '门店协同',
        internalClosed: '角色、负责人、状态、下一步动作和交接路径已展示。',
        externalOpen: '登录组织、消息通知、审批流、移动端触达。',
        hundredPercentGate: '任务从生成、审核、发布、回收、复盘都有时间线和责任人。',
        claimGuard: '无账号体系前，不宣称多人协同或企业级权限。',
      },
    ];
    const agentRoster = [
      { name: '预订 Agent', job: '接住电话/私信预约、识别取消和爽约风险', needs: '预约表 / 电话记录', state: '待接数据' },
      { name: '菜单 Agent', job: '检查菜品描述、套餐边界、毛利和缺货风险', needs: '菜单 / 库存 / 毛利', state: '可先手工导入' },
      { name: '本地生活 Agent', job: '生成点评、小红书、抖音、社群发布任务', needs: '平台账号 / 发布凭证', state: '人工发布门禁' },
      { name: '会员 Agent', job: '把券领取、复购、生日和社群互动转成跟进动作', needs: '会员表 / 社群记录', state: '待回填' },
      { name: '食品安全 Agent', job: '记录过敏原、禁用表达、食材声明和审核人', needs: '菜品说明 / 审核记录', state: '先做审核卡' },
      { name: '经营复盘 Agent', job: '把反馈、核销、桌均和评价汇总成下一轮决策', needs: '反馈表 / 核销表', state: '不伪装自动分析' },
    ];
    const dataGates = [
      { source: '预订 / 排队', fields: '姓名、人数、时段、来源、取消原因', gate: '没有接入前不展示满座预测' },
      { source: 'POS / 菜单', fields: '菜品、价格、毛利、库存、售罄状态', gate: '没有接入前不做自动定价建议' },
      { source: '大众点评 / 抖音 / 小红书', fields: '发布链接、截图、评论摘录、私信截图', gate: '没有凭证前不说已发布' },
      { source: '微信社群 / 会员', fields: '券领取、复购标签、生日、群互动', gate: '没有授权前只允许手工导入' },
    ];
    const capabilityBoundary = [
      {
        domain: '预订 / 排队',
        internal: ['粘贴预约表和私信记录', '识别取消、爽约、多人桌需求', '生成店长确认清单'],
        external: ['实时桌台库存', '电话/小程序/WhatsApp 接入', '押金或订金支付'],
        stopLine: '未接入前不能自动确认预订，也不能说已满座预测。',
      },
      {
        domain: 'POS / 菜单 / 库存',
        internal: ['手工导入菜单、价格和库存', '生成菜品卖点与禁用表达审核卡', '标记需要门店确认的毛利字段'],
        external: ['POS API', '库存实时同步', '券核销和销售流水'],
        stopLine: '未接入前不做自动定价、售罄判断或真实经营归因。',
      },
      {
        domain: '本地生活发布',
        internal: ['生成点评、小红书、抖音、社群任务', '记录链接、截图、负责人和审核状态', '整理复用素材包'],
        external: ['平台 OAuth / API', '自动发布权限', '平台回执和评论同步'],
        stopLine: '没有发布凭证时，不能冒充已接入或已发布。',
      },
      {
        domain: '会员 / 社群 / 私域',
        internal: ['手工导入券领取、私信、群反馈', '把高意向客资分配给负责人', '生成社群二次触达话术'],
        external: ['会员系统 API', '短信、微信或电话触达权限', '自动分群和黑名单同步'],
        stopLine: '未授权前不自动联系顾客，不导出敏感客资。',
      },
      {
        domain: '评价 / 复盘 / 舆情',
        internal: ['粘贴评价和截图', '汇总差评原因和下轮动作', '沉淀门店偏好和红线'],
        external: ['评价平台合法采集', 'Analytics Sync', '跨门店权限和企业存储'],
        stopLine: '没有来源证据时，不输出趋势结论或增长承诺。',
      },
    ];
    const memoryProfile = [
      { label: '常用门店语气', value: '朴实、热闹、少夸张，不写虚假排队' },
      { label: '菜品红线', value: '食材来源、功效、最低价、限量必须由门店确认' },
      { label: '负责人', value: '店长看审核，社群负责人跟券领取，运营补发布凭证' },
      { label: '下一轮沉淀', value: '把高意向客资、差评原因和爆款场景写回门店记忆' },
    ];

  return (
    <>
              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-stone-950 text-white shadow-sm">
                <div className="grid gap-5 border-b border-white/10 p-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-300">Claw Benchmark</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight">对标勺子 Claw：差距先摆出来</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-300">
                    Claw 的核心不是“帮你写文案”，而是餐饮人的超级 AI 大脑：开箱即用、跨平台分析、餐饮技能内置、分层记忆和沙箱隔离。当前版本必须先补可用工作台，再谈外部系统级自动化。
                  </p>
                </div>
                <div className="grid gap-3 p-5 xl:grid-cols-4">
                  {clawBenchmarks.map(item => (
                    <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={item.claim}>
                      <h3 className="text-base font-black text-emerald-200">{item.claim}</h3>
                      <div className="mt-4 space-y-3 text-xs leading-5">
                        <p className="text-stone-300"><span className="font-bold text-white">当前差距：</span>{item.gap}</p>
                        <p className="text-emerald-100"><span className="font-bold text-emerald-200">内部补足：</span>{item.internalFix}</p>
                        <p className="text-amber-100"><span className="font-bold text-amber-200">外部必需：</span>{item.externalNeed}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Final State</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">餐饮 AI 大脑最终形态定义</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    不再以电商工厂为参照，而是按餐饮经营系统的终局拆维度：每一层都必须说明最终形态、当前差距、内部补足、外部必需和验收证据。
                  </p>
                </div>
                <div className="divide-y divide-stone-100">
                  {finalStateDimensions.map(item => (
                    <article className="grid gap-4 p-5 xl:grid-cols-[140px_minmax(0,1.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]" key={item.dimension}>
                      <div>
                        <h3 className="text-base font-black text-stone-950">{item.dimension}</h3>
                        <span className="mt-2 inline-flex rounded-full bg-stone-100 px-2.5 py-1 text-[11px] font-semibold text-stone-500">终局维度</span>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">最终形态</div>
                        <p className="mt-2 text-xs leading-5 text-stone-700">{item.finalForm}</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700">当前差距</div>
                        <p className="mt-2 text-xs leading-5 text-stone-600">{item.currentGap}</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">内部补足</div>
                        <p className="mt-2 text-xs leading-5 text-stone-600">{item.internalPath}</p>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">外部必需 / 验收证据</div>
                        <p className="mt-2 text-xs leading-5 text-stone-600">{item.externalPath}</p>
                        <p className="mt-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs leading-5 text-amber-800">{item.proof}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">100% Closure</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">六维 100% 闭环验收表</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    这里的 100% 不是假装外部系统已接入，而是每个维度都补齐内部可交付闭环，并把外部系统接入前不能越过的门槛写死。
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1060px] text-left text-sm">
                    <thead className="bg-stone-50 text-[11px] uppercase tracking-[0.16em] text-stone-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">维度</th>
                        <th className="px-4 py-3 font-semibold">内部已补齐</th>
                        <th className="px-4 py-3 font-semibold">外部仍必需</th>
                        <th className="px-4 py-3 font-semibold">100% 验收门槛</th>
                        <th className="px-4 py-3 font-semibold">禁止伪装</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {completionGates.map(item => (
                        <tr className="hover:bg-stone-50/70" key={item.dimension}>
                          <td className="px-4 py-4 font-black text-stone-950">{item.dimension}</td>
                          <td className="px-4 py-4 text-emerald-700">{item.internalClosed}</td>
                          <td className="px-4 py-4 text-amber-700">{item.externalOpen}</td>
                          <td className="px-4 py-4 text-stone-600">{item.hundredPercentGate}</td>
                          <td className="px-4 py-4 text-rose-700">{item.claimGuard}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Ready Tasks</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">餐饮 AI 开箱任务包</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    不等 POS 和平台授权，也能先让门店开箱使用：每个任务都写清输入、输出和不能越过的边界。
                  </p>
                </div>
                <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {quickTasks.map(task => (
                    <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={task.title}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-base font-black text-stone-950">{task.title}</h3>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">内部可先跑</span>
                      </div>
                      <dl className="mt-4 space-y-3 text-xs leading-5">
                        <div>
                          <dt className="font-bold text-stone-950">要填什么</dt>
                          <dd className="mt-1 text-stone-600">{task.input}</dd>
                        </div>
                        <div>
                          <dt className="font-bold text-stone-950">会得到什么</dt>
                          <dd className="mt-1 text-stone-600">{task.output}</dd>
                        </div>
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
                          <dt className="font-bold">边界</dt>
                          <dd className="mt-1">{task.boundary}</dd>
                        </div>
                      </dl>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Data Connector Board</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">跨平台数据接入板</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    继续对标 Claw、R365、Hang、Stavio 这类餐饮 AI/经营系统：先把“今天能手工跑”和“必须外部接入”并排展示，否则无法成为餐饮经营大脑。
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[980px] text-left text-sm">
                    <thead className="bg-stone-50 text-[11px] uppercase tracking-[0.16em] text-stone-500">
                      <tr>
                        <th className="px-4 py-3 font-semibold">数据源</th>
                        <th className="px-4 py-3 font-semibold">今天内部能跑</th>
                        <th className="px-4 py-3 font-semibold">外部必需</th>
                        <th className="px-4 py-3 font-semibold">交付物</th>
                        <th className="px-4 py-3 font-semibold">停止线</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {connectorReadiness.map(item => (
                        <tr className="hover:bg-stone-50/70" key={item.source}>
                          <td className="px-4 py-4 font-black text-stone-950">{item.source}</td>
                          <td className="px-4 py-4 text-stone-600">{item.today}</td>
                          <td className="px-4 py-4 text-amber-700">{item.external}</td>
                          <td className="px-4 py-4 text-emerald-700">{item.output}</td>
                          <td className="px-4 py-4 text-stone-600">{item.risk}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Restaurant Skill Map</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">餐饮技能地图，不只做营销</h2>
                    </div>
                    <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">先覆盖可交付任务，再接系统自动化</span>
                  </div>
                  <div className="mt-5 grid gap-3 md:grid-cols-2">
                    {skillMap.map(group => (
                      <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={group.group}>
                        <h3 className="text-base font-black text-stone-950">{group.group}</h3>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {group.skills.map(skill => (
                            <span className="rounded-full border border-stone-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-stone-700" key={skill}>{skill}</span>
                          ))}
                        </div>
                        <p className="mt-4 text-xs leading-5 text-emerald-700">内部：{group.internal}</p>
                        <p className="mt-1 text-xs leading-5 text-amber-700">外部：{group.external}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-950 p-5 text-white shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Self-Evolving Memory</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">分层记忆写回闭环</h2>
                  <p className="mt-3 text-sm leading-6 text-stone-300">Claw 的“越用越懂”不能只停留在口号。试用版先把每轮反馈写回的位置、用途和沙箱门槛显性化。</p>
                  <div className="mt-5 space-y-3">
                    {evolutionLoop.map(item => (
                      <article className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={item.layer}>
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-sm font-black text-emerald-200">{item.layer}</h3>
                          <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-stone-300">沙箱</span>
                        </div>
                        <p className="mt-3 text-xs leading-5 text-stone-300"><span className="font-bold text-white">写回：</span>{item.writes}</p>
                        <p className="mt-1 text-xs leading-5 text-stone-300"><span className="font-bold text-white">用于：</span>{item.uses}</p>
                        <p className="mt-1 text-xs leading-5 text-amber-100"><span className="font-bold text-amber-200">门槛：</span>{item.gate}</p>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Live Copilot</p>
                      <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">像店长一样问问题</h2>
                    </div>
                    <span className="w-fit rounded-full border border-stone-200 bg-stone-50 px-3 py-1.5 text-xs font-semibold text-stone-600">先给判断路径，不冒充实时数据</span>
                  </div>
                  <div className="mt-5 space-y-3">
                    {copilotQuestions.map(item => (
                      <article className="rounded-2xl border border-stone-200 bg-[#fbfaf7] p-4" key={item.question}>
                        <div className="text-sm font-bold text-stone-950">{item.question}</div>
                        <p className="mt-2 text-xs leading-5 text-stone-600">{item.answer}</p>
                      </article>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl border border-stone-200 bg-stone-950 p-5 text-white shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">Memory Profile</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight">越用越懂这家店</h2>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {memoryProfile.map(item => (
                      <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4" key={item.label}>
                        <div className="text-xs font-semibold text-emerald-300">{item.label}</div>
                        <p className="mt-2 text-xs leading-5 text-stone-300">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="border-b border-stone-200 p-5">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">Agent Roster</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">六个餐饮数字员工，各自有证据门槛</h2>
                </div>
                <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-3">
                  {agentRoster.map(agent => (
                    <article className="rounded-2xl border border-stone-200 bg-stone-50 p-4" key={agent.name}>
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-bold text-stone-950">{agent.name}</h3>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-stone-500 ring-1 ring-stone-200">{agent.state}</span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-stone-600">{agent.job}</p>
                      <div className="mt-4 rounded-xl bg-white px-3 py-2 text-[11px] font-medium text-stone-500 ring-1 ring-stone-200">需要：{agent.needs}</div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-4 border-b border-stone-200 p-5 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sky-700">Capability Boundary</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">内部可先跑，外部必须接入</h2>
                  </div>
                  <p className="text-sm leading-6 text-stone-600">
                    竞品级餐厅 OS 不只是生成文案，还连着预订、POS、库存、会员、电话和平台数据。试用版先把内部可解决的工作流做深，把必须外部授权的能力放在明面上。
                  </p>
                </div>
                <div className="divide-y divide-stone-100">
                  {capabilityBoundary.map(item => (
                    <article className="grid gap-4 p-5 lg:grid-cols-[180px_minmax(0,1fr)_minmax(0,1fr)_230px]" key={item.domain}>
                      <div>
                        <div className="text-sm font-black text-stone-950">{item.domain}</div>
                        <div className="mt-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold text-stone-500">不能冒充已接入</div>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700">内部可先跑</div>
                        <ul className="mt-3 space-y-2 text-xs leading-5 text-stone-600">
                          {item.internal.map(task => (
                            <li className="flex gap-2" key={task}>
                              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-emerald-500" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">必须外部接入</div>
                        <ul className="mt-3 space-y-2 text-xs leading-5 text-stone-600">
                          {item.external.map(requirement => (
                            <li className="flex gap-2" key={requirement}>
                              <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-amber-500" />
                              <span>{requirement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs font-medium leading-5 text-amber-800">
                        <div className="mb-2 text-[11px] font-black uppercase tracking-[0.16em] text-amber-700">停止线</div>
                        {item.stopLine}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                <div className="grid gap-0 lg:grid-cols-[300px_minmax(0,1fr)]">
                  <div className="border-b border-stone-200 bg-[#f8f6f0] p-5 lg:border-b-0 lg:border-r">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-amber-700">No Fake Automation</p>
                    <h2 className="mt-2 text-2xl font-black tracking-tight text-stone-950">接入门槛先说清</h2>
                    <p className="mt-3 text-sm leading-6 text-stone-600">竞品强在 POS、预订、菜单、库存、会员和语音入口；当前试用版先把字段和阻断线展示出来，避免把手工流程包装成已自动化。</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] text-left text-sm">
                      <thead className="bg-stone-50 text-[11px] uppercase tracking-[0.16em] text-stone-500">
                        <tr>
                          <th className="px-4 py-3 font-semibold">数据源</th>
                          <th className="px-4 py-3 font-semibold">要收什么</th>
                          <th className="px-4 py-3 font-semibold">阻断线</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {dataGates.map(item => (
                          <tr className="hover:bg-stone-50/70" key={item.source}>
                            <td className="px-4 py-4 font-semibold text-stone-950">{item.source}</td>
                            <td className="px-4 py-4 text-stone-600">{item.fields}</td>
                            <td className="px-4 py-4 text-amber-700">{item.gate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </section>

    </>
  );
}
