import { useState } from "react";
import { Clock, BarChart3 } from "lucide-react";
import RangeSection from "@/components/IAERangeSection";

const RangeDashboard = () => {
  // Tab state
  const [activeTab, setActiveTab] = useState<"range" | "periodic">("range");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Range Dashboard Content */}
        {activeTab === "range" && <RangeSection />}
      </div>
    </div>
  );
};

export default RangeDashboard;
