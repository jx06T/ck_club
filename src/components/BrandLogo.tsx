import { useEffect, useState } from "react";

import LogoLight from "@images/branding/logo.svg";
import LogoDark from "@images/branding/logo_dark.svg";

function BrandLogo() {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const onThemeChange = (e: CustomEvent) => {
      setIsDark(e.detail === "dark");
    };
    window.addEventListener("on-hs-appearance-change", onThemeChange as EventListener);

    return () => {
      window.removeEventListener("on-hs-appearance-change", onThemeChange as EventListener);
    };
  }, []);

  return <>{isDark ? <LogoDark /> : <LogoLight />}</>;
};

export default BrandLogo;
