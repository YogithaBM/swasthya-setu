import MyRecordsClient from "@/components/MyRecordsClient";
import { getLang } from "@/lib/lang";

export default function MyRecordsPage() {
  return <MyRecordsClient lang={getLang()} />;
}
