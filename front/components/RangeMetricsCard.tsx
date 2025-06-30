import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DataPoint {
  label: string;
  iae: number;
  ta_prog: number;
  tap: number;
}

interface RangeMetricsCardsProps {
  data: DataPoint[];
}

const RangeMetricsCards = ({ data }: RangeMetricsCardsProps) => {
  // Calculate average values
  const calculateAverages = () => {
    if (data?.length === 0) return { iae: 0, tap: 0, ta_prog: 0 };

    let totalIae = 0;
    let totalTap = 0;
    let totalTaProg = 0;

    data?.forEach((point) => {
      totalIae += point.iae;
      totalTap += point.tap;
      totalTaProg += point.ta_prog;
    });

    return {
      iae: totalIae / data?.length,
      tap: totalTap / data?.length,
      ta_prog: totalTaProg / data?.length,
    };
  };

  const averages = calculateAverages();

  // Function to get ICP interpretation
  const getICPInterpretation = (value: number) => {
    if (value >= 1.0) {
      return {
        level: "Excelente",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        description: "Participação excelente e sem lacunas.",
      };
    } else if (value >= 0.8) {
      return {
        level: "Boa",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        description: "Participação boa, com pequenas variações.",
      };
    } else if (value >= 0.5) {
      return {
        level: "Irregular",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        description: "Participação irregular, com lacunas significativas.",
      };
    } else {
      return {
        level: "Baixa",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        description: "Participação baixa ou esporádica, requer atenção.",
      };
    }
  };

  // Function to get TAP interpretation
  const getTAPInterpretation = (value: number) => {
    const percentage = value * 100;

    if (percentage <= 20) {
      return {
        level: "Excelente",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        description: "Tempo adequado, processo muito eficiente.",
      };
    } else if (percentage <= 40) {
      return {
        level: "Bom",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        description: "Tempo razoável, algumas melhorias possíveis.",
      };
    } else if (percentage <= 60) {
      return {
        level: "Atenção",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        description: "Tempo elevado, necessita atenção.",
      };
    } else {
      return {
        level: "Crítico",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        description: "Tempo crítico, intervenção necessária.",
      };
    }
  };

  // Function to get TA-PROG interpretation
  const getTAProgInterpretation = (value: number) => {
    const percentage = value * 100;

    if (percentage <= 25) {
      return {
        level: "Excelente",
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        description: "Progressão adequada, tempo de adequação excelente.",
      };
    } else if (percentage <= 50) {
      return {
        level: "Bom",
        color: "text-blue-600",
        bgColor: "bg-blue-50",
        borderColor: "border-blue-200",
        description: "Progressão boa, com margem para melhorias.",
      };
    } else if (percentage <= 75) {
      return {
        level: "Atenção",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        description: "Progressão lenta, necessita atenção.",
      };
    } else {
      return {
        level: "Crítico",
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        description: "Progressão crítica, intervenção urgente necessária.",
      };
    }
  };

  const metrics = [
    {
      key: "ICP",
      title: "ICP - Índice de Consistência de Participação",
      value: averages.iae, // Using IAE value for ICP calculation
      color: "#3B82F6",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <circle
            cx="10"
            cy="10"
            r="8"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M7 10l2 2 4-4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
          />
        </svg>
      ),
      explanation:
        "Mede o abandono estruturado ao longo da jornada, combinando a desistência entre pontos consecutivos e a queda no engajamento geral. O Índice de Abandono Estruturado (IAE) identifica pontos críticos com base em dados de participação, apoiando intervenções pedagógicas estratégicas.",
      interpretation: getICPInterpretation(averages.iae),
      ranges: [
        {
          range: "0",
          level: "Abandono inexistente",
          description: "Abandono inexistente ",
        },
        {
          range: "0.01 - 0.20",
          level: "Abandono baixo",
          description: "Abandono baixo.",
        },
        {
          range: "0.21 - 0.50",
          level: "Abandono moderado",
          description: "Abandono moderado",
        },
        {
          range: "> 0.50",
          level: "Abandono alto",
          description: "Abandono alto",
        },
      ],
    },
    {
      key: "TAP",
      title: "TAP - Tempo de Adequação do Ponto",
      value: averages.tap,
      color: "#10B981",
      bgColor: "bg-emerald-50",
      borderColor: "border-emerald-200",
      icon: (
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <polygon
            points="12 2 19 21 12 17 5 21"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      explanation:
        "Mede o abandono entre dois pontos consecutivos da jornada, indicando quantos alunos engajados anteriormente deixaram de participar no ponto atual. Ajuda a identificar onde ocorrem maiores desistências.", interpretation: getTAPInterpretation(averages.tap),
     ranges: [
        {
          range: "0",
          level: "Abandono inexistente entre pontos consecutivos",
          description: "Abandono inexistente entre pontos consecutivos",
        },
        {
          range: "0.01 - 0.20",
          level: "Abandono baixo entre pontos consecutivos.",
          description: "Abandono baixo entre pontos consecutivos.",
        },
        {
          range: "0.21 - 0.50",
          level: "Abandono moderado entre pontos consecutivos.",
          description: "Abandono moderado entre pontos consecutivos.",
        },
        {
          range: "> 0.50",
          level: "Abandono alto entre pontos consecutivos.",
          description: "Abandono alto entre pontos consecutivos.",
        },
      ],
    },
    {
      key: "TA-PROG",
      title: "TA-PROG - Tempo de Adequação Progressiva",
      value: averages.ta_prog,
      color: "#F59E0B",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      icon: (
        <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
          <rect
            x="6"
            y="6"
            width="8"
            height="8"
            strokeWidth="2"
            stroke="currentColor"
            fill="none"
          />
          <rect
            x="4"
            y="4"
            width="12"
            height="12"
            strokeWidth="1"
            stroke="currentColor"
            fill="none"
            opacity="0.5"
          />
        </svg>
      ),
      explanation:
        "Mede a queda de engajamento em um ponto da jornada com base em todos os alunos que participaram em algum momento, indicando o percentual que deixou de engajar.", 
        ranges: [
          {
            range: "0",
            level: "Abandono inexistente ao longo do mapa da jornada.",
            description: "Abandono inexistente ao longo do mapa da jornada.",
          },
          {
            range: "0.01 - 0.20",
            level: "Abandono baixo ao longo do mapa da jornada.",
            description: "Abandono baixo ao longo do mapa da jornada.",
          },
          {
            range: "0.21 - 0.50",
            level: "Abandono baixo ao longo do mapa da jornada.",
            description: "Abandono baixo ao longo do mapa da jornada.",
          },
          {
            range: "> 0.50",
            level: "Abandono baixo ao longo do mapa da jornada",
            description: "Abandono baixo ao longo do mapa da jornada.",
          },
        ],
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {metrics.map((metric) => (
        <Card
          key={metric.key}
          className={`${metric.bgColor} ${metric.borderColor} border-2 shadow-lg hover:shadow-xl transition-shadow duration-300`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <div style={{ color: metric.color }}>{metric.icon}</div>
              <CardTitle className="text-lg font-bold text-slate-900">
                {metric.key}
              </CardTitle>

            </div>
          </CardHeader>
          <CardContent>
            <h3 className="font-semibold text-slate-800 mb-3">
              {metric.title}
            </h3>

            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              {metric.explanation}
            </p>

            {/* Interpretation Scale */}
            <div className="mt-4 p-3 bg-slate-50 rounded-lg">
              <h4 className="text-xs font-medium text-slate-700 mb-2">
                Interpretação da Escala:
              </h4>
              <div className="space-y-1 text-xs text-slate-600">
                {metric.ranges.map((range, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{range.range}</span>
                    <span
                      className={`font-medium ${range.level === "Excelente"
                        ? "text-green-600"
                        : range.level === "Bom" || range.level === "Boa"
                          ? "text-blue-600"
                          : range.level === "Atenção" ||
                            range.level === "Irregular"
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                    >
                      {range.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RangeMetricsCards;
