import LoginClient from "@/components/LoginClient";
import { getLang } from "@/lib/lang";

export default function LoginPage() {
  return <LoginClient lang={getLang()} />;
}