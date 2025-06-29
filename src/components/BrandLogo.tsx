import { useEffect, useState } from "react";
import BrightLogo from "@images/branding/logo.svg?url"
import DarkLogo from "@images/branding/logo_dark.svg?url"
function BrandLogo({ w }: { w: number }) {
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));

    const onThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      setIsDark(customEvent.detail === "dark");
    };

    window.addEventListener("theme-change", onThemeChange);
    return () => window.removeEventListener("theme-change", onThemeChange);
  }, []);

  return (
    <img
      src={isDark ? DarkLogo : BrightLogo}
      alt="Brand Logo"
      style={{
        width: w
      }}
      className="h-auto"
    />
  );
}

export default BrandLogo;