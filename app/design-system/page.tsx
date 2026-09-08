import { getLang } from "@/lib/lang";

import DesignSystemClient from "./pageClient";

export const metadata = {
  title: "Design System · Swasthya Setu",
};

export default function DesignSystemPage() {
  const lang = getLang();
  return <DesignSystemClient lang={lang} />;
}
