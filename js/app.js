const kpis = [
  { id: "KPI-01", name: "เวลาตอบสนองหน้าแรก", unit: "IT", target: 1.2, actual: 0.9, measure: "วินาที" },
  { id: "KPI-02", name: "อัตราเข้าสู่ระบบสำเร็จ", unit: "Auth", target: 99, actual: 99.4, measure: "%" },
  { id: "KPI-03", name: "ความถูกต้องของข้อมูล KPI", unit: "Data", target: 98, actual: 96.1, measure: "%" },
  { id: "KPI-04", name: "ความพร้อมใช้งานระบบ", unit: "Ops", target: 99.5, actual: 99.9, measure: "%" },
  { id: "KPI-05", name: "เวลาประมวลผลรายงาน", unit: "BI", target: 3, actual: 4.2, measure: "วินาที" },
  { id: "KPI-06", name: "ข้อผิดพลาดฟอร์ม", unit: "QA", target: 1, actual: 0, measure: "ครั้ง" }
];

const tests = [
  { id: "TC-01", name: "โหลดแดชบอร์ดภายใน 2 วินาที" },
  { id: "TC-02", name: "ค้นหาและกรองรายการ KPI" },
  { id: "TC-03", name: "บันทึกผลจริงผ่านฟอร์ม" },
  { id: "TC-04", name: "แสดงสถานะผ่าน / ใกล้เกณฑ์ / ไม่ผ่าน" },
  { id: "TC-05", name: "ออกจากระบบแล้วกลับสู่หน้าเข้าสู่ระบบ" }
];

const reports = [];

const weeklyTrend = {
  labels: ["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"],
  passRate: [72, 78, 81, 76, 88, 91, 94],
  casesRun: [12, 15, 14, 18, 20, 16, 22]
};

const charts = {
  trend: null,
  status: null,
  compare: null,
  unit: null
};

function statusOf(kpi) {
  const betterWhenLower = kpi.measure === "วินาที" || kpi.measure === "ครั้ง";
  const ratio = betterWhenLower ? kpi.target / Math.max(kpi.actual, 0.0001) : kpi.actual / kpi.target;
  if (ratio >= 1) return "pass";
  if (ratio >= 0.95) return "warn";
  return "fail";
}

function achievementOf(kpi) {
  const betterWhenLower = kpi.measure === "วินาที" || kpi.measure === "ครั้ง";
  const ratio = betterWhenLower
    ? kpi.target / Math.max(kpi.actual, 0.0001)
    : kpi.actual / Math.max(kpi.target, 0.0001);
  return Math.round(Math.min(ratio * 100, 150));
}

function statusLabel(status) {
  return { pass: "ผ่าน", warn: "ใกล้เกณฑ์", fail: "ไม่ผ่าน" }[status];
}

function statusCounts() {
  const counts = { pass: 0, warn: 0, fail: 0 };
  kpis.forEach((kpi) => { counts[statusOf(kpi)] += 1; });
  return counts;
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.remove("hidden");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.add("hidden"), 2200);
}

function chartDefaults() {
  Chart.defaults.color = "#93a0b5";
  Chart.defaults.borderColor = "#2a3548";
  Chart.defaults.font.family = '"IBM Plex Sans Thai", "IBM Plex Sans", sans-serif';
}

function renderStats() {
  const counts = statusCounts();
  document.getElementById("stat-total").textContent = kpis.length;
  document.getElementById("stat-pass").textContent = counts.pass;
  document.getElementById("stat-warn").textContent = counts.warn;
  document.getElementById("stat-fail").textContent = counts.fail;
}

function renderStatusLegend(counts) {
  const items = [
    { key: "pass", color: "#2fbf71", label: "ผ่าน" },
    { key: "warn", color: "#f0b429", label: "ใกล้เกณฑ์" },
    { key: "fail", color: "#ef5d5d", label: "ไม่ผ่าน" }
  ];
  document.getElementById("status-legend").innerHTML = items.map((item) =>
    `<span class="legend-item">
      <span class="legend-dot" style="background:${item.color}"></span>
      ${item.label} (${counts[item.key]})
    </span>`
  ).join("");
}

function ensureCharts() {
  if (typeof Chart === "undefined") {
    showToast("โหลด Chart.js ไม่สำเร็จ");
    return;
  }
  if (charts.trend) {
    Object.values(charts).forEach((chart) => chart && chart.resize());
    updateCharts();
    return;
  }
  createCharts();
}

function destroyCharts() {
  Object.keys(charts).forEach((key) => {
    if (charts[key]) {
      charts[key].destroy();
      charts[key] = null;
    }
  });
}

function createCharts() {
  chartDefaults();
  const counts = statusCounts();

  charts.trend = new Chart(document.getElementById("chart-trend"), {
    type: "line",
    data: {
      labels: weeklyTrend.labels,
      datasets: [
        {
          label: "อัตราผ่าน (%)",
          data: weeklyTrend.passRate,
          borderColor: "#3d8bfd",
          backgroundColor: "rgba(61, 139, 253, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#3d8bfd"
        },
        {
          label: "เคสที่รัน",
          data: weeklyTrend.casesRun,
          borderColor: "#2fbf71",
          backgroundColor: "transparent",
          tension: 0.35,
          pointRadius: 4,
          pointBackgroundColor: "#2fbf71",
          yAxisID: "y1"
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { boxWidth: 12, usePointStyle: true } }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          title: { display: true, text: "%" },
          grid: { color: "rgba(42, 53, 72, 0.7)" }
        },
        y1: {
          position: "right",
          min: 0,
          grid: { drawOnChartArea: false },
          title: { display: true, text: "เคส" }
        },
        x: { grid: { display: false } }
      }
    }
  });

  charts.status = new Chart(document.getElementById("chart-status"), {
    type: "doughnut",
    data: {
      labels: ["ผ่าน", "ใกล้เกณฑ์", "ไม่ผ่าน"],
      datasets: [{
        data: [counts.pass, counts.warn, counts.fail],
        backgroundColor: ["#2fbf71", "#f0b429", "#ef5d5d"],
        borderColor: "#171e2b",
        borderWidth: 3,
        hoverOffset: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "62%",
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${ctx.label}: ${ctx.raw} รายการ`
          }
        }
      }
    }
  });
  renderStatusLegend(counts);

  charts.compare = new Chart(document.getElementById("chart-compare"), {
    type: "bar",
    data: {
      labels: kpis.map((kpi) => kpi.id),
      datasets: [{
        label: "ความสำเร็จ (%)",
        data: kpis.map((kpi) => achievementOf(kpi)),
        backgroundColor: kpis.map((kpi) => {
          const status = statusOf(kpi);
          return status === "pass" ? "rgba(47, 191, 113, 0.85)"
            : status === "warn" ? "rgba(240, 180, 41, 0.85)"
            : "rgba(239, 93, 93, 0.85)";
        }),
        borderRadius: 8,
        maxBarThickness: 42
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => {
              const kpi = kpis[items[0].dataIndex];
              return `${kpi.id} · ${kpi.name}`;
            },
            label: (ctx) => ` ความสำเร็จ ${ctx.raw}% (เป้าหมาย ${kpis[ctx.dataIndex].target} ${kpis[ctx.dataIndex].measure})`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 150,
          ticks: { callback: (value) => `${value}%` },
          grid: { color: "rgba(42, 53, 72, 0.7)" }
        },
        x: { grid: { display: false } }
      }
    }
  });

  charts.unit = new Chart(document.getElementById("chart-unit"), {
    type: "radar",
    data: unitChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        r: {
          min: 0,
          max: 120,
          ticks: { display: false },
          grid: { color: "rgba(42, 53, 72, 0.85)" },
          angleLines: { color: "rgba(42, 53, 72, 0.85)" },
          pointLabels: { color: "#c5d0e2", font: { size: 12 } }
        }
      }
    }
  });
}

function unitChartData() {
  const byUnit = {};
  kpis.forEach((kpi) => {
    if (!byUnit[kpi.unit]) byUnit[kpi.unit] = [];
    byUnit[kpi.unit].push(achievementOf(kpi));
  });
  const labels = Object.keys(byUnit);
  const values = labels.map((unit) => {
    const list = byUnit[unit];
    return Math.round(list.reduce((sum, n) => sum + n, 0) / list.length);
  });
  return {
    labels,
    datasets: [{
      label: "คะแนนเฉลี่ย",
      data: values,
      borderColor: "#3d8bfd",
      backgroundColor: "rgba(61, 139, 253, 0.25)",
      pointBackgroundColor: "#3d8bfd",
      pointBorderColor: "#fff",
      borderWidth: 2
    }]
  };
}

function updateCharts() {
  if (!charts.status) return;

  const counts = statusCounts();
  charts.status.data.datasets[0].data = [counts.pass, counts.warn, counts.fail];
  charts.status.update();
  renderStatusLegend(counts);

  charts.compare.data.labels = kpis.map((kpi) => kpi.id);
  charts.compare.data.datasets[0].data = kpis.map((kpi) => achievementOf(kpi));
  charts.compare.data.datasets[0].backgroundColor = kpis.map((kpi) => {
    const status = statusOf(kpi);
    return status === "pass" ? "rgba(47, 191, 113, 0.85)"
      : status === "warn" ? "rgba(240, 180, 41, 0.85)"
      : "rgba(239, 93, 93, 0.85)";
  });
  charts.compare.update();

  const unitData = unitChartData();
  charts.unit.data.labels = unitData.labels;
  charts.unit.data.datasets[0].data = unitData.datasets[0].data;
  charts.unit.update();
}

function renderDashboard() {
  renderStats();
  updateCharts();
}

function renderKpis() {
  const query = document.getElementById("kpi-search").value.trim().toLowerCase();
  const filter = document.getElementById("kpi-filter").value;
  const rows = kpis.filter((kpi) => {
    const status = statusOf(kpi);
    const text = `${kpi.id} ${kpi.name} ${kpi.unit}`.toLowerCase();
    return (filter === "all" || status === filter) && text.includes(query);
  });

  document.getElementById("kpi-tbody").innerHTML = rows.map((kpi) => {
    const status = statusOf(kpi);
    return `<tr>
      <td>${kpi.id}</td>
      <td>${kpi.name}</td>
      <td>${kpi.unit}</td>
      <td>${kpi.target} ${kpi.measure}</td>
      <td>${kpi.actual} ${kpi.measure}</td>
      <td><span class="badge ${status}">${statusLabel(status)}</span></td>
    </tr>`;
  }).join("") || `<tr><td colspan="6">ไม่พบข้อมูล</td></tr>`;
}

function renderTests() {
  document.getElementById("test-list").innerHTML = tests.map((test) =>
    `<div class="test-item" data-id="${test.id}">
      <span>${test.id} · ${test.name}</span>
      <span class="badge ${test.status || "warn"}">${test.status ? statusLabel(test.status) : "รอรัน"}</span>
    </div>`
  ).join("");
}

function renderForm() {
  document.getElementById("form-kpi").innerHTML = kpis.map((kpi) =>
    `<option value="${kpi.id}">${kpi.id} — ${kpi.name}</option>`
  ).join("");
}

function renderReports() {
  const list = document.getElementById("report-list");
  if (!reports.length) {
    list.innerHTML = "<li>ยังไม่มีรายงาน บันทึกผลหรือรันเคสทดสอบเพื่อสร้างรายการ</li>";
    return;
  }
  list.innerHTML = reports.slice().reverse().map((item) =>
    `<li><span>${item.title}</span><span class="badge ${item.status}">${item.time}</span></li>`
  ).join("");
}

function switchView(view) {
  document.querySelectorAll(".view").forEach((el) => el.classList.add("hidden"));
  document.getElementById(`view-${view}`).classList.remove("hidden");
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });
  const titles = {
    dashboard: ["แดชบอร์ด", "ภาพรวมสถานะระบบทดสอบ"],
    kpis: ["รายการ KPI", "ค้นหา กรอง และตรวจสถานะ"],
    tests: ["เคสทดสอบ", "จำลองการรันเทสต์เคสของระบบ"],
    form: ["ฟอร์มบันทึกผล", "อัปเดตค่าผลจริงของ KPI"],
    reports: ["รายงาน", "ประวัติการทดสอบล่าสุด"]
  };
  document.getElementById("page-title").textContent = titles[view][0];
  document.getElementById("page-subtitle").textContent = titles[view][1];

  if (view === "dashboard") {
    window.requestAnimationFrame(() => ensureCharts());
  }
}

function tickClock() {
  document.getElementById("clock").textContent = new Date().toLocaleString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
}

document.getElementById("login-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  if (user === "tester" && pass === "test1234") {
    document.getElementById("login-screen").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    showToast("เข้าสู่ระบบทดสอบสำเร็จ");
    window.requestAnimationFrame(() => ensureCharts());
  } else {
    showToast("บัญชีทดสอบไม่ถูกต้อง");
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  destroyCharts();
  document.getElementById("app").classList.add("hidden");
  document.getElementById("login-screen").classList.remove("hidden");
  showToast("ออกจากระบบแล้ว");
});

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => switchView(btn.dataset.view));
});

document.getElementById("kpi-search").addEventListener("input", renderKpis);
document.getElementById("kpi-filter").addEventListener("change", renderKpis);

document.getElementById("run-tests-btn").addEventListener("click", () => {
  tests.forEach((test, index) => {
    window.setTimeout(() => {
      test.status = index === 2 ? "warn" : "pass";
      renderTests();
      if (index === tests.length - 1) {
        reports.push({
          title: `รันเคสทดสอบ ${tests.length} รายการ`,
          status: "pass",
          time: new Date().toLocaleTimeString("th-TH")
        });
        const dayIndex = Math.min(weeklyTrend.passRate.length - 1, new Date().getDay() === 0 ? 6 : new Date().getDay() - 1);
        weeklyTrend.casesRun[dayIndex] += tests.length;
        weeklyTrend.passRate[dayIndex] = Math.min(100, weeklyTrend.passRate[dayIndex] + 1);
        if (charts.trend) {
          charts.trend.data.datasets[0].data = weeklyTrend.passRate;
          charts.trend.data.datasets[1].data = weeklyTrend.casesRun;
          charts.trend.update();
        }
        renderReports();
        showToast("รันเคสทดสอบเสร็จแล้ว");
      }
    }, 280 * (index + 1));
  });
});

document.getElementById("result-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const id = document.getElementById("form-kpi").value;
  const actual = Number(document.getElementById("form-actual").value);
  const note = document.getElementById("form-note").value.trim();
  const kpi = kpis.find((item) => item.id === id);
  kpi.actual = actual;
  reports.push({
    title: `อัปเดต ${kpi.id}${note ? ` — ${note}` : ""}`,
    status: statusOf(kpi),
    time: new Date().toLocaleTimeString("th-TH")
  });
  renderDashboard();
  renderKpis();
  renderReports();
  event.target.reset();
  showToast(`บันทึก ${kpi.id} แล้ว`);
});

renderStats();
renderKpis();
renderTests();
renderForm();
renderReports();
tickClock();
window.setInterval(tickClock, 1000);
