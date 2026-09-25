import Sidebar from "@/components/layout/Sidebar";
import TopHeader from "@/components/layout/TopHeader";

export default function DashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div className="relative flex h-screen flex-col overflow-hidden bg-[#070a13] text-slate-100">
            {/* Ambient Aurora Glow - Neon Yaro Signature */}
            <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
                <div className="absolute -top-[25%] left-[10%] h-[600px] w-[600px] rounded-full bg-pink-500/[0.12] blur-[150px]" />
                <div className="absolute top-[30%] -right-[10%] h-[550px] w-[550px] rounded-full bg-purple-600/[0.11] blur-[160px]" />
                <div className="absolute -bottom-[20%] left-[25%] h-[500px] w-[500px] rounded-full bg-indigo-600/[0.09] blur-[140px]" />
            </div>

            <div className="relative z-10 flex flex-1 overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden">
                    <TopHeader />
                    <main className="relative w-full flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        {children}
                    </main>
                </div>
            </div>
        </div>
    );
}
