import ContactsPage from "@/components/main/app/contacts/Page";
import { SITE_NAME } from "@/utils/site";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: `${SITE_NAME} | Contacts`,
    description: "Manage your contacts",
    robots: {
        index: false,
        follow: false,
    },
};

export default function Contacts() {
    return <ContactsPage />;
}
