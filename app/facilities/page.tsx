import FacilitiesClient from "@/components/FacilitiesClient";
import { getLang } from "@/lib/lang";

export default function FacilitiesPage() {
  return <FacilitiesClient lang={getLang()} />;
}
