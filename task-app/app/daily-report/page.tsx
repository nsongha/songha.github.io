import { MainLayout } from '@/components/layout/main-layout';
import { DailyReport } from '@/components/dashboard/daily-report';

export default function DailyReportPage() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daily Report</h1>
          <p className="text-gray-600 mt-1">Quick standup report - auto-generated</p>
        </div>
        <DailyReport />
      </div>
    </MainLayout>
  );
}
