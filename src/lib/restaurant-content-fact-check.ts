import type { RestaurantContentIntake } from '@/lib/restaurant-content-prompts';

export interface ContentFactWarning {
  code: 'price-mismatch' | 'invented-price' | 'banned-word' | 'limit-mismatch' | 'growth-promise';
  message: string;
}

const BANNED_WORDS = ['最好吃', '第一名', '全网第一', '顶级', '绝无仅有', '国家级', '百分之百', '独家秘方', '全城最', '史上最'];
const GROWTH_PROMISES = ['保证爆单', '必火', '稳赚', '包赚', '销量翻倍', '客流翻倍'];

function extractPrices(text: string): string[] {
  return (text.match(/[¥￥]\s?\d+(?:\.\d+)?/g) || []).map(price => price.replace(/[¥￥\s]/g, ''));
}

function extractLimits(text: string): string[] {
  return (text.match(/限量?\s?(\d+)\s?份/g) || []).map(match => (match.match(/\d+/) || [''])[0]).filter(Boolean);
}

/**
 * 把生成的文案和门店事实对一遍：价格只许用门店给的数字、限量数字要一致、
 * 广告法风险词和爆单式承诺直接标红。返回警示清单，空数组 = 没发现问题。
 */
export function checkContentFacts(output: string, intake: RestaurantContentIntake): ContentFactWarning[] {
  const warnings: ContentFactWarning[] = [];
  const text = output || '';
  const factSource = [intake.offer, intake.visitReason, intake.constraints, intake.freebie, intake.dailyLimit].filter(Boolean).join(' ');

  const allowedPrices = new Set(extractPrices(factSource));
  for (const price of new Set(extractPrices(text))) {
    if (allowedPrices.size === 0) {
      warnings.push({ code: 'invented-price', message: `文案里出现了价格 ¥${price}，但门店资料没给任何价格，店长核实后再发。` });
    } else if (!allowedPrices.has(price)) {
      warnings.push({ code: 'price-mismatch', message: `文案里的价格 ¥${price} 和门店资料（${[...allowedPrices].map(allowed => `¥${allowed}`).join('、')}）对不上。` });
    }
  }

  const allowedLimits = new Set(extractLimits(factSource));
  for (const limit of new Set(extractLimits(text))) {
    if (allowedLimits.size > 0 && !allowedLimits.has(limit)) {
      warnings.push({ code: 'limit-mismatch', message: `文案里的限量 ${limit} 份和门店资料对不上。` });
    }
  }

  for (const word of BANNED_WORDS) {
    if (text.includes(word)) {
      warnings.push({ code: 'banned-word', message: `「${word}」有广告法风险，发布前必须删掉或改写。` });
    }
  }
  for (const promise of GROWTH_PROMISES) {
    if (text.includes(promise)) {
      warnings.push({ code: 'growth-promise', message: `「${promise}」是经营承诺，这个产品不做这种宣称，删掉。` });
    }
  }

  return warnings;
}
