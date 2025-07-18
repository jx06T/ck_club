import ogImageSrc from "@images/branding/icon.png";

export const SITE = {
  title: "CKClubHub",
  tagline: "一個整合了標籤系統以及收藏功能的建中社團線上資料庫",
  description: "CKClubHub 是一個整合了標籤系統以及收藏功能的建中社團線上資料庫",
  description_short: "一個整合了標籤系統以及收藏功能的建中社團線上資料庫",
  url: "https://club.cksc.tw/",
  author: "https://github.com/jx06T",
};

export const SEO = {
  title: SITE.title,
  description: SITE.description,
  structuredData: {
    "@context": "https://schema.org",
    "@type": "WebPage",
    inLanguage: "zh-Hant",
    "@id": SITE.url,
    url: SITE.url,
    name: SITE.title,
    description: SITE.description,
    isPartOf: {
      "@type": "WebSite",
      url: SITE.url,
      name: SITE.title,
      description: SITE.description,
    },
  },
};

export const OG = {
  locale: "zh_TW",
  type: "website",
  url: SITE.url,
  title: `${SITE.title} : 一個整合了標籤系統以及收藏功能的建中社團線上資料庫`,
  description: " CKClubHub 是一個整合了標籤系統以及收藏功能的建中社團線上資料庫...",
  image: ogImageSrc,
};
