import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import FactoryPage from '@/app/factory/page';

describe('factory page', () => {
  it('gives restaurant trial users a direct intake workspace with deferred advanced audit', async () => {
    const page = await FactoryPage({
      searchParams: Promise.resolve({ variant: 'friend_trial' }),
    });
    const html = renderToStaticMarkup(page);

    expect(html).toContain('/factory/creative?variant=friend_trial');
    expect(html).toContain('Next Step');
    expect(html).toContain('打开流程入口');
    expect(html).toContain('Wenai 餐饮门店增长工作台');
    expect(html).toContain('今天先创建一个门店活动');
    expect(html).toContain('带着信息进入下一步');
    expect(html).toContain('餐厅 / 门店');
    expect(html).toContain('菜品 / 套餐 / 活动');
    expect(html).toContain('到店理由');
    expect(html).toContain('已有证据');
    expect(html).toContain('发布链接或截图必须回填');
    expect(html).toContain('原通用工厂入口太像概念展板');
    expect(html).toContain('内部已解决');
    expect(html).toContain('外部数据必需');
    expect(html).toContain('本地可跑的 100% 试用闭环');
    expect(html).toContain('生成本地闭环任务');
    expect(html).toContain('内部闭环');
    expect(html).toContain('非外部接入');
    expect(html).toContain('手工经营数据');
    expect(html).toContain('证据账本');
    expect(html).toContain('发布凭证');
    expect(html).toContain('到店跟进');
    expect(html).toContain('记忆写回');
    expect(html).toContain('任务、证据、负责人和下一步');
    expect(html).toContain('核对菜品卖点和禁用表达');
    expect(html).toContain('回填发布凭证');
    expect(html).toContain('分配到店跟进');
    expect(html).toContain('手工导入先跑，外部接入后再自动化');
    expect(html).toContain('POS / 收银');
    expect(html).toContain('未导入前不判断真实盈亏');
    expect(html).toContain('内容规模先收住');
    expect(html).toContain('默认可操作区');
    expect(html).toContain('高级审计区');
    expect(html).toContain('展开查看 Claw 对标、终局定义和外部接入门槛');
    expect(html).toContain('默认收起');
    expect(html).toContain('高级审计默认不加载到工作台正文');

    expect(html).not.toContain('对标勺子 Claw：差距先摆出来');
    expect(html).not.toContain('餐饮 AI 大脑最终形态定义');
    expect(html).not.toContain('跨平台数据接入板');
    expect(html).not.toContain('六个餐饮数字员工');
  });
});
