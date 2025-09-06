import Sidebar from "@/Components/Bar/Sidebar";

export default function Mainbar({ header, children }) {
    return (
        <div className="flex min-h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Konten utama */}
            <div className="flex-1 flex flex-col bg-gray-100">
                {/* Header */}
                <div className="sticky top-0 z-20 p-6 bg-white border-b border-gray-200">
                    {header}
                </div>

                {/* Konten halaman */}
                <main className="p-6 flex-1">
                    {children}
                </main>
            </div>
        </div>
    );
}
