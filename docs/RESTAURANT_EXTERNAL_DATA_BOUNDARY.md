# Restaurant external data boundary

This project can use public restaurant information as sample input, but it must not present that data as merchant-authorized operating data.

## Current public sample pack

- Source: OpenStreetMap via Overpass API.
- Query targets: restaurants near Shanghai People's Square, Beijing Sanlitun, Chengdu Taikoo Li and Guangzhou Tianhe.
- Captured OSM base timestamp: `2026-05-22T17:45:31Z`.
- License: ODbL. Keep attribution when displaying or exporting this data.
- Stored sample module: `src/lib/restaurant-public-data.ts`.
- UI surface: `/factory?variant=friend_trial`, in the public sample pack and import preview sections.

The sample is only for proving that the restaurant workflow can accept real-world POI names, rough location and cuisine tags. It does not prove menu accuracy, current opening status, promotion availability, review quality, reservations, coupon claims or private messages.

The current pack is intentionally bounded to public place data:

- restaurant name,
- city and nearby commercial area,
- rough scenario inferred from public area/cuisine tags,
- latitude and longitude,
- OSM source URL and ODbL license,
- suggested manual follow-up fields that still require merchant confirmation.

## External sources that need user-side setup

- Dianping / Meituan: merchant account, platform permission, export/API path, screenshot or link evidence rules.
- Xiaohongshu / Douyin: account authorization, content ID mapping, publish evidence, feedback import and message handling rules.
- Amap / Baidu / Google Places / Yelp: API key, quota, cost, caching policy, source attribution and terms review.
- POS / cashier / membership / inventory: sample export files, field dictionary, desensitization rules, import cadence and owner.

## Reference links

- OpenStreetMap restaurant tag: `https://wiki.openstreetmap.org/wiki/Tag:amenity%3Drestaurant`
- Overpass API language guide: `https://wiki.openstreetmap.org/wiki/Overpass_API/Language_Guide`
- Google Places Nearby Search: `https://developers.google.com/maps/documentation/places/web-service/search-nearby`
- Yelp Fusion Business Search: `https://docs.developer.yelp.com/reference/v3_business_search`
- Amap Web Service POI search: `https://lbs.amap.com/api/webservice/guide/api/search`
- Baidu Place API: `https://lbsyun.baidu.com/faq/api?title=webapi/guide/webservice-placeapi`

## Product rule

Until those external conditions exist, Wenai can only show:

- manual import fields,
- evidence ledger,
- owner and next action,
- public POI sample loading,
- explicit "requires external setup" status.

It must not show automatic publishing, automatic customer contact, real reservation recovery, coupon redemption, POS analysis, or platform analytics as connected.
