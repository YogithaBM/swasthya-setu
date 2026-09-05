import AvailabilityClient from "@/components/AvailabilityClient";
import { getLang } from "@/lib/lang";

export default function AvailabilityPage() {
  return <AvailabilityClient lang={getLang()} />;
}