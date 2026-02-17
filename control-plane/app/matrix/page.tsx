import { ServiceMatrixTable } from "../components/matrix/ServiceMatrixTable";

export default function MatrixPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-text-100">Service Matrix</h1>
                <p className="text-text-60">Select failure injections to apply to specific services.</p>
            </div>

            <div className="rounded-xl border border-panel-700 bg-panel-800 p-6">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-lg font-bold text-text-100">Injection Control</h2>
                        <p className="text-sm text-text-60">Toggle a switch to start a failure injection immediately.</p>
                    </div>

                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg bg-panel-700 hover:bg-panel-600 text-text-100 text-sm font-medium transition-colors border border-panel-600">
                            Reset All
                        </button>
                        <button className="px-4 py-2 rounded-lg bg-accent-500 hover:bg-accent-400 text-bg-900 text-sm font-bold transition-colors shadow-[0_0_20px_rgba(255,200,87,0.1)]">
                            Apply Batch
                        </button>
                    </div>
                </div>

                <ServiceMatrixTable />
            </div>
        </div>
    );
}
