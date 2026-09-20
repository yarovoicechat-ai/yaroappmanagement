import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="app-shell flex h-screen overflow-hidden">
            <Sidebar />
            <main className="app-main relative w-full flex-1 overflow-y-auto p-4 pt-16 md:p-8 md:pt-8">
                {children}
            </main>
        </div>
    );
}
