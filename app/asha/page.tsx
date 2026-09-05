import AshaClient from "@/components/AshaClient";
import { getLang } from "@/lib/lang";

export default function AshaPage() {
  return <AshaClient lang={getLang()} />;
}
