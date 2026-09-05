import AccessDeniedClient from "@/components/AccessDeniedClient";
import { getLang } from "@/lib/lang";

export default function AccessDeniedPage() {
  return <AccessDeniedClient lang={getLang()} />;
}