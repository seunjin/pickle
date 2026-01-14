import type { Metadata } from "next";
import { SettingContent } from "./SettingContent";

export const metadata: Metadata = {
  title: "Settings | Pickle",
};

export default function SettingsPage() {
  return <SettingContent />;
}
