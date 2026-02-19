import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
// @ts-ignore
import { jsPDF } from "jspdf";
// @ts-ignore
import autoTable from "jspdf-autotable";
import { formatDate } from "@/lib/utils/date.utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const location = searchParams.get("location");
    const actualLocation = location === "all" ? null : location;
    const type = searchParams.get("type") || "today"; // 'today' or 'full'

    // Fetch data
    let schedule;
    let titleSuffix = "";

    if (type === "today") {
      const today = formatDate(new Date(), 'iso');
      const where: any = { date: today };
      if (actualLocation) {
        where.location = actualLocation;
      }
      schedule = await prisma.timeEntry.findMany({
        where,
        orderBy: { date: "asc" },
      });
      titleSuffix = `- ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`;
    } else {
      const where: any = {};
      if (actualLocation) {
        where.location = actualLocation;
      }
      schedule = await prisma.timeEntry.findMany({
        where,
        orderBy: { date: "asc" },
      });
      titleSuffix = `- Full Schedule`;
    }

    if (schedule.length === 0) {
      return new Response("No schedule found", { status: 404 });
    }

    // Generate PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Title
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("🌙 Ramadan Clock", pageWidth / 2, 15, { align: "center" });

    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`Sehri & Iftar Schedule ${titleSuffix}`, pageWidth / 2, 25, { align: "center" });

    // Location
    if (actualLocation) {
      doc.setFontSize(12);
      doc.text(`Location: ${actualLocation}`, pageWidth / 2, 35, { align: "center" });
    }

    // Prepare table data
    const tableData = schedule.map((entry: any) => [
      new Date(entry.date).toLocaleDateString("en-US", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      entry.sehri,
      entry.iftar,
      entry.location || "-",
    ]);

    // Generate table
    autoTable(doc, {
      head: [["Date", "Sehri", "Iftar", "Location"]],
      body: tableData,
      startY: actualLocation ? 42 : 35,
      theme: "striped",
      headStyles: { fillColor: [59, 130, 246] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { top: actualLocation ? 42 : 35 },
      didDrawPage: (data: any) => {
        // Footer
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.text(
          `Generated on ${new Date().toLocaleString()}`,
          pageWidth / 2,
          data.settings.margin!.top! + (data.pageNumber * 280) - 10,
          { align: "center" }
        );
        doc.text(
          `Page ${data.pageNumber}`,
          pageWidth - 15,
          data.settings.margin!.top! + (data.pageNumber * 280) - 10,
          { align: "right" }
        );
      },
    });

    // Generate filename
    const locationPart = actualLocation ? `-${actualLocation.toLowerCase().replace(/\s+/g, "-")}` : "";
    const year = new Date().getFullYear();
    const filename = `sehri-iftar${locationPart}-${year}.pdf`;

    // Return PDF as response
    const pdfBuffer = doc.output("arraybuffer");
    return new Response(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response("Failed to generate PDF", { status: 500 });
  }
}
