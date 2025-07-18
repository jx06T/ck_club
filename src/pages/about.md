---
title: 關於此網站
layout: ../layouts/MarkdownLayout.astro
date: "2025-07-08"
---

# 關於此網站

# 社團聯展網站架構說明

## 專案概述

今年度的社團博覽會新增了集章活動，需要知道所需印章對應社團所在位置，但發放紙本效果可能不好，故計畫製作線上社團地圖。
又發現校網上留下的線上社團介紹網站十分簡陋，最後決定重新製作新的整合介紹網站。
此網站為社團聯展活動的線上平台，整合了活動介紹與攤位地圖等等資訊外，更提供完整的社團資訊查詢與相關外部資訊整合。

## 專案背景與目的

### 為何製作

- **資訊整合需求**：將分散的社團資訊統一整合，方便學生查詢與瀏覽
- **活動推廣平台**：提供社團聯展活動的官方展示平台
- **數位化轉型**：取代傳統紙本宣傳，提升資訊傳遞效率
- **長期資料庫建置**：建立完整的社團資料庫，供未來持續使用

### 預期效益

- 提升學生對社團活動的參與度
- 減少資訊不對稱問題
- 提供社團更好的宣傳管道
- 建立可持續使用的資訊平台

## 系統架構

### 前端架構

- **響應式設計**：支援桌面、平板、手機等各種裝置
- **SSG 架構** ：提供快速的載入速度與 SEO 優化
- **用戶介面**：簡潔介面，提供直觀的瀏覽體驗
- **互動功能**：包含社團搜尋、篩選、收藏等互動元素

### 資料庫設計

- **社團資料**：採用 markdown 文件儲存資料，直接使用 GitHub 作為 CMS 工具。
- **活動資料表**：記錄聯展相關活動、時程、地點資訊
- **使用者互動資料**：匿名化的瀏覽行為與問卷回饋

## 主要功能模組

### 活動介紹區塊

- **活動概覽**：社團聯展的基本資訊、目的與特色
- **活動時程**：詳細的活動排程與重要時間節點
- **參與方式**：如何參加活動的相關指引
- **場地資訊**：活動地點、交通資訊、設施說明

### 社團資料庫

- **社團列表**：完整的參與社團清單與基本資訊
- **詳細介紹**：每個社團的深度介紹、特色活動、成果展示
- **分類篩選**：依據社團類型、興趣領域等進行分類
- **搜尋功能**：關鍵字搜尋特定社團或活動內容
- **收藏功能**：讓使用者標記感興趣的社團
- **分享機制**：支援社群媒體分享功能

## 維護與擴展

### 管理架構

- **主要管理者**：負責網站整體營運與政策制定
- **技術維護**：處理系統更新、bug 修復、效能優化
- **內容管理**：負責社團資料更新、活動資訊維護
- **使用者支援**：處理使用者問題與意見回饋

### 維護計畫

- **預計管理單位**：班聯會資訊股或建中電子計算機研究社
- **技術支援**：班聯會直接徵才或電子計算機研究社
- **預算規劃**：班聯會費
- **交接機制**：建立完整的系統交接文件與流程

_本說明將根據實際開發進度與管理需求進行更新。_
