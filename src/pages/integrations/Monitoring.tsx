// import node module libraries
import { FC, useState } from "react";
import { Container, Row, Col, Card, Form } from "react-bootstrap";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler } from "chart.js";
import type { ChartData, TooltipItem } from "chart.js";

// import widget/custom components
import { PageHeading } from "widgets";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, ArcElement, RadialLinearScale, Filler);

const Monitoring: FC = () => {
  // Integration Validation Success Rates (based on validation logic)
  const integrationValidationData = {
    labels: ["EventDirect", "EventGTM", "WebPush", "Product", "Offline", "Monitoring"],
    datasets: [
      {
        label: "URL Validation Success (%)",
        data: [98, 95, 92, 89, 94, 100],
        backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 205, 86, 0.8)", "rgba(75, 192, 192, 0.8)", "rgba(153, 102, 255, 0.8)", "rgba(255, 159, 64, 0.8)"],
        borderColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(255, 159, 64)"],
        borderWidth: 2,
      },
      {
        label: "XML/CSV Validation Success (%)",
        data: [100, 100, 100, 87, 91, 100],
        backgroundColor: ["rgba(255, 99, 132, 0.6)", "rgba(54, 162, 235, 0.6)", "rgba(255, 205, 86, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(153, 102, 255, 0.6)", "rgba(255, 159, 64, 0.6)"],
        borderColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(255, 159, 64)"],
        borderWidth: 2,
      },
    ],
  };

  // Product Integration XML Monitoring (24-hour data)
  const productIntegrationData = {
    labels: ["00:00", "01:00", "02:00", "03:00", "04:00", "05:00", "06:00", "07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"],
    datasets: [
      {
        label: "Total XML Items",
        data: [12750, 12890, 12680, 12920, 12560, 12780, 12840, 12980, 12690, 12830, 12950, 12720, 12870, 12910, 12650, 12890, 12730, 12940, 12860, 12790, 12820, 12930, 12770, 12850],
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgb(75, 192, 192)",
        borderWidth: 1,
        yAxisID: "y",
        order: 2,
      },
      {
        label: "Error Count",
        data: [12, 8, 15, 23, 7, 19, 34, 28, 16, 22, 31, 14, 27, 35, 11, 29, 18, 42, 25, 33, 21, 38, 13, 26],
        backgroundColor: "rgba(255, 99, 132, 0.8)",
        borderColor: "rgb(255, 99, 132)",
        borderWidth: 2,
        yAxisID: "y1",
        order: 1,
      },
    ],
  };

  // Event Exception Counts (based on VLEventExceptionName from GTM export)
  const eventExceptionData = {
    labels: ["ProductBasket", "Login", "ProductPurchase", "OnSiteSearch", "ProductFav", "CategoryView", "SignUp", "ProductView"],
    datasets: [
      {
        label: "Exceptions in Last 24h",
        data: [45, 23, 67, 12, 34, 18, 29, 56],
        backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 205, 86, 0.8)", "rgba(75, 192, 192, 0.8)", "rgba(153, 102, 255, 0.8)", "rgba(255, 159, 64, 0.8)", "rgba(199, 199, 199, 0.8)", "rgba(83, 102, 255, 0.8)"],
        borderColor: ["rgb(255, 99, 132)", "rgb(54, 162, 235)", "rgb(255, 205, 86)", "rgb(75, 192, 192)", "rgb(153, 102, 255)", "rgb(255, 159, 64)", "rgb(199, 199, 199)", "rgb(83, 102, 255)"],
        borderWidth: 2,
      },
    ],
  };

  // --- Offline Event Chart ---
  const offlineEventTypes = [
    { id: 7, name: "OrderPlaced" },
    { id: 8, name: "OrderShipped" },
    { id: 9, name: "OrderDelivered" },
    { id: 10, name: "OrderReturned" },
  ];
  const hours = ["00:00", "06:00", "12:00", "18:00"];
  function randomCounts(total: number, n: number) {
    const counts = Array(n).fill(Math.floor(total / n));
    let remainder = total - counts.reduce((a, b) => a + b, 0);
    while (remainder > 0) {
      const idx = Math.floor(Math.random() * n);
      counts[idx]++;
      remainder--;
    }
    return counts;
  }
  function randomErrors(n: number) {
    return Array.from({ length: n }, () => Math.floor(Math.random() * 50) + 10); // 10-60 errors per 6-hour period
  }
  const offlineEventDataRaw = offlineEventTypes.map((event) => {
    const total = Math.floor(Math.random() * (7000 - 4500 + 1)) + 4500;
    return {
      ...event,
      data: randomCounts(total, 24),
      errors: randomErrors(24),
    };
  });
  const [visibleOfflineEvents, setVisibleOfflineEvents] = useState(offlineEventTypes.map((e) => e.id));
  const [showOfflineErrors, setShowOfflineErrors] = useState(true);
  const handleOfflineCheckboxChange = (id: number) => {
    setVisibleOfflineEvents((prev) => (prev.includes(id) ? prev.filter((eid) => eid !== id) : [...prev, id]));
  };
  const offlineChartData: ChartData<"bar"> = {
    labels: hours,
    datasets: offlineEventDataRaw
      .filter((e) => visibleOfflineEvents.includes(e.id))
      .flatMap((e, idx) => {
        const colors = ["#36a2eb", "#ff6384", "#4bc0c0", "#ff9f40"];
        const color = colors[idx % 4];
        const datasets = [
          {
            label: `${e.name} (ID ${e.id})`,
            data: e.data as number[],
            borderColor: color,
            backgroundColor: color,
            yAxisID: "y",
            type: "bar" as const,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            order: 2,
          },
        ];

        if (showOfflineErrors) {
          datasets.push({
            label: `${e.name} Errors (ID ${e.id})`,
            data: e.errors as number[],
            borderColor: color,
            backgroundColor: color + "80", // 50% opacity
            borderWidth: 2,
            yAxisID: "y",
            type: "bar" as const,
            barPercentage: 0.6,
            categoryPercentage: 0.7,
            order: 1,
          });
        }

        return datasets;
      }),
  };
  const offlineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      title: { display: true, text: "Offline Event Activity (Last 24h)" },
      tooltip: {
        callbacks: {
          label: function (context: TooltipItem<"bar">) {
            return `${context.dataset.label}: ${context.parsed.y}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Event Count / Error Count" },
      },
      x: {
        title: { display: true, text: "Hour" },
      },
    },
  };

  // Chart options
  const barChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Integration Validation Success Rates",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
      },
    },
  };

  const eventExceptionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Event Exceptions in Last 24 Hours",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Number of Exceptions",
        },
      },
      x: {
        title: {
          display: true,
          text: "Event Types",
        },
      },
    },
  };

  const productIntegrationChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Product Integration XML Monitoring (24h)",
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Time (24h)",
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
        title: {
          display: true,
          text: "Total XML Items",
        },
        min: 12500,
        max: 13000,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        title: {
          display: true,
          text: "Error Count",
        },
        min: 0,
        max: 50,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <Container fluid className='p-6'>
      <PageHeading heading='System Monitoring' />

      {/* Integration Validation Charts */}
      <Row className='mb-4'>
        <Col>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Integration Validation Success Rates</h4>
            </Card.Header>
            <Card.Body>
              <div id='integration-validation-chart' className='chart-container integration-validation-chart' style={{ height: "350px" }}>
                <Bar data={integrationValidationData} options={barChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Event Exception Monitoring */}
      <Row className='mb-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>HealthCheck Monitoring</h4>
            </Card.Header>
            <Card.Body>
              <div id='event-exception-chart' className='chart-container event-exception-chart' style={{ height: "400px" }}>
                <Bar data={eventExceptionData} options={eventExceptionChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Product Integration XML Monitoring */}
      <Row className='mb-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Product Integration XML Monitoring</h4>
            </Card.Header>
            <Card.Body>
              <div id='product-integration-chart' className='chart-container product-integration-chart' style={{ height: "400px" }}>
                <Bar data={productIntegrationData} options={productIntegrationChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Offline Event Activity Chart */}
      <Row className='mb-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Offline Event Activity (Last 24h)</h4>
            </Card.Header>
            <Card.Body>
              <div className='mb-3'>
                {offlineEventTypes.map((event) => (
                  <Form.Check inline key={event.id} type='checkbox' id={`offline-event-${event.id}`} label={`${event.name} (ID ${event.id})`} checked={visibleOfflineEvents.includes(event.id)} onChange={() => handleOfflineCheckboxChange(event.id)} />
                ))}
                <Form.Check inline type='checkbox' id='offline-errors-toggle' label='Show Errors' checked={showOfflineErrors} onChange={() => setShowOfflineErrors((v) => !v)} className='ms-3' />
              </div>
              <div style={{ height: "350px" }}>
                <Bar data={offlineChartData} options={offlineChartOptions} />
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Server-side Integration Status */}
      <Row className='mb-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>Server-side Integration Status</h4>
            </Card.Header>
            <Card.Body>
              <Row className='g-2'>
                {(() => {
                  const events = ["Login", "CartView", "Purchase", "SearchView", "PageView", "AddFav", "ProductView", "SignUp", "CategoryView", "RemoveFav"];
                  const failedIndex = Math.floor(Math.random() * events.length);
                  return events.map((event, idx) => (
                    <Col xl={2} lg={3} md={4} sm={6} xs={12} key={event}>
                      <div className='d-flex align-items-center justify-content-center' style={{ height: "60px" }}>
                        <div className={`w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded ${idx === failedIndex ? "bg-danger bg-opacity-75" : "bg-success bg-opacity-75"}`} style={{ color: "#fff", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem" }}>
                          <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem", lineHeight: 1 }}>{event}</div>
                          {idx === failedIndex ? (
                            <span className='badge bg-light text-danger fw-bold' style={{ fontSize: "0.8rem", padding: "0.25em 0.75em" }}>
                              Last test request failed
                            </span>
                          ) : (
                            <span className='badge bg-light text-success fw-bold' style={{ fontSize: "0.8rem", padding: "0.25em 0.75em" }}>
                              Last test request was successful
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  ));
                })()}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* WebPush Integration Status */}
      <Row className='mb-4'>
        <Col lg={12} md={12} sm={12}>
          <Card>
            <Card.Header>
              <h4 className='mb-0'>WebPush Integration Status</h4>
            </Card.Header>
            <Card.Body>
              <Row className='g-2'>
                {(() => {
                  const checks = ["Service Worker File", "WebPush Script", "Manifest File"];
                  const failedIndex = Math.floor(Math.random() * checks.length);
                  return checks.map((label, idx) => (
                    <Col md={4} sm={6} xs={12} key={label}>
                      <div className='d-flex align-items-center justify-content-center' style={{ height: "60px" }}>
                        <div className={`w-100 h-100 d-flex flex-column align-items-center justify-content-center rounded ${idx === failedIndex ? "bg-danger bg-opacity-75" : "bg-success bg-opacity-75"}`} style={{ color: "#fff", fontWeight: 500, fontSize: "0.95rem", padding: "0.5rem" }}>
                          <div style={{ fontSize: "0.95rem", marginBottom: "0.25rem", lineHeight: 1 }}>{label}</div>
                          {idx === failedIndex ? (
                            <span className='badge bg-light text-danger fw-bold' style={{ fontSize: "0.8rem", padding: "0.25em 0.75em" }}>
                              Last test request failed
                            </span>
                          ) : (
                            <span className='badge bg-light text-success fw-bold' style={{ fontSize: "0.8rem", padding: "0.25em 0.75em" }}>
                              Last test request was successful
                            </span>
                          )}
                        </div>
                      </div>
                    </Col>
                  ));
                })()}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Monitoring;
