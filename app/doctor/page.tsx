import DoctorClient from "@/components/DoctorClient";
import { getLang } from "@/lib/lang";

export default function DoctorPage() {
  return <DoctorClient lang={getLang()} />;
}