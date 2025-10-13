const navBarLinks = [
  { name: "首頁&社團博覽會", url: "/" },
  { name: "社團資料庫", url: "/clubs" },
  { name: "社團地圖", url: "/map" },
  { name: "社團聯展", url: "/exhibition" },
  { name: "關於", url: "/about" },
  // { name: "Dev", url: "/dev" },
];

const footerLinks = [
  {
    section: "網站頁面",
    links: [
      { name: "關於此網站", url: "/about" },
      { name: "近期活動", url: "/events" },
      // { name: "聯絡我們", url: "/contact" },
      { name: "版權聲明", url: "/copyright" },
      { name: "隱私權政策", url: "/privacy" },
      // { name: "開發者頁面", url: "/dev" },
    ],
  },
  {
    section: "相關連結",
    links: [
      { name: "社團管理平台", url: "https://sites.google.com/gl.ck.tp.edu.tw/ckclub/" },
      { name: "建中校網", url: "https://www.ck.tp.edu.tw/nss/p/index" },
      { name: "班聯會會網", url: "https://www.cksc.tw/" },
    ],
  },
];

const socialLinks = {
  github: "https://github.com/jx06T/ck_club",
  instagram1: "https://www.instagram.com/cksc.80th/",
  instagram2: "https://www.instagram.com/ck_club_exhibition__/",
};

export default {
  navBarLinks,
  footerLinks,
  socialLinks,
};