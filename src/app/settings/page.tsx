'use client';

import { useState } from 'react';

import clientConfig from '@/config/client.json';
import modulesConfig from '@/config/modules.json';

const catDotColors: Record<string, string> = {
  execute: 'bg-cat-execute',
  content: 'bg-cat-content',
  intel: 'bg-cat-intel',
  service: 'bg-cat-service',
};

export default function SettingsPage() {
  const [config, setConfig] = useState(clientConfig);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');

  const toggleModule = (moduleId: string) => {
    setConfig(prev => {
      const enabled = new Set(prev.enabledModules);
      if (enabled.has(moduleId)) {
        enabled.delete(moduleId);
      } else {
        enabled.add(moduleId);
      }
      return { ...prev, enabledModules: Array.from(enabled) };
    });
    setSaved(false);
    setSaveError('');
  };

  const handleSave = async () => {
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      setSaved(true);
      setSaveError('');
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      setSaveError(`保存失败：${error instanceof Error ? error.message : '请手动修改 src/config/client.json'}`);
    }
  };

  const enabledCount = config.enabledModules.length;
  const totalCount = modulesConfig.modules.length;

  return (
    <div className="max-w-[900px] animate-fade-up">
      <div className="mb-7">
        <div className="mb-2 flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-accent" />
          <h1 className="font-[family-name:var(--font-outfit)] text-[16px] font-bold tracking-tight text-text-primary">
            客户配置
          </h1>
        </div>
        <p className="ml-4 text-[13px] text-text-secondary/90">
          管理客户基础信息、启用模块和交付入口；这里不保存任何第三方平台密钥。
        </p>
      </div>

      <div className="mb-4 rounded-md border border-border-default bg-bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="mb-4 flex items-center gap-2">
          <span className="label-mono text-[10px] font-bold">基本信息</span>
          <div className="h-px flex-1 bg-gradient-to-r from-border-subtle to-transparent" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label-mono mb-2 block text-[9px] font-semibold">客户名称</label>
            <input
              type="text"
              value={config.clientName}
              onChange={event => setConfig(prev => ({ ...prev, clientName: event.target.value }))}
              className="w-full rounded-md border border-border-subtle bg-bg-raised px-4 py-3 text-[13px] text-text-primary transition-all focus:border-accent focus:bg-bg-surface focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
            />
          </div>
          <div>
            <label className="label-mono mb-2 block text-[9px] font-semibold">行业</label>
            <input
              type="text"
              value={config.industry}
              onChange={event => setConfig(prev => ({ ...prev, industry: event.target.value }))}
              className="w-full rounded-md border border-border-subtle bg-bg-raised px-4 py-3 text-[13px] text-text-primary transition-all focus:border-accent focus:bg-bg-surface focus:shadow-[0_0_0_2px_rgba(200,151,90,0.15)]"
            />
          </div>
        </div>
      </div>

      <div className="mb-4 rounded-md border border-border-default bg-bg-surface p-5 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div className="mb-5 flex items-center gap-2">
          <span className="label-mono text-[10px] font-bold">AI 员工配置</span>
          <div className="h-px flex-1 bg-gradient-to-r from-border-subtle to-transparent" />
          <div className="flex items-center gap-2 rounded-md border border-border-subtle bg-bg-raised px-2.5 py-1.5">
            <span className="text-[9px] font-mono text-text-tertiary">已启用</span>
            <span className="text-[11px] font-mono font-bold tabular-nums text-accent">{enabledCount}</span>
            <span className="text-[9px] font-mono text-text-tertiary/60">/</span>
            <span className="text-[11px] font-mono tabular-nums text-text-secondary">{totalCount}</span>
          </div>
        </div>

        {modulesConfig.categories.map(category => {
          const catModules = modulesConfig.modules.filter(module => module.category === category.id);
          const catEnabled = catModules.filter(module => config.enabledModules.includes(module.id)).length;
          return (
            <div key={category.id} className="mb-5 last:mb-0">
              <div className="mb-2.5 flex items-center gap-2">
                <div className={`h-1.5 w-1.5 rounded-full ${catDotColors[category.id] || 'bg-text-tertiary'} shadow-[0_0_4px_currentColor]`} style={{ color: `var(--color-cat-${category.id})` }} />
                <span className="label-mono text-[9px] font-semibold">{category.label}</span>
                <div className="h-px flex-1 bg-border-subtle/50" />
                <span className="text-[8px] font-mono tabular-nums text-text-tertiary/70">
                  {catEnabled}/{catModules.length}
                </span>
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {catModules.map(module => {
                  const isEnabled = config.enabledModules.includes(module.id);
                  return (
                    <button
                      key={module.id}
                      type="button"
                      onClick={() => toggleModule(module.id)}
                      className={`group flex items-center justify-between rounded-md border px-3.5 py-2.5 text-[12px] transition-all duration-200 ${
                        isEnabled
                          ? 'border-accent/40 bg-accent/15 text-text-primary shadow-[0_2px_8px_rgba(200,151,90,0.15)]'
                          : 'border-border-subtle bg-bg-raised text-text-tertiary hover:border-border-default hover:bg-bg-hover hover:text-text-primary'
                      }`}
                    >
                      <span className="font-[family-name:var(--font-outfit)] font-semibold">{module.name}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-[8px] font-mono font-semibold uppercase tracking-[0.1em] ${isEnabled ? 'text-accent' : 'text-text-tertiary/70'}`}>
                          {isEnabled ? '开' : '关'}
                        </span>
                        <div className={`relative h-4 w-8 rounded-full transition-all duration-200 ${
                          isEnabled ? 'border border-accent/50 bg-accent/30' : 'border border-border-subtle bg-bg-surface'
                        }`}>
                          <div className={`absolute top-0.5 h-3 w-3 rounded-full transition-all duration-200 ${
                            isEnabled ? 'left-4 bg-accent shadow-[0_0_6px_rgba(200,151,90,0.6)]' : 'left-0.5 bg-text-tertiary/50'
                          }`} />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between rounded-md border border-border-default bg-bg-surface p-4 shadow-[0_2px_8px_rgba(0,0,0,0.2)]">
        <div>
          <p className="text-[11px] font-mono font-semibold text-text-tertiary">系统提示</p>
          <p className="mt-0.5 text-[9px] font-mono text-text-tertiary/70">修改后需要重启服务或重新部署才会对生产环境生效。</p>
        </div>
        <button
          type="button"
          onClick={handleSave}
          className={`rounded-md px-6 py-2.5 font-[family-name:var(--font-outfit)] text-[12px] font-semibold transition-all duration-200 ${
            saved
              ? 'border border-success/40 bg-success/15 text-success shadow-[0_2px_8px_rgba(74,222,128,0.2)]'
              : 'border border-accent bg-accent text-bg-root hover:bg-accent-hover hover:shadow-[0_4px_12px_rgba(200,151,90,0.3)] active:scale-95'
          }`}
        >
          {saved ? '已保存' : '保存配置'}
        </button>
      </div>
      {saveError && (
        <div className="mt-3 rounded-md border border-error/40 bg-error/5 px-4 py-3 text-[11px] text-error">
          {saveError}
        </div>
      )}
    </div>
  );
}
