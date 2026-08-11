const PptxGenJS = require("pptxgenjs");
const fs = require("fs");
const path = require("path");
const prisma = require("../lib/prisma");
const ApiError = require("../utils/api-error");

const generatePresentation = async () => {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: {
      dailyCompletions: { select: { status: true, language: true, completedAt: true } },
      registrations: { select: { eventType: true, eventId: true, registeredAt: true } },
      impositions: true,
    },
  });

  if (!students || students.length === 0) {
    throw new ApiError(404, "No students found to generate report");
  }

  const tasks = await prisma.task.findMany({
    orderBy: { createdAt: "desc" },
    include: { completions: true },
  });

  const studentStats = students.map((s) => {
    const completed = s.dailyCompletions.filter((c) => c.status === "COMPLETED").length;
    const notCompleted = s.dailyCompletions.filter((c) => c.status === "NOT_COMPLETED").length;
    return {
      name: s.username || s.email.split("@")[0],
      year: s.year || "Unknown",
      leetcode: completed,
      hackathons: s.registrations.filter((r) => r.eventType === "HACKATHON").length,
      internships: s.registrations.filter((r) => r.eventType === "INTERNSHIP").length,
      courses: s.registrations.filter((r) => r.eventType === "COURSE").length,
      impositions: s.impositions.length,
      completed,
      notCompleted,
    };
  });

  const totalCompletions = studentStats.reduce((sum, s) => sum + s.leetcode, 0);
  const totalRegistrations = studentStats.reduce((sum, s) => sum + s.hackathons + s.internships + s.courses, 0);
  const totalImpositions = studentStats.reduce((sum, s) => sum + s.impositions, 0);
  const topPerformers = [...studentStats].sort((a, b) => b.leetcode - a.leetcode).slice(0, 5);

  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "CSE(AIML) Monitoring System";
  pptx.title = "Student Report";

  const PRIMARY = "2563EB";
  const SECONDARY = "7C3AED";
  const DARK = "0F172A";

  // Slide 1: Cover
  let slide = pptx.addSlide();
  slide.background = { color: DARK };

  slide.addShape(pptx.ShapeType.roundRect, {
    x: 5.9, y: 0.4, w: 1.5, h: 1.5,
    fill: { color: PRIMARY },
    rectRadius: 0.2,
  });
  slide.addText("VSB", {
    x: 5.9, y: 0.7, w: 1.5, h: 0.9,
    align: "center", fontSize: 36, bold: true, color: "FFFFFF",
  });

  slide.addText("Student Monitoring System", {
    x: 1, y: 2.2, w: 11.3, h: 1,
    align: "center", fontSize: 40, bold: true, color: "FFFFFF",
  });
  slide.addText("CSE (AIML) Department", {
    x: 1, y: 3.2, w: 11.3, h: 0.7,
    align: "center", fontSize: 20, color: "CBD5E1",
  });
  slide.addText("VSB College of Engineering", {
    x: 1, y: 4.0, w: 11.3, h: 0.7,
    align: "center", fontSize: 24, bold: true, color: "FBBF24",
  });
  slide.addText("An Autonomous Institution | Accredited by NBA & NAAC", {
    x: 1, y: 4.8, w: 11.3, h: 0.5,
    align: "center", fontSize: 14, color: "94A3B8",
  });
  slide.addText(`Report Generated: ${new Date().toLocaleString()}`, {
    x: 1, y: 6.5, w: 11.3, h: 0.5,
    align: "center", fontSize: 12, color: "64748B",
  });

  // Slide 2: Overview
  slide = pptx.addSlide();
  slide.background = { color: DARK };
  slide.addText("Overview", { x: 0.5, y: 0.3, w: 8, h: 0.7, fontSize: 28, bold: true, color: "FFFFFF" });

  const stats = [
    { label: "Total Students", value: studentStats.length, color: PRIMARY },
    { label: "LeetCode Completions", value: totalCompletions, color: "10B981" },
    { label: "Total Registrations", value: totalRegistrations, color: SECONDARY },
    { label: "Impositions", value: totalImpositions, color: "EF4444" },
  ];

  let xPos = 0.5;
  stats.forEach((stat) => {
    slide.addShape(pptx.ShapeType.roundRect, {
      x: xPos, y: 1.5, w: 2.8, h: 2.5,
      fill: { color: "1E293B" },
      rectRadius: 0.1,
    });
    slide.addText(stat.value, {
      x: xPos, y: 1.8, w: 2.8, h: 1,
      fontSize: 40, bold: true, color: stat.color, align: "center",
    });
    slide.addText(stat.label, {
      x: xPos, y: 3.0, w: 2.8, h: 0.6,
      fontSize: 14, color: "CBD5E1", align: "center",
    });
    xPos += 3.1;
  });

  // Slide 3: Manual Bar Chart – LeetCode Completions
  slide = pptx.addSlide();
  slide.background = { color: DARK };
  slide.addText("LeetCode Completions by Student", {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: "FFFFFF",
  });

  const topStudents = studentStats.slice(0, 10);
  const maxCompleted = Math.max(...topStudents.map((s) => s.leetcode), 1);
  const chartWidth = 10.5;
  const chartHeight = 4.5;
  const chartX = 0.8;
  const chartY = 1.5;
  const barSpacing = chartWidth / Math.max(topStudents.length, 1);
  const barMaxHeight = chartHeight - 1.0;

  topStudents.forEach((s, i) => {
    const barHeight = Math.max((s.leetcode / maxCompleted) * barMaxHeight, 0.2);
    const barX = chartX + i * barSpacing + 0.1;
    const barY = chartY + (barMaxHeight - barHeight);

    slide.addShape(pptx.ShapeType.rect, {
      x: barX,
      y: barY,
      w: barSpacing - 0.2,
      h: barHeight,
      fill: { color: "10B981" },
    });

    slide.addText(s.leetcode.toString(), {
      x: barX,
      y: barY - 0.35,
      w: barSpacing - 0.2,
      h: 0.3,
      align: "center", fontSize: 10, bold: true, color: "FFFFFF",
    });

    slide.addText(s.name, {
      x: barX,
      y: chartY + barMaxHeight + 0.1,
      w: barSpacing - 0.2,
      h: 0.4,
      align: "center", fontSize: 8, color: "CBD5E1",
    });
  });

  // Slide 4: Table – Event Registrations
  slide = pptx.addSlide();
  slide.background = { color: DARK };
  slide.addText("Event Registrations", {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: "FFFFFF",
  });

  const regRows = [["Student", "Hackathons", "Internships", "Courses"]];
  studentStats.forEach((s) => {
    regRows.push([s.name, s.hackathons.toString(), s.internships.toString(), s.courses.toString()]);
  });

  slide.addTable(regRows, {
    x: 0.5, y: 1.2, w: 12, h: 5,
    border: { pt: 1, color: "334155" },
    fill: { color: "1E293B" },
    headerRow: { fill: { color: PRIMARY }, bold: true, color: "FFFFFF" },
    fontSize: 12,
    color: "E2E8F0",
  });

  // Slide 5: Task Completion Report
  slide = pptx.addSlide();
  slide.background = { color: DARK };
  slide.addText("Task Completion Report", {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: "FFFFFF",
  });

  const taskRows = [["Task", "Completions"]];
  tasks.forEach((t) => {
    taskRows.push([t.title, (t.completions?.length || 0).toString()]);
  });

  if (taskRows.length > 1) {
    slide.addTable(taskRows, {
      x: 0.5, y: 1.2, w: 8, h: 5,
      border: { pt: 1, color: "334155" },
      fill: { color: "1E293B" },
      headerRow: { fill: { color: SECONDARY }, bold: true, color: "FFFFFF" },
      fontSize: 12,
      color: "E2E8F0",
    });
  } else {
    slide.addText("No tasks available", {
      x: 1, y: 3, w: 10, h: 1,
      fontSize: 16, color: "94A3B8",
    });
  }

  // Slide 6: Top Performers
  slide = pptx.addSlide();
  slide.background = { color: DARK };
  slide.addText("Top Performers (LeetCode)", {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: "FFFFFF",
  });

  const topRows = [["Rank", "Student", "Year", "Solved"]];
  topPerformers.forEach((s, i) => {
    topRows.push([(i + 1).toString(), s.name, s.year, s.leetcode.toString()]);
  });

  slide.addTable(topRows, {
    x: 1, y: 1.2, w: 10, h: 4,
    border: { pt: 1, color: "334155" },
    fill: { color: "1E293B" },
    headerRow: { fill: { color: "10B981" }, bold: true, color: "FFFFFF" },
    fontSize: 14,
    color: "E2E8F0",
  });

  // Write to temp file, read buffer, then always delete
  const tempFile = path.join(__dirname, `temp-report-${Date.now()}.pptx`);
  await pptx.writeFile({ fileName: tempFile });

  let buffer;
  try {
    buffer = fs.readFileSync(tempFile);
  } finally {
    // Always clean up – even if readFileSync throws
    if (fs.existsSync(tempFile)) fs.unlinkSync(tempFile);
  }

  if (!buffer || buffer.length < 100 || buffer.toString("ascii", 0, 2) !== "PK") {
    throw new Error("Generated PPTX is not a valid file");
  }

  return buffer;
};

module.exports = { generatePresentation };