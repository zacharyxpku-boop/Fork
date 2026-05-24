# Wenai 当前产品状态

## 总体结论

Wenai 现在不是单点 AI 生成 demo，而是电商 AI 内容工业化工作台的可验证内核。当前形态已经覆盖 `Compose / Create / Cut / Cast / Manage` 的内部链路：创意洞察、资产生产、视频工作流、矩阵分发账本、广告 campaign ledger、客户审核、CRM 交接、权限审计和表现回流。

但它还不是筷子科技级 live platform executor。原因很明确：真实视频 provider、多平台 OAuth、自动发布、广告账户投放、平台数据自动同步、企业云资产权限和规模审计还没有全部接入并跑出证据。

当前进度判断：

| 维度 | 进度 | 判断 |
| --- | ---: | --- |
| 内部全链路骨架 | 89% | 主要模块已具备 API、账本、页面或测试保护，创意收割、客户审核、Review CRM Handoff Packet、Manual Publish Receipt Board 和视频 provider 沙盒合约都有商用品质门禁 |
| 合作者 POC 展示 | 92% | 可以说明产品形态、能力边界、客户审核/CRM 承接闭环、人工发布证据门禁、视频 provider 接入路径和外部材料路径 |
| 不依赖外部平台的闭环 | 83% | 可做手动/沙盒/导入式闭环，不假装自动化，并能把客户动作、人工发布回执、provider submit/callback/result/review 拆成验收门禁 |
| 真实商用 readiness | 64% | 可做受控试点，不可直接大规模售卖；真实 provider、OAuth、广告账户、analytics sync 和云资产仍是 P0 外部门禁 |
| 距离筷子科技级平台 | 55% | 核心差距集中在外部平台执行、真实视频 provider、自动投放/回流和真实规模证据 |

## 最终产品形态

Wenai 的最终形态应是“电商内容工业化操作系统”，不是生成器集合。

- `Compose`：全网灵感管理、竞品账号/榜单/爆款视频拆解、hook bank、品牌学习、可审计 action queue
- `Create`：SKU feed、商品卖点、脚本、图片/视频素材、生产任务、供应商 callback、交付资产
- `Cut`：AI 视频分析、智能混剪、一键视频、批量版本、成片入库、客户 review token
- `Cast`：多平台账号池、PubPal/矩阵分发、发布排期、自动发布回执、广告 campaign ledger
- `Manage`：CRM/生产交接、客户审核、资产权限/RBAC/audit、表现回流、下一轮优化规则、规模审计

用户真实路径应是：

1. 导入商品、品牌、竞品和目标平台。
2. 系统拆解爆款结构并生成可执行 production plan。
3. 生成或接入视频/图文资产，进入客户审核。
4. 审核通过后进入账号矩阵、发布排期和广告计划。
5. 平台数据回流到 SKU、素材、账号、campaign 和品牌学习档案。
6. 下一轮自动生成更强的脚本、混剪版本、投放规则和销售交接建议。

## 当前已经具备

- `/status`：readiness、最终产品指挥台、竞品差距、外部 stop lines
- `/factory/video`：AI 视频、智能混剪、一键视频声明所需的视频生产护照、Cut 商用品质验收板，以及 Provider Sandbox Contract，把 submit adapter、callback signature、failure recovery、result ingestion、client review 拆成可验收门禁
- `/settings/kuaizi`：外部集成材料包、获取路径、安全边界
- `/review/[token]`：承接 Clico 的客户免登录审核入口，新增 Review Commercial Acceptance Board 和 Review CRM Handoff Packet，防止客户误批空交付或旧版本，并把预览、反馈、批准、异常保护、CRM/分发/复盘承接拆成门禁
- `/factory/cast`：新增 Manual Publish Receipt Board，把账号健康、频控余量、去重排期、人工发布回执和表现回流拆成门禁；无 OAuth 时只允许 manual-ready，不伪装自动发布
- `/api/creative-intelligence`：竞品与创意洞察 ledger
- `/api/creative-monitoring`：source/watchlist 任务与 provider-gated 采集，`/factory/creative` 增加 Creative Harvest Acceptance Board，把来源广度、重复采集、多模态解析、生产交接和复利学习拆成可验收门禁
- `/api/industrial-chain/*`：资产、生产交接、结果入库、分发、CRM 交接、审核
- `/api/asset-permissions`：RBAC、访问审计、storage object、临时 grant、download/share/publish/approve fail-closed enforcement
- `/api/brand-learning-profile`：hook、pacing、胜出素材、禁用模式、下一轮规则

## 竞品参考层

| 参考平台 | 应学习的能力 | Wenai 的产品含义 |
| --- | --- | --- |
| 筷子科技 | 编、拍、剪、投、管，多平台矩阵分发，广告投放，企业资产安全，规模化运营 | Wenai 必须从“能生成”升级为“能运营、能审计、能复利”的内容工业化平台 |
| Hookshot / Hookly | hook 提取、UGC 广告结构、agent 执行可追踪 | action queue 不能只给结果，要记录工具范围、运行状态、跳过原因和审核计划 |
| Creatify | 商品链接、图片、avatar、脚本、UGC 视频打包成 URL-to-video 工作流 | `Create` 和 `Cut` 必须把商品源、脚本、avatar/scene、结果 URL、review token、CRM 交接放进同一任务记录 |
| Omneky | 创意生成和 campaign launch、tracking、insights、optimization 绑定 | `Cast` 和 `Manage` 必须把 campaign ledger、预算、素材标签、表现回流、下一轮规则打通 |
| Marpipe | catalog ads 是 SKU feed 问题，不只是设计问题 | SKU 字段、offer、库存、动态 proof、catalog creative、分发和表现回流要进入同一实验循环 |
| Pencil | 生成式广告创意需要品牌规则、成片 polish、平台集成和团队治理 | 品牌学习不能只是报告，要变成 `Compose/Create/Cut` 的生产约束 |
| AdHawk | media buying automation 需要预算上限、暂停/放量规则、证据和回滚 | 没有账号授权、campaign 证据、spend cap 和 stop rules 前，Wenai 不能宣称自动投放 |
| Smartly.io | creative、media、intelligence 需要统一在一个 campaign operating layer | `Cast` 和 `Manage` 要把素材版本、账号、预算、campaign、平台回执、表现回流和下一轮 action queue 放进同一块可审计面板 |
| VidMob | creative analytics、platform readiness、performance learning 一体化 | AI 视频分析要连接 creative、platform、optimization，而不是只保存任务状态 |
| Creatopy | brand kit、模板复用、URL-to-ad、权限控制和多语言广告批量生产 | `Create/Cut` 要把品牌资产、模板、权限和版本矩阵统一起来，才有规模化生产稳定性 |
| Superads | 跨平台 creative insights、fatigue 识别和格式/钩子分析 | 创意洞察要接上平台表现和疲劳信号，而不是只做竞品拆解 |

## 能力判定

| 能力 | 当前状态 | 证据 | 剩余差距 |
| --- | --- | --- | --- |
| Compose | 部分具备 | 创意洞察、竞品 ledger、品牌学习、action queue、Creative Harvest Acceptance Board | 缺持续抓取、榜单监控、真实多模态解析 |
| Create | 部分具备 | 资产库、脚本、生产 handoff、provider gate | 缺稳定视频/图片 provider 真实 callback |
| Cut | 部分具备 | 视频 workflow、任务队列、结果入库、客户审核、Cut Operating Checks、Provider Sandbox Contract，把 AI 视频解析、智能混剪、一键视频、provider submit/callback/failure/result/review、成片审核、表现回流拆成可验收门禁 | 真视频 provider、剪辑引擎、成片回调和平台表现自动回流还没到真实可商用 |
| Cast | 部分具备 | 分发计划、dispatch、账号矩阵、campaign ledger、广告投放止损与放量门禁、Manual Publish Receipt Board | 缺 OAuth、自动发布、广告账户授权、平台自动回执 |
| Manage | 部分具备 | readiness、CRM、review、RBAC/audit、资产访问门禁矩阵、客户审核商用品质验收板、Review CRM Handoff Packet、表现回流 | 缺真实企业对象存储、团队云空间、正式 CRM/通知系统和规模审计 |
| AI 视频分析 | 部分具备 | 结构化模型、多模态字段、视频生产护照 | 缺真实持续解析 provider |
| PubPal/矩阵分发 | 部分具备 | 账号矩阵、发布槽位、dispatch 门禁 | 缺平台账号授权和自动发布 |
| 广告投放 | 部分具备 | campaign ledger、预算上限、暂停规则、平台证据、放量规则、回滚原因、回流门禁 | 缺广告账户授权、campaign API 和真实转化事件 |
| 91M+ creative output / 42M+ video distribution | 不具备 Wenai 自有声明资格 | 现为竞品 benchmark | 必须有 audited Wenai scale ledger 才能展示为自有规模 |

## 内部还能继续解决

这些不依赖外部密钥，可以继续由仓库内推进：

- 把客户 review 前台做厚：非技术客户能直接看成片、提反馈、批准、撤回、查看过期状态；当前已补 Review Commercial Acceptance Board 和 Review CRM Handoff Packet，下一步要接真实 CRM/工单/通知系统。
- 把视频生产任务做厚：source、script、asset、provider task、callback、failure recovery、result ingestion、review、CRM handoff 进入一条 task passport；当前已补 Provider Sandbox Contract，下一步要接真实 provider 沙盒账号和 signed callback 样例。
- 把创意洞察做厚：竞品账号、爆款视频、hook、节奏、SKU、platform、sales signal、下一轮建议全部结构化；当前已补 Creative Harvest Acceptance Board，下一步等合法数据源/provider 后验证自动采集稳定性。
- 把矩阵分发做厚：账号健康、发布频率、平台风险、去重、排期、fallback、人工发布回执和表现回流都进入 readiness；当前已补 Manual Publish Receipt Board，下一步等平台 OAuth 后接真实自动发布回执。
- 把广告投放做厚：预算上限、暂停/放量规则、证据 URL、回滚原因和禁止自动化条件；当前已经有 Ad Delivery Guardrails，下一步等广告账户授权后接真实 campaign API。
- 把资产权限做厚：download/share/publish/approve 全部先经过内部 RBAC、storage object、安全策略、临时 grant 和访问审计检查，失败默认关闭；真实云盘仍等对象存储/签名 URL 接入。
- 把全产品中文化做厚：页面、状态、报告、错误、readiness reason 都避免英文内部术语裸露给客户。

## 必须外部提供

P0：

- 视频生成/剪辑 provider pack：供应商、沙盒账号、server token、webhook secret、callback URL、样例 task、成本上限、授权素材。
- 平台 OAuth/account pool pack：抖音/小红书/快手/TikTok/Meta/Google/Amazon/Shopify 的开发者应用、redirect URI、测试账号、发布权限、限频规则。
- 广告账户/campaign pack：advertiser id、ad account id、campaign 权限、预算 cap、conversion event、test campaign、stop rules。

P1：

- Analytics sync/performance return pack：指标映射、归因窗口、UTM 或 asset_ref 规则、同步频率、样例报表。
- Enterprise asset cloud/permission pack：对象存储、CDN/签名 URL、DLP、水印、retention、team role mapping。
- Audited scale ledger pack：生产数量、发布数量、平台拆分、去重规则、时间范围、源账本和平台证据。

详细材料路径见 `docs/EXTERNAL_INTEGRATION_MATERIALS.md` 和 `/settings/kuaizi`。密钥不得进入 GitHub、聊天、报告、截图或浏览器本地存储，只能进服务端环境变量或部署平台 secret store。

## Stop Lines

- No provider callback: do not claim one-click finished video or batch smart remixing.
- No platform OAuth: keep distribution as manual/provider-gated dispatch.
- No ad account authorization: do not claim automatic ad delivery or optimization.
- No analytics sync: do not claim automatic performance learning beyond manual import.
- No object storage and signed URLs: do not claim enterprise cloud asset enforcement.
- No audited scale ledger: do not display Wenai-owned `91M+ creative output` or `42M+ video distribution` claims.

## 商用判断

Wenai 现在可以作为合作者评审和受控客户试点的商业 POC core。它可以解释清楚“为什么接入外部材料后会变成完整平台”，也能避免伪功能宣传。

但在 P0 外部材料没有配置并通过真实 callback、账号、campaign、performance evidence 验证前，不建议公开售卖为筷子科技等价平台。当前最准确的定位是：已经具备筷子科技方向的全链路产品骨架和护城河建设路径，正在等待外部执行层接入来进入真实商用阶段。
