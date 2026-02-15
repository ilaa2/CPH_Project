import Sidebar from "@/Components/Bar/Sidebar";

export default function Mainbar({ header, children }) {
    return (
        <Sidebar header={header}>
            {children}
        </Sidebar>
    );
}
