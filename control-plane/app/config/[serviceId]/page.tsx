
import { ConfigurationForm } from "../../components/config/ConfigurationForm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ConfigPage({ params }: { params: { serviceId: string } }) {
    const serviceId = params.serviceId || "unknown-service";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/matrix" className="p-2 rounded-full hover:bg-panel-800 text-text-60 hover:text-text-100 transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div>
                    <div className="text-xs font-bold uppercase text-text-60 tracking-wider mb-1">Configuration</div>
                    <h1 className="text-3xl font-bold text-text-100">Configure Failure: <span className="text-accent-500">{serviceId}</span></h1>
                </div>
            </div>

            <ConfigurationForm serviceId={serviceId} />
        </div>
    );
}

export function generateStaticParams() {
    return [
        { serviceId: 'cbs' },
        { serviceId: 'otp' }
    ]
}
