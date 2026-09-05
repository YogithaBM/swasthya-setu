import AppointmentsClient from "@/components/AppointmentsClient";
import { getLang } from "@/lib/lang";

export default function AppointmentsPage() {
  return <AppointmentsClient lang={getLang()} />;
}