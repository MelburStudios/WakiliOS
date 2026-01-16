"use client";
import React from "react";
import Chart from "react-apexcharts";

export const ProfitChart = ({data}) => {
  const weekdays = data?.map(item => item?.weekday);
  const totalPayments = data?.map(item => item?.total_payment);
  const previousDays = data?.map(item => item?.previousDay);
  const chartOptions = {
    chart: {
      type: "bar",
      toolbar: { show: false },
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "50%",
        borderRadius: 2,
      },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: weekdays || [],
    },
    yaxis: { labels: { style: { colors: "#A0AEC0" } } },
    tooltip: { theme: "light" },
    colors: ["#D3D3D3", "#C7A87D"],
  };

  const chartSeries = [
    { name: "Previous", data: previousDays || [] },
    { name: "Current", data: totalPayments || []},
  ];

  return (
    <div className="">
     <Chart options={chartOptions} series={chartSeries} type="bar" height={200} width="100%" />
    </div>
  );
};

export const RevenueAnalyticsChart = ({data}) => {
 
  const month = data?.map(item => item?.month);
  const totalPayments = data?.map(item => item?.cases);

  const options = {
    chart: {
      type: "line",
      toolbar: {
        show: true,
      },
    },
    stroke: {
      curve: "smooth",
      width: 3,
    },
    xaxis: {
      categories: month || [],
    },
    yaxis: {
      title: {
        text: "Cases",
      },
    },
    colors: ["#29b6f6"],
    legend: {
      position: "bottom",
      markers: {
        fillColors: ["#29b6f6"],
      },
    },
  };
 
  const series = [
  
    {
      name: "Total",
      data: totalPayments || [],
      type: "line",
      color: "#8e44ad",
    },
  ];

  return (
    <div>
      <Chart options={options} series={series} type="line" height={392} />
    </div>
  );
};




export const DonutChart = ({data}) => {
  const chartOptions = {
    chart: {
      type: "donut",
    },
    labels: ["Total", "Ongoing", "Success", ],
    colors: ["#b68c5a", "#a7784b", "#8f613f"], // Purple, Blue, Yellow, Green
    legend: {
      show: false, 
    },
    dataLabels: {
      enabled: false,
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 300,
          },
          legend: {
            position: "bottom",
          },
        },
      },
    ],
  };

  const series = [
    (data?.confirmed_cases+data?.completed_cases ) || 0,
    data?.confirmed_cases || 0,
    data?.completed_cases || 0,
  ];
  

  return (
    <div className="w-full flex flex-col items-center">
      <Chart options={chartOptions} series={series} type="donut" width="380" />
      <div className="flex flex-col justify-center gap-2 mt-4">
        {chartOptions.labels.map((label, index) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: chartOptions.colors[index] }}
            ></span>
            {label}: <strong>{series[index]}</strong>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DonutChart;