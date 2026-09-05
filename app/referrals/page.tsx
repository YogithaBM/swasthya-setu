import ReferralsClient from "@/components/ReferralsClient";
import { getLang } from "@/lib/lang";

export default function ReferralsPage() {
  return <ReferralsClient lang={getLang()} />;
}
