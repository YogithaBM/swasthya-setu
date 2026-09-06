import EscalationClient from "@/components/EscalationClient";
import { getLang } from "@/lib/lang";

export default function EscalationPage() {
  return <EscalationClient lang={getLang()} />;
}
