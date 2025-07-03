import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { X } from "lucide-react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts";
import {
    CircleDot,
    TriangleDot,
    SquareDot,
    CustomLegendContent,
} from "@/components/ChartShapes";
import { IAERange } from "@/types/dashboard";
import IAERangeSection from "./IAERangeSection";

interface IAERangeHistorySidebarProps {
    isOpen: boolean;
    selectedHistoryItem: any;
    onClose: () => void;
    IAERangeResponse: IAERange
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                <p className="font-semibold text-gray-900">{`${label}`}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }} className="text-sm">
                        {`${entry.dataKey}: ${entry.value}%`}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

const IAERangeHistorySidebar = ({
    isOpen,
    selectedHistoryItem,
    onClose,
    IAERangeResponse
}: IAERangeHistorySidebarProps) => {
    if (!isOpen) return null;
    console.log(IAERangeResponse)
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
            <div className="bg-white w-full max-w-4xl h-full overflow-y-auto shadow-2xl">
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900">
                            Análise Histórica Range
                        </h2>
                        <p className="text-slate-600">
                            {selectedHistoryItem?.journey_name}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onClose}
                        className="flex items-center gap-2"
                    >
                        <X className="h-4 w-4" />
                        Fechar
                    </Button>
                </div>

                <IAERangeSection
                    iaeRangeResponse={IAERangeResponse!}
                />
            </div>
        </div>
    );
};

export default IAERangeHistorySidebar;
