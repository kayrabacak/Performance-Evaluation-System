import React from 'react';
import { 
    LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Bu bileşen, kendisine 'evaluations' prop'u ile verilen
// değerlendirme listesine göre grafikleri çizer.
const ReportCharts = ({ evaluations }) => {
    if (!evaluations || evaluations.length === 0) {
        return null; // Eğer veri yoksa, hiçbir şey gösterme.
    }

    // Çizgi grafiği için veri
    const lineChartData = evaluations
        .map(e => ({
            period: e.period,
            "Genel Skor": e.overallScore ? parseFloat(e.overallScore.toFixed(2)) : 0,
        }))
        .reverse();

    // Sütun grafiği için veri (sadece en son değerlendirme)
    const latestEvaluation = evaluations[0];
    const barChartData = latestEvaluation?.scores.map(s => ({
        name: s.criterionTitle,
        Puan: s.score
    }));

    return (
        <div className="charts-grid">
            {/* Çizgi Grafiği */}
            <div className="chart-container">
                <h4>Performans Gelişim Grafiği (Genel Skor)</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={lineChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="period" />
                        <YAxis domain={[0, 5]} />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="Genel Skor" stroke="#8884d8" activeDot={{ r: 8 }} />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Sütun Grafiği */}
            <div className="chart-container">
                <h4>Son Değerlendirme Detayları ({latestEvaluation?.period})</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={barChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Puan" fill="#82ca9d" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default ReportCharts;
