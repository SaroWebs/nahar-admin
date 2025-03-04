import MasterLayout from '@/Layouts/MasterLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <MasterLayout>
            <Head title="Dashboard" />

            <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                <div className="bg-white p-6 text-gray-900">
                    Dashboard
                </div>
            </div>
        </MasterLayout>
    );
}
