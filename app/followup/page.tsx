import FollowupClient from "@/components/FollowupClient";
import { getLang } from "@/lib/lang";

export default function FollowupPage() {
  return <FollowupClient lang={getLang()} />;
}
