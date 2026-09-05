import TriageClient from "@/components/TriageClient";
import { getLang } from "@/lib/lang";

export default function TriagePage() {
  return <TriageClient lang={getLang()} />;
}