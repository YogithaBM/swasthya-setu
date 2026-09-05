import LabOrdersClient from "@/components/LabOrdersClient";
import { getLang } from "@/lib/lang";

export default function LabOrdersPage() {
  return <LabOrdersClient lang={getLang()} />;
}
