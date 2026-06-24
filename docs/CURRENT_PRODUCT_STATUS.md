# Wenai 当前产品状态

## 总体结论

Wenai 当前已经从旧的电商/通用内容工厂迁移到“餐饮门店增长 AI OS”的可验证骨架。它不是单点 AI 生成 demo，也不是通用 AI 工具目录。当前主路径围绕 `/factory?variant=friend_trial`，让餐饮老板、店长、运营和社群负责人从一家真实餐厅、一道主推菜/套餐/活动开始，生成可审核、可发布、可追踪、可复盘的门店增长任务链。

当前最重要的产品事实：

- 主入口已经强调“今天该做哪件事”，而不是营销大 hero。
- `/factory?variant=friend_trial` 已经把餐厅/菜品输入、下一步按钮、内部可完成项、外部账号/授权/数据门禁、任务、负责人、凭证、状态和下一步放进第一视口。
- `restaurant-growth-loop-v1` 已经把长期产品闭环固化为 Intake、Diagnose、Create、Publish Proof、Recover、Review Loop 六段结构。
- Wenai 可以演示受控 POC：录入、诊断、内容任务包、发布凭证清单、店长跟进、脱敏回流、下一轮建议。
- Wenai 还不能宣称真实自动发布、一键成片完成、电话自动接待、真实经营归因、核销归因或规模化增长结果，因为外部账号、授权、回调、POS/会员/核销数据契约尚未全部接入并验证。

## 当前进度判断

| 维度 | 进度 | 判断 |
| --- | ---: | --- |
| 内部门店增长闭环 | 95% | 六段闭环模型、friend trial 首屏、任务/负责人/凭证/门禁表达已经到位；Publish Proof、Recover、老板版 Review Loop、可转发摘要、视频生产护照、电话接待门禁、菜品成本/库存样表和粘贴导入模板已有可测试合同。 |
| 非技术客户 POC 展示 | 88% | 老板能看到今天任务、输入项、下一步、内部可做、外部缺口、可转发复盘摘要、视频生产护照、电话接待门禁和成本/库存样表；深层 AI OS 能力仍需进一步折叠和客户化。 |
| 竞品参照转化 | 86% | 筷子科技、美团智能掌柜、Owner.com、SevenRooms、Slang/ConverseNow/Square Voice AI、MarketMan 已进入模型判断；电话/前厅接待、成本/库存和客户化能力矩阵已转成受控模块。 |
| 真实商用 readiness | 60% | 可做受控试点、人工凭证回填和脱敏复盘建议；真实平台授权、电话/POS/会员/库存/核销数据、provider callback 仍是 P0 门禁。 |
| 文档事实源健康度 | 82% | README、AI_CONTEXT、CURRENT_PRODUCT_STATUS、长期 prompt 和外部材料文档已经对齐为餐饮门店增长 AI OS；后续还需继续同步迁移审计和外部材料的旧 provider 叙述。 |

## 最终产品定位

Wenai 是给餐饮老板、店长、运营、社群负责人使用的“门店增长 AI OS”。它从一家真实餐厅、一道主推菜/套餐/活动开始，把到店理由、内容生产、发布凭证、预约/券/私信/评价回流、店长任务、经营复盘串成一条可审核、可追踪、可复盘的任务链。

## 六段闭环

| 阶段 | 目标 | 当前能展示 | 外部门禁 |
| --- | --- | --- | --- |
| Intake | 录入餐厅、门店、菜品/套餐、目标客群、到店场景、优惠边界、素材状态、经营目标 | friend trial 首屏输入、标准任务包、样例门店资料 | 商户确认、真实门店资料、素材授权 |
| Diagnose | 输出到店理由、差评风险、竞品机会、素材缺口、平台建议 | 公开资料/人工输入/脱敏汇总的诊断框架 | 平台后台授权、评价/榜单/门店公开资料合法来源 |
| Create | 生成短视频脚本、图文笔记、点评回复、社群话术、团购券说明、门店海报 brief、素材清单 | 内容任务包、脚本/素材 brief、店长审核项 | 视频/图片 provider、素材版权、品牌审核 |
| Publish Proof | 给大众点评/美团/小红书/抖音/微信社群等渠道排期并收凭证 | Publish Proof Board、链接/截图/发布时间/负责人字段 | 平台账号、商户授权、发布权限、回执约定 |
| Recover | 回收预约、券领取、私信咨询、评价、社群反馈、到店/核销汇总 | 脱敏聚合信号、店长跟进、人工导入 | POS/核销/会员/社群数据契约，不保存原始私信或手机号 |
| Review Loop | 输出下一轮动作：推哪道菜、改哪个卖点、补什么素材、谁跟进、是否放大/暂停 | 老板/店长下一步建议、证据驱动的任务队列 | 真实经营归因、授权汇总数据、可审计复盘样本 |

## 竞品参照层

竞品只作为 benchmark 和产品判断材料，不能写成 Wenai 自有成绩。

| 参考 | Wenai 学什么 | 当前产品判断 |
| --- | --- | --- |
| 筷子科技 / Kuaizi | 编导灵感、智镜视频解析、脚本生成、素材生产、短视频混剪、AI 一键成片、矩阵宝、广告投放、团队权限、内容供应链 | Wenai 必须从“生成内容”升级为“任务、素材、发布、凭证、复盘”的内容工业化链路；没有 provider callback 不宣称一键成片完成。 |
| 美团智能掌柜 | 盯评价、出报表、看选址、懂顾客、AI 接待员、门店经营问答 | Wenai 首屏必须回答“今天店长该做哪件事”，避免只展示工具能力。 |
| Slang / ConverseNow / Square Voice AI | 电话接待、订位、点餐、菜单问答、转人工、通话摘要、减少漏接/错单 | 没有电话、菜单、POS、支付和转人工契约前，只做话术、员工审核草稿和门禁说明。 |
| Owner.com | 独立餐厅官网、SEO、在线点餐、会员、复购、自动营销、第一方订单增长 | Wenai 可以借鉴第一方增长阵地，但没有域名、支付、订单、会员授权前不能声称订单增长归因。 |
| SevenRooms | 预订、排桌、客情、评论/短信/邮件回复、CRM、会员体验、个性化服务 | Wenai 的 Recover/Review Loop 要聚合预约、评价和客情，但不保存手机号、微信号、私信原文或顾客身份。 |
| MarketMan | 库存、订货、需求预测、菜品成本、毛利、浪费控制 | Wenai 可把菜品毛利/库存作为下一轮建议输入；没有 POS/库存/采购数据契约前只做样表验证。 |
| Otter / Deliverect / Toast / Popmenu | 多渠道订单、菜单同步、评价/营销、POS/数据同步 | 作为后续运营连接器参考，不提前承诺真实订单同步或 POS 写入。 |

## 当前已具备

- `/factory?variant=friend_trial`：默认非技术客户试跑入口，首屏已改成门店任务控制台。
- `README.md`：已改为餐饮门店增长 AI OS 的仓库入口，明确主路径、六段闭环、当前能力、重要文档和硬边界。
- `docs/AI_CONTEXT.md`：已改为后续 Codex 工作的紧凑事实源，强调首屏是今日门店任务控制台，深层 AI OS 能力放在高级区。
- `docs/WENAI_RESTAURANT_AI_OS_LONG_TERM_PROMPT.md`：长期接管 prompt 与竞品参考来源，覆盖 Kuaizi、美团智能掌柜、Slang、ConverseNow、Square、Owner、SevenRooms、MarketMan。
- `src/lib/restaurant-growth-loop.ts`：六段闭环数据结构，包含输入、输出、凭证、负责人、外部门禁和竞品启发。
- `src/lib/restaurant-competitor-capability-matrix.ts`：竞品能力矩阵客户化合同，把 Kuaizi、美团、语音接待、Owner.com、SevenRooms、MarketMan 和餐饮运营工具翻译成 Wenai 模块、闭环阶段、负责人、证据和停止线。
- `src/lib/restaurant-publish-proof-ledger.ts`：发布凭证账本合同，统一渠道、负责人、发布时间、链接/截图、状态、阻塞原因和脱敏回流信号。
- `src/lib/restaurant-recover-signal-import.ts`：Recover 脱敏反馈导入合同，只接收预约、券领取、咨询、评价、社群反馈、到店意向和核销的聚合数量。
- `src/components/FactoryFriendTrialExperience.tsx`：将今日任务、内部可完成项、账号/授权/数据门禁、六段闭环、发布凭证账本和老板版下一轮复盘展示到 customer-facing 页面。
- `src/components/ManageOperationsConsoleClient.tsx`：朋友试用管理页已经展示同一套老板复盘摘要，把发布证明、脱敏反馈、负责人下一步和暂停/放大边界放进到店跟进工作台。
- `/factory/cast`：已经把 `restaurant-publish-proof-ledger-v1` 接入 Publish Proof Board，friend trial 和 Cast 共用同一套发布凭证合同。
- `src/lib/restaurant-review-loop-boss-recap.ts`：老板版 Review Loop 合同，把发布凭证账本和脱敏回流合成下一轮建议，输出推哪道菜、改哪个卖点、补什么素材、谁跟进、是否放大/继续验证/暂停。
- `src/lib/restaurant-review-loop-share-summary.ts`：可转发 Review Loop 摘要合同，输出老板/店长可读的一页 Markdown，包含结论、负责人、证据和边界。
- `src/lib/restaurant-video-production-passport.ts`：Create / Cut 视频生产护照合同，把脚本、素材、外部视频通道、成片凭证、店长审核、发布证明和回流复盘放进一张可验证任务表。
- `src/lib/restaurant-voice-frontdesk-gate.ts`：语音/电话接待门禁合同，把菜单问答、订位/排队、点餐草稿、团购券问题、转人工和通话摘要拆成员工审核草稿与外部条件。
- `src/lib/restaurant-dish-cost-inventory-sample.ts`：菜品成本/库存样表合同，参考 MarketMan 把原料、库存、补货线、采购成本、损耗、负责人问题、粘贴导入模板和停止线拆成脱敏样表。
- 店长跟进/任务队列：已有 owner、evidence、next action 表达，可转发摘要已经接入管理页。
- 外部材料清单：`docs/EXTERNAL_INTEGRATION_MATERIALS.md` 已列出 provider、平台 OAuth、广告账户、analytics sync、企业资产云、规模审计材料。

## Demo / POC 阶段能真实展示

- 输入一家餐厅、一道主推菜/套餐/活动，生成今日门店增长工单。
- 输出到店理由、素材缺口、内容生产任务、发布凭证要求、店长跟进动作。
- 给出每个任务的负责人、状态、凭证要求和下一步。
- 标出哪些是内部可以处理，哪些需要外部账号、商户授权、数据契约或 provider 回调。
- 使用脱敏聚合信号演示预约、券领取、咨询、评价、到店/核销汇总如何进入 Review Loop。
- 基于发布凭证和脱敏回流生成老板版下一轮动作：推哪道菜、改哪个卖点、补什么素材、谁跟进、是否放大或暂停。
- 生成可转发给老板/店长的一页复盘摘要，保留证据来源、负责人、暂停/放大边界和隐私边界。
- 在 `/factory/video?variant=friend_trial` 展示视频生产护照，让非技术客户看到脚本、素材、剪辑、成片、店长审核、发布证明和复盘回流的负责人和证据缺口。
- 在 `/factory/manage?variant=friend_trial` 展示电话接待门禁，让客户看到订位、点餐、菜单问答、转人工和通话摘要目前只能生成员工审核草稿，缺电话接入、菜单字段、收银和支付约定时不承诺真实接待。
- 在 `/factory/manage?variant=friend_trial` 展示可转发前厅 SOP 摘要，把菜单问答、订位/排队、点餐草稿、转人工和通话摘要变成店长/前厅负责人可复核的交接清单。
- 在 `/factory/manage?variant=friend_trial` 展示菜品成本/库存样表，让客户看到库存、订货、菜品成本、毛利和浪费控制当前只进入负责人问题清单，缺销售、库存、采购和财务汇总约定时不写真实毛利或库存优化结论。
- 在 `/factory/manage?variant=friend_trial` 展示成本/库存粘贴模板入口，把已验证的表格样板交给店长复核，同时提醒不要贴顾客、聊天、券码、订单、支付或密钥信息。
- 在 `/factory/manage?variant=friend_trial` 展示成本/库存安全导入演练，支持粘贴样表、检查有效行/问题行/待补货、预览负责人复核内容；检查通过也不写真实毛利或库存优化结论。
- 在 `/factory?variant=friend_trial` 展示客户化竞品能力矩阵，让客户看到竞品参考已经转成 Wenai 自己的模块、负责人、证据、状态和下一步，而不是堆竞品名。
- 在模型层支持成本/库存样表的粘贴导入模板，可把表格或 CSV 转成安全样表行，并继续拒绝顾客、聊天、券码、订单、支付和密钥信息。
- 已将 `docs/RESTAURANT_MIGRATION_AUDIT.md` 和 `docs/EXTERNAL_INTEGRATION_MATERIALS.md` 改成餐饮门店增长 AI OS 事实源：竞品参照只作为模块启发，外部材料按餐厅、渠道、发布凭证、脱敏回收、电话接待、成本库存和视频 provider 门禁组织。
- 已加严 friend trial 客户页内部术语防线，真实渲染页继续禁止 provider、runtime、callback、review token、RBAC、DLP、grant、fail-closed 等工程/企业安全词外露。
- 已跑完整 `scripts\verify.ps1` 并通过；当前只剩 Turbopack NFT tracing 非阻塞提示。
- 已新增 `docs/RESTAURANT_DELIVERABLE_GROUPS.md`，把当前餐饮 AI OS 改动拆成 8 个可审、可测、可拆提交的交付组。

## 不能宣传的能力

- No provider callback：不宣称一键成片完成、批量智能混剪完成或真实视频生产闭环。
- No platform authorization：不宣称自动发布到大众点评/美团/小红书/抖音/微信社群。
- No merchant activity authorization：不宣称外部活动发布完成、自动拉客或自动优化。
- No POS/redemption/member data contract：不宣称真实核销、会员复购、毛利、库存或经营归因。
- No analytics sync：不宣称自动表现学习，只能说人工导入或脱敏汇总。
- No audited scale ledger：`91M+ creative output`、`42M+ video distribution` 只能作为竞品 benchmark，不能作为 Wenai 自有成绩。
- No private data storage：不保存手机号、微信号、私信原文、优惠码、订单明细、原始 POS 行、cookie、token、API key。

## 下一阶段最应该实现的功能

| 优先级 | 功能 | 目的 | 验收 |
| --- | --- | --- | --- |
| P0 | 分组复核 / 提交准备 | 按 `docs/RESTAURANT_DELIVERABLE_GROUPS.md` 分组复核当前 dirty tree | 不 broad add，不混入无关改动；每组保持可测、可回看 |
| P1 | 前厅接待摘要导出动作 | 把可转发 SOP 摘要接成复制/下载或交接记录 | 仍然只做员工审核材料，不宣称真实电话接待 |
| P1 | 成本/库存导入交接记录 | 把安全导入演练结果沉淀成店长复核记录 | 继续拒绝隐私、订单明细、券码和密钥，不宣称真实毛利 |

## 商用判断

Wenai 当前可以作为合作伙伴评审、朋友试用和受控客户 POC 的产品骨架。它已经能展示为什么外部材料接齐后会变成完整平台，也能避免伪功能宣传。

在 P0 外部材料没有配置并通过真实回调、平台账号、商户授权、发布凭证和脱敏反馈验证前，不建议公开销售为“筷子科技等价平台”或“自动门店增长系统”。当前最准确的定位是：已经具备餐饮门店增长 AI OS 的产品骨架和证据驱动工作台，正在等待外部执行层接入进入真实商用阶段。
## Phase 8 commit-prep snapshot

This section is a repository-facing handoff marker. It does not request staging, committing, resetting, cleaning, or discarding files.

- Source of truth: `docs/RESTAURANT_DELIVERABLE_GROUPS.md`.
- Review slices ready: 8/8.
- Suggested commit labels ready: 8/8.
- Last full verification: `C:\Windows\System32\WindowsPowerShell\v1.0\powershell.exe -ExecutionPolicy Bypass -File scripts\verify.ps1`.
- Verification result: passed.
- Focused suite result inside verify: 116 test files / 692 tests passed.
- Additional restaurant suites, TypeScript, ESLint, and Next build passed.
- Browser smoke verification: `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3100 npx.cmd playwright test restaurant-friend-trial.spec.ts --project=chromium` passed, 2 tests.
- Remaining non-blocking note: Turbopack NFT tracing warning on `next.config.ts -> src/lib/restaurant-store-memory.ts -> src/app/api/restaurant-agent/full-pack/route.ts`.
- Worktree policy: no broad add; preserve unrelated edits; split review by the 8 delivery groups.

Ready review groups:

1. `docs(restaurant): align AI OS fact sources and handoff groups`
2. `feat(restaurant): solidify friend trial first screen and six-loop spine`
3. `feat(restaurant): close publish proof recover and review loop`
4. `feat(restaurant): add video production passport gates`
5. `feat(restaurant): gate voice frontdesk staff workflows`
6. `feat(restaurant): add cost inventory safety rehearsal`
7. `feat(restaurant): map competitors into readiness gates`
8. `feat(restaurant): gate advanced runtime provider work`

Next P0: use the ready groups as the review/commit split map, then decide whether to create actual commits. Keep `.env.local`, credentials, raw customer data, generated output, and unrelated user edits out of every group.
