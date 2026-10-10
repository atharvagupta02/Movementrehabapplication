// import { useState, useEffect, useCallback } from "react";
// import { PDFDownloadLink } from "@react-pdf/renderer";
// import RentReportPdf from "../Component/pdf/RentReportPdf.jsx";
// import { MdEdit, MdClose } from "react-icons/md";
// import { exportToExcel } from "../utils/exportToExcel";
// import { fetchReport, MONTHS, YEARS, formatINR } from "../utils/reportFetch";
// import {
//   ReportPage,
//   Card,
//   ReportToolbar,
//   Tile,
//   TallyLine,
//   Loading,
//   ErrorState,
//   EmptyState,
//   EXCEL_BTN,
//   PDF_BTN,
//   PRIMARY_BTN,
// } from "./reports/ReportUI";

// const Rent = () => {
//   const [propertyName, setPropertyName] = useState("");
//   const [month, setMonth] = useState("");
//   const [amount, setAmount] = useState(0);
//   const [dueDate, setDueDate] = useState("");
//   const [status, setStatus] = useState("Unpaid");
//   const [notes, setNotes] = useState("");
//   const [selectedMonth, setSelectedMonth] = useState("");
//   const [selectedYear, setSelectedYear] = useState("");
//   const [selectedStatus, setSelectedStatus] = useState("");

//   const [rentData, setRentData] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const [editId, setEditId] = useState(null);
//   const [updateStatus, setUpdateStatus] = useState(null);

//   // Data is already filtered server-side by the selected period (dueDate based).
//   const fetchRentData = useCallback(async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const data = await fetchReport("rent", {
//         month: selectedMonth,
//         year: selectedYear,
//       });
//       setRentData(data);
//     } catch (err) {
//       console.error("Error fetching rent data:", err);
//       setError("Failed to load rent data. Please try again.");
//       setRentData([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [selectedMonth, selectedYear]);

//   useEffect(() => {
//     fetchRentData();
//   }, [fetchRentData]);

//   // Only status filtering remains client-side; period filtering is server-side.
//   const displayedData = selectedStatus
//     ? rentData.filter((item) => item.status === selectedStatus)
//     : rentData;

//   const totalAmount = displayedData.reduce(
//     (sum, item) => sum + Number(item.amount || 0),
//     0,
//   );
//   const paidTotal = displayedData
//     .filter((item) => item.status === "Paid")
//     .reduce((sum, item) => sum + Number(item.amount || 0), 0);
//   const unpaidTotal = displayedData
//     .filter((item) => item.status === "Unpaid")
//     .reduce((sum, item) => sum + Number(item.amount || 0), 0);
//   const pendingTotal = displayedData
//     .filter((item) => item.status === "Pending")
//     .reduce((sum, item) => sum + Number(item.amount || 0), 0);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     const formData = { propertyName, month, amount, dueDate, status, notes };
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/rent`,
//         {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(formData),
//         },
//       );
//       const result = await response.json();
//       alert(result.message);
//       fetchRentData();
//       setPropertyName("");
//       setMonth("");
//       setAmount(0);
//       setDueDate("");
//       setStatus("Unpaid");
//       setNotes("");
//     } catch (error) {
//       console.error("Error:", error);
//     }
//   };

//   const handleStatusUpdate = async (id, newStatus) => {
//     console.log(id, newStatus);
//     try {
//       const response = await fetch(
//         `${import.meta.env.VITE_BACKEND_URL}/api/report/rent/${id}`,
//         {
//           method: "PUT",
//           headers: {
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({ status: newStatus }),
//         },
//       );

//       const result = await response.json();

//       console.log("result", result);

//       if (result.success) {
//         fetchRentData(); // refresh
//         setEditId(null);
//         setUpdateStatus(null);
//       } else {
//         alert(result.message);
//         setEditId(null);
//         setUpdateStatus(null);
//       }
//     } catch (error) {
//       console.error("Update failed", error);
//     }
//   };

//   // Derived from the already-filtered data using the real dueDate field
//   // (not the free-text `month` string).
//   const monthWiseSummary = displayedData.reduce((acc, item) => {
//     const date = new Date(item.dueDate);
//     const monthYear = isNaN(date.getTime())
//       ? "Unknown"
//       : date.toLocaleString("default", { month: "short", year: "numeric" });

//     if (!acc[monthYear]) {
//       acc[monthYear] = { Paid: 0, Unpaid: 0, Pending: 0, Total: 0 };
//     }

//     const value = Number(item.amount || 0);
//     if (acc[monthYear][item.status] !== undefined) {
//       acc[monthYear][item.status] += value;
//     }
//     acc[monthYear].Total += value;

//     return acc;
//   }, {});

//   const downloadRentExcel = () => {
//     const rows = displayedData.map((item) => ({
//       Property: item.propertyName,
//       Month: item.month,
//       "Due Date": new Date(item.dueDate).toLocaleDateString("en-IN"),
//       Status: item.status,
//       Amount: Number(item.amount || 0),
//       Notes: item.notes || "-",
//     }));

//     exportToExcel({
//       data: rows,
//       fileName: `Rent_Report_${selectedMonth || "All"}_${selectedYear || "All_Years"}`,
//       sheetName: "Rent",
//     });
//   };

//   const rentPdfDocument = (
//     <RentReportPdf
//       rents={displayedData}
//       selectedMonth={selectedMonth}
//       selectedYear={selectedYear}
//       selectedStatus={selectedStatus}
//       totals={{
//         total: totalAmount,
//         paid: paidTotal,
//         unpaid: unpaidTotal,
//         pending: pendingTotal,
//       }}
//     />
//   );

//   const pdfFileName = `Rent_Report_${selectedMonth || "All"}_${
//     selectedYear || "Years"
//   }.pdf`;

//   // Plain-language label of the active period for the toolbar.
//   const monthName = selectedMonth
//     ? MONTHS.find((m) => String(m.value) === String(selectedMonth))?.label
//     : "";
//   const periodLabel = selectedMonth
//     ? selectedYear
//       ? `${monthName} ${selectedYear}`
//       : `${monthName} (all years)`
//     : selectedYear
//       ? `Year ${selectedYear}`
//       : "All time";

//   return (
//     <ReportPage>
//       {/* Toolbar: title + period + filters + exports */}
//       <ReportToolbar title="Rent" periodLabel={periodLabel}>
//         <select
//           value={selectedMonth}
//           onChange={(e) => setSelectedMonth(e.target.value)}
//           className="input w-full sm:w-auto"
//         >
//           <option value="">All Months</option>
//           {MONTHS.map((m) => (
//             <option key={m.value} value={m.value}>
//               {m.label}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedYear}
//           onChange={(e) => setSelectedYear(e.target.value)}
//           className="input w-full sm:w-auto"
//         >
//           <option value="">All Years</option>
//           {YEARS.map((year) => (
//             <option key={year} value={year}>
//               {year}
//             </option>
//           ))}
//         </select>

//         <select
//           value={selectedStatus}
//           onChange={(e) => setSelectedStatus(e.target.value)}
//           className="input w-full sm:w-auto"
//         >
//           <option value="">All Status</option>
//           <option value="Paid">Paid</option>
//           <option value="Unpaid">Unpaid</option>
//           <option value="Pending">Pending</option>
//         </select>

//         <button onClick={downloadRentExcel} className={EXCEL_BTN}>
//           Download Excel
//         </button>

//         <PDFDownloadLink document={rentPdfDocument} fileName={pdfFileName}>
//           {({ loading: pdfLoading }) => (
//             <button className={PDF_BTN} disabled={pdfLoading}>
//               {pdfLoading ? "Preparing PDF..." : "Download PDF"}
//             </button>
//           )}
//         </PDFDownloadLink>
//       </ReportToolbar>

//       {/* Summary tiles */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
//         <Tile emoji="🏠" label="Total Rent" value={totalAmount} tone="gray" />
//         <Tile emoji="✅" label="Paid" value={paidTotal} tone="emerald" />
//         <Tile emoji="❌" label="Unpaid" value={unpaidTotal} tone="rose" />
//         <Tile emoji="⌛" label="Pending" value={pendingTotal} tone="amber" />
//       </div>

//       <TallyLine
//         text={`Paid ₹${formatINR(paidTotal)} + Unpaid ₹${formatINR(
//           unpaidTotal,
//         )} + Pending ₹${formatINR(pendingTotal)} = Total ₹${formatINR(
//           totalAmount,
//         )}`}
//       />

//       {/* Form Card */}
//       <Card>
//         <h2 className="text-lg font-semibold mb-4 text-gray-700">
//           Record Rent Payment
//         </h2>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <input
//               type="text"
//               placeholder="Property Name"
//               value={propertyName}
//               onChange={(e) => setPropertyName(e.target.value)}
//               className="input"
//             />

//             <input
//               type="month"
//               value={month}
//               onChange={(e) => setMonth(e.target.value)}
//               className="input"
//             />

//             <input
//               type="number"
//               placeholder="Amount"
//               min={0}
//               value={amount}
//               onChange={(e) => setAmount(Number(e.target.value))}
//               className="input"
//             />

//             <input
//               type="date"
//               value={dueDate}
//               onChange={(e) => setDueDate(e.target.value)}
//               className="input"
//             />

//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value)}
//               className="input md:col-span-2"
//             >
//               <option value="Paid">Paid</option>
//               <option value="Unpaid">Unpaid</option>
//               <option value="Pending">Pending</option>
//             </select>

//             <textarea
//               placeholder="Notes (optional)"
//               value={notes}
//               onChange={(e) => setNotes(e.target.value)}
//               className="input md:col-span-2"
//             />
//           </div>

//         <div className="flex justify-end mt-4">
//           <button onClick={handleSubmit} className={PRIMARY_BTN}>
//             Save Rent
//           </button>
//         </div>
//       </Card>

//       {/* Month-wise Summary */}
//       <Card>
//         <h2 className="text-lg font-semibold text-gray-700 mb-3">
//           Month-wise Summary
//         </h2>

//         {Object.keys(monthWiseSummary).length === 0 ? (
//           <p className="text-gray-500">No data available</p>
//         ) : (
//           <div className="space-y-2">
//             {Object.entries(monthWiseSummary).map(([label, data]) => (
//               <div
//                 key={label}
//                 className="flex flex-wrap justify-between border-b pb-2"
//               >
//                 <span className="font-medium text-gray-800">{label}</span>

//                 <div className="flex gap-4 text-sm">
//                   <span className="text-emerald-600">
//                     Paid: ₹{formatINR(data.Paid)}
//                   </span>
//                   <span className="text-rose-600">
//                     Unpaid: ₹{formatINR(data.Unpaid)}
//                   </span>
//                   <span className="text-amber-600">
//                     Pending: ₹{formatINR(data.Pending)}
//                   </span>
//                   <span className="font-semibold text-gray-800">
//                     Total: ₹{formatINR(data.Total)}
//                   </span>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )}
//       </Card>

//       {/* Rent Cards */}
//       {loading ? (
//         <Loading />
//       ) : error ? (
//         <ErrorState message={error} />
//       ) : displayedData.length === 0 ? (
//         <EmptyState label="No rent records for this period." />
//       ) : (
//         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//           {displayedData.map((item) => (
//             <Card key={item._id} className="space-y-1">
//               <div className="flex items-center justify-between">
//                 <h3 className="font-semibold text-indigo-600">
//                   {item.propertyName}
//                 </h3>
//                 <button
//                   onClick={() => {
//                     setEditId(editId === item._id ? null : item._id);
//                     setUpdateStatus(item?.status);
//                   }}
//                   className="p-1 rounded hover:bg-gray-100"
//                 >
//                   {editId === item._id ? (
//                     <MdClose size={18} className="text-red-500" />
//                   ) : (
//                     <MdEdit size={18} className="text-blue-500" />
//                   )}
//                 </button>
//               </div>

//               <p className="text-sm text-gray-600">Month: {item.month}</p>

//               <p className="text-sm text-gray-600">
//                 Due: {new Date(item.dueDate).toLocaleDateString()}
//               </p>
//               {editId === item._id ? (
//                 <div className="text-sm">
//                   Status:
//                   <select
//                     value={updateStatus}
//                     onChange={(e) => setUpdateStatus(e.target.value)}
//                     className="ml-2 border px-2 py-1 rounded"
//                   >
//                     <option value="Paid">Paid</option>
//                     <option value="Unpaid">Unpaid</option>
//                     <option value="Pending">Pending</option>
//                   </select>
//                   <button
//                     disabled={updateStatus === item.status}
//                     onClick={() => handleStatusUpdate(item._id, updateStatus)}
//                     className={`px-2 py-1 rounded text-xs ml-2 ${
//                       updateStatus === item.status
//                         ? "bg-gray-300 cursor-not-allowed"
//                         : "bg-green-600 text-white"
//                     }`}
//                   >
//                     OK
//                   </button>
//                 </div>
//               ) : (
//                 <p className="text-sm">
//                   Status:{" "}
//                   <span
//                     className={`font-semibold ${
//                       item.status === "Paid"
//                         ? "text-emerald-600"
//                         : item.status === "Pending"
//                           ? "text-amber-600"
//                           : "text-rose-600"
//                     }`}
//                   >
//                     {item.status}
//                   </span>
//                 </p>
//               )}

//               {item.notes && (
//                 <p className="text-sm text-gray-500">Notes: {item.notes}</p>
//               )}

//               <div className="text-right font-bold text-gray-800 pt-2">
//                 ₹{formatINR(item.amount)}
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </ReportPage>
//   );
// };

// export default Rent;




import { useState, useEffect, useCallback } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import RentReportPdf from "../Component/pdf/RentReportPdf.jsx";
import {
  MdEdit,
  MdClose,
  MdCheck,
  MdFileDownload,
  MdWarningAmber,
  MdCheckCircle,
  MdErrorOutline,
} from "react-icons/md";
import { exportToExcel } from "../utils/exportToExcel";
import { fetchReport, MONTHS, YEARS, formatINR } from "../utils/reportFetch";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* Palette: deep teal ink (hero), slate neutrals, and three status     */
/* colours that mean the same thing everywhere on the page.            */
/* ------------------------------------------------------------------ */
const FIELD =
  "w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 shadow-sm transition focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10";
const SELECT = `${FIELD} sm:w-auto sm:min-w-[9.5rem]`;
const BTN_PRIMARY =
  "inline-flex w-full items-center justify-center rounded-lg bg-blue-800 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-900 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/30";
const BTN_OUTLINE =
  "inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20";

const STATUS = {
  Paid: {
    dot: "bg-emerald-500",
    pill: "bg-emerald-50 text-emerald-800 ring-emerald-600/15",
    bar: "bg-emerald-400",
    text: "text-emerald-700",
  },
  Unpaid: {
    dot: "bg-rose-500",
    pill: "bg-rose-50 text-rose-800 ring-rose-600/15",
    bar: "bg-rose-400",
    text: "text-rose-700",
  },
  Pending: {
    dot: "bg-amber-500",
    pill: "bg-amber-50 text-amber-800 ring-amber-600/20",
    bar: "bg-amber-300",
    text: "text-amber-700",
  },
};

const STATUS_KEYS = ["Paid", "Unpaid", "Pending"];

const formatMonth = (value) => {
  // The form saves "YYYY-MM"; show it as "Mar 2026". Anything else is shown as-is.
  if (/^\d{4}-\d{2}$/.test(value || "")) {
    const [y, m] = value.split("-");
    return new Date(Number(y), Number(m) - 1, 1).toLocaleString("en-IN", {
      month: "short",
      year: "numeric",
    });
  }
  return value || "-";
};

/* ------------------------------------------------------------------ */
/* Small presentational pieces                                         */
/* ------------------------------------------------------------------ */
const Panel = ({ title, description, children, className = "" }) => (
  <section
    className={`rounded-xl border border-slate-200/80 bg-white shadow-sm ${className}`}
  >
    {title && (
      <header className="border-b border-slate-100 px-6 py-4">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          {title}
        </h2>
        {description && (
          <p className="mt-0.5 text-sm text-slate-500">{description}</p>
        )}
      </header>
    )}
    {children}
  </section>
);

const StatusPill = ({ status }) => {
  const s = STATUS[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
        s ? s.pill : "bg-slate-50 text-slate-700 ring-slate-500/20"
      }`}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${s ? s.dot : "bg-slate-400"}`}
      />
      {status}
    </span>
  );
};

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="mb-1.5 block text-sm font-medium text-slate-700"
  >
    {children}
  </label>
);

const SkeletonRows = ({ rows = 4, cols = 6 }) =>
  Array.from({ length: rows }).map((_, r) => (
    <tr key={r}>
      {Array.from({ length: cols }).map((__, c) => (
        <td key={c} className="px-6 py-4">
          <div className="h-3.5 w-full max-w-[7rem] animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
        </td>
      ))}
    </tr>
  ));

const TableMessage = ({ colSpan, children, tone = "text-slate-500" }) => (
  <tr>
    <td colSpan={colSpan} className={`px-6 py-14 text-center text-sm ${tone}`}>
      {children}
    </td>
  </tr>
);

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */
const Rent = () => {
  const [propertyName, setPropertyName] = useState("");
  const [month, setMonth] = useState("");
  const [amount, setAmount] = useState(0);
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [notes, setNotes] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  const [rentData, setRentData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState(null);
  const [updateStatus, setUpdateStatus] = useState(null);

  const [toast, setToast] = useState(null); // { type: "success" | "error", text }

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // Data is already filtered server-side by the selected period (dueDate based).
  const fetchRentData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchReport("rent", {
        month: selectedMonth,
        year: selectedYear,
      });
      setRentData(data);
    } catch (err) {
      console.error("Error fetching rent data:", err);
      setError("Failed to load rent data. Please try again.");
      setRentData([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth, selectedYear]);

  useEffect(() => {
    fetchRentData();
  }, [fetchRentData]);

  // Only status filtering remains client-side; period filtering is server-side.
  const displayedData = selectedStatus
    ? rentData.filter((item) => item.status === selectedStatus)
    : rentData;

  const sumBy = (predicate) =>
    displayedData
      .filter(predicate)
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const totalAmount = sumBy(() => true);
  const paidTotal = sumBy((i) => i.status === "Paid");
  const unpaidTotal = sumBy((i) => i.status === "Unpaid");
  const pendingTotal = sumBy((i) => i.status === "Pending");

  const totalsByStatus = {
    Paid: paidTotal,
    Unpaid: unpaidTotal,
    Pending: pendingTotal,
  };
  const countsByStatus = STATUS_KEYS.reduce((acc, key) => {
    acc[key] = displayedData.filter((i) => i.status === key).length;
    return acc;
  }, {});
  // Counts for the status filter come from the period data so they stay stable.
  const periodCounts = STATUS_KEYS.reduce((acc, key) => {
    acc[key] = rentData.filter((i) => i.status === key).length;
    return acc;
  }, {});

  const share = (part) => (totalAmount > 0 ? (part / totalAmount) * 100 : 0);
  const collectedPct = Math.round(share(paidTotal));

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isOverdue = (item) =>
    item.status !== "Paid" &&
    !isNaN(new Date(item.dueDate).getTime()) &&
    new Date(item.dueDate) < today;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { propertyName, month, amount, dueDate, status, notes };
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/rent`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );
      const result = await response.json();
      setToast({
        type: response.ok ? "success" : "error",
        text: result.message || (response.ok ? "Rent saved." : "Could not save rent."),
      });
      fetchRentData();
      setPropertyName("");
      setMonth("");
      setAmount(0);
      setDueDate("");
      setStatus("Unpaid");
      setNotes("");
    } catch (error) {
      console.error("Error:", error);
      setToast({ type: "error", text: "Could not save rent. Please try again." });
    }
  };

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/report/rent/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        },
      );
      const result = await response.json();

      if (result.success) {
        fetchRentData(); // refresh
        setToast({ type: "success", text: `Status changed to ${newStatus}.` });
      } else {
        setToast({
          type: "error",
          text: result.message || "Could not update status.",
        });
      }
    } catch (error) {
      console.error("Update failed", error);
      setToast({ type: "error", text: "Could not update status." });
    } finally {
      setEditId(null);
      setUpdateStatus(null);
    }
  };

  // Derived from the already-filtered data using the real dueDate field
  // (not the free-text `month` string).
  const monthWiseSummary = displayedData.reduce((acc, item) => {
    const date = new Date(item.dueDate);
    const monthYear = isNaN(date.getTime())
      ? "Unknown"
      : date.toLocaleString("default", { month: "short", year: "numeric" });

    if (!acc[monthYear]) {
      acc[monthYear] = { Paid: 0, Unpaid: 0, Pending: 0, Total: 0 };
    }

    const value = Number(item.amount || 0);
    if (acc[monthYear][item.status] !== undefined) {
      acc[monthYear][item.status] += value;
    }
    acc[monthYear].Total += value;

    return acc;
  }, {});

  const downloadRentExcel = () => {
    const rows = displayedData.map((item) => ({
      Property: item.propertyName,
      Month: item.month,
      "Due Date": new Date(item.dueDate).toLocaleDateString("en-IN"),
      Status: item.status,
      Amount: Number(item.amount || 0),
      Notes: item.notes || "-",
    }));

    exportToExcel({
      data: rows,
      fileName: `Rent_Report_${selectedMonth || "All"}_${selectedYear || "All_Years"}`,
      sheetName: "Rent",
    });
  };

  const rentPdfDocument = (
    <RentReportPdf
      rents={displayedData}
      selectedMonth={selectedMonth}
      selectedYear={selectedYear}
      selectedStatus={selectedStatus}
      totals={{
        total: totalAmount,
        paid: paidTotal,
        unpaid: unpaidTotal,
        pending: pendingTotal,
      }}
    />
  );

  const pdfFileName = `Rent_Report_${selectedMonth || "All"}_${
    selectedYear || "Years"
  }.pdf`;

  // Plain-language label of the active period for the header.
  const monthName = selectedMonth
    ? MONTHS.find((m) => String(m.value) === String(selectedMonth))?.label
    : "";
  const periodLabel = selectedMonth
    ? selectedYear
      ? `${monthName} ${selectedYear}`
      : `${monthName}, all years`
    : selectedYear
      ? `Year ${selectedYear}`
      : "All time";

  const monthRows = Object.entries(monthWiseSummary);

  return (
    <div className="space-y-6">
      {/* ================= TOAST ================= */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className={`fixed right-6 top-6 z-50 flex max-w-sm items-start gap-2.5 rounded-lg border px-4 py-3 text-sm shadow-lg ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-rose-200 bg-rose-50 text-rose-900"
          }`}
        >
          {toast.type === "success" ? (
            <MdCheckCircle size={18} className="mt-0.5 shrink-0 text-emerald-600" />
          ) : (
            <MdErrorOutline size={18} className="mt-0.5 shrink-0 text-rose-600" />
          )}
          <p className="flex-1">{toast.text}</p>
          <button
            aria-label="Dismiss message"
            onClick={() => setToast(null)}
            className="shrink-0 rounded p-0.5 opacity-60 transition hover:opacity-100"
          >
            <MdClose size={16} />
          </button>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Rent
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {periodLabel}
            <span className="mx-2 text-slate-300">|</span>
            {displayedData.length}{" "}
            {displayedData.length === 1 ? "record" : "records"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button onClick={downloadRentExcel} className={BTN_OUTLINE}>
            <MdFileDownload size={18} className="text-slate-500" />
            Excel
          </button>
          <PDFDownloadLink
            document={rentPdfDocument}
            fileName={pdfFileName}
            className={BTN_OUTLINE}
          >
            {({ loading: pdfLoading }) => (
              <>
                <MdFileDownload size={18} className="text-slate-500" />
                {pdfLoading ? "Preparing PDF..." : "PDF"}
              </>
            )}
          </PDFDownloadLink>
        </div>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="flex flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-3 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div
          role="group"
          aria-label="Filter by status"
          className="flex w-full overflow-x-auto rounded-lg bg-slate-100 p-1 lg:w-auto"
        >
          {[
            { value: "", label: "All", count: rentData.length },
            ...STATUS_KEYS.map((k) => ({
              value: k,
              label: k,
              count: periodCounts[k],
            })),
          ].map((opt) => {
            const active = selectedStatus === opt.value;
            return (
              <button
                key={opt.label}
                type="button"
                aria-pressed={active}
                onClick={() => setSelectedStatus(opt.value)}
                className={`flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-md px-4 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 lg:flex-none ${
                  active
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                {opt.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? "bg-slate-100 text-slate-600" : "text-slate-400"
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <select
            aria-label="Filter by month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={SELECT}
          >
            <option value="">All months</option>
            {MONTHS.map((m) => (
              <option key={m.value} value={m.value}>
                {m.label}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by year"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className={SELECT}
          >
            <option value="">All years</option>
            {YEARS.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================= OVERVIEW (the one bold element) ================= */}
      <section
        aria-label="Rent overview"
        className="rounded-xl bg-gradient-to-br from-[#17458f] via-[#102f6b] to-[#0a1f4d] p-6 text-white shadow-sm ring-1 ring-blue-950/40 sm:p-8"
      >
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-12">
          <div className="lg:col-span-2">
            <p className="text-sm text-cyan-200/90">Total rent</p>
            <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
              ₹{formatINR(totalAmount)}
            </p>
            <p className="mt-3 text-sm text-blue-100/80">
              <span className="font-semibold text-emerald-300">
                {collectedPct}% collected
              </span>{" "}
              (₹{formatINR(paidTotal)} of ₹{formatINR(totalAmount)})
            </p>
          </div>

          <div className="lg:col-span-3">
            <div
              className="flex h-3 w-full overflow-hidden rounded-full bg-white/10"
              role="img"
              aria-label={`Paid ${collectedPct}%, unpaid ${Math.round(
                share(unpaidTotal),
              )}%, pending ${Math.round(share(pendingTotal))}%`}
            >
              {STATUS_KEYS.map((key) => (
                <div
                  key={key}
                  className={`${STATUS[key].bar} h-full transition-all duration-500 motion-reduce:transition-none`}
                  style={{ width: `${share(totalsByStatus[key])}%` }}
                />
              ))}
            </div>

            <dl className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
              {STATUS_KEYS.map((key) => (
                <div key={key}>
                  <dt className="flex items-center gap-2 text-sm text-blue-100/80">
                    <span className={`h-2 w-2 rounded-full ${STATUS[key].dot}`} />
                    {key}
                  </dt>
                  <dd className="mt-1 text-xl font-semibold tabular-nums">
                    ₹{formatINR(totalsByStatus[key])}
                  </dd>
                  <dd className="mt-0.5 text-xs text-blue-200/70">
                    {countsByStatus[key]}{" "}
                    {countsByStatus[key] === 1 ? "record" : "records"},{" "}
                    {Math.round(share(totalsByStatus[key]))}%
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* ================= LEFT: RECORDS + MONTH SUMMARY ================= */}
        <div className="space-y-6 xl:col-span-2">
          <Panel
            title="Rent records"
            description="Select the pencil to change a payment status."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-left text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-6 py-3">Property</th>
                    <th className="px-6 py-3">Month</th>
                    <th className="px-6 py-3">Due date</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Amount</th>
                    <th className="w-14 px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    <SkeletonRows rows={4} cols={6} />
                  ) : error ? (
                    <TableMessage colSpan={6} tone="text-rose-600">
                      {error}
                    </TableMessage>
                  ) : displayedData.length === 0 ? (
                    <TableMessage colSpan={6}>
                      No rent records for this period. Add one using the form.
                    </TableMessage>
                  ) : (
                    displayedData.map((item) => {
                      const isEditing = editId === item._id;
                      const overdue = isOverdue(item);
                      return (
                        <tr
                          key={item._id}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-cyan-50 text-sm font-semibold text-cyan-800 ring-1 ring-cyan-100">
                                {(item.propertyName || "?")
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate font-medium text-slate-900">
                                  {item.propertyName}
                                </p>
                                {item.notes && (
                                  <p className="max-w-[14rem] truncate text-xs text-slate-500">
                                    {item.notes}
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                            {formatMonth(item.month)}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            <span className="text-slate-600">
                              {new Date(item.dueDate).toLocaleDateString("en-IN")}
                            </span>
                            {overdue && (
                              <span className="ml-2 inline-flex items-center gap-1 text-xs font-medium text-rose-600">
                                <MdWarningAmber size={14} />
                                Overdue
                              </span>
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <select
                                  aria-label="New status"
                                  value={updateStatus}
                                  onChange={(e) =>
                                    setUpdateStatus(e.target.value)
                                  }
                                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-sm focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10"
                                >
                                  <option value="Paid">Paid</option>
                                  <option value="Unpaid">Unpaid</option>
                                  <option value="Pending">Pending</option>
                                </select>
                                <button
                                  aria-label="Save status"
                                  disabled={updateStatus === item.status}
                                  onClick={() =>
                                    handleStatusUpdate(item._id, updateStatus)
                                  }
                                  className="rounded-lg bg-blue-800 p-1.5 text-white transition hover:bg-blue-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-300"
                                >
                                  <MdCheck size={16} />
                                </button>
                              </div>
                            ) : (
                              <StatusPill status={item.status} />
                            )}
                          </td>
                          <td className="whitespace-nowrap px-6 py-4 text-right font-semibold tabular-nums text-slate-900">
                            ₹{formatINR(item.amount)}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              aria-label={
                                isEditing ? "Cancel editing" : "Edit status"
                              }
                              onClick={() => {
                                setEditId(isEditing ? null : item._id);
                                setUpdateStatus(item?.status);
                              }}
                              className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20"
                            >
                              {isEditing ? (
                                <MdClose size={18} />
                              ) : (
                                <MdEdit size={18} />
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
                {!loading && !error && displayedData.length > 0 && (
                  <tfoot className="border-t border-slate-200 bg-slate-50/70">
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-3.5 text-right font-medium text-slate-600"
                      >
                        Total
                      </td>
                      <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                        ₹{formatINR(totalAmount)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </Panel>

          <Panel
            title="Month-wise summary"
            description="Grouped by due date. The bar shows how much has been collected."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/70 text-xs font-medium text-slate-500">
                  <tr>
                    <th className="px-6 py-3 text-left">Month</th>
                    <th className="px-6 py-3 text-right">Paid</th>
                    <th className="px-6 py-3 text-right">Unpaid</th>
                    <th className="px-6 py-3 text-right">Pending</th>
                    <th className="px-6 py-3 text-right">Total</th>
                    <th className="px-6 py-3 text-left">Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {monthRows.length === 0 ? (
                    <TableMessage colSpan={6}>No data available.</TableMessage>
                  ) : (
                    monthRows.map(([label, data]) => {
                      const collected =
                        data.Total > 0
                          ? Math.round((data.Paid / data.Total) * 100)
                          : 0;
                      return (
                        <tr
                          key={label}
                          className="transition-colors hover:bg-slate-50/70"
                        >
                          <td className="whitespace-nowrap px-6 py-3.5 font-medium text-slate-900">
                            {label}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-emerald-700">
                            ₹{formatINR(data.Paid)}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-rose-700">
                            ₹{formatINR(data.Unpaid)}
                          </td>
                          <td className="px-6 py-3.5 text-right tabular-nums text-amber-700">
                            ₹{formatINR(data.Pending)}
                          </td>
                          <td className="px-6 py-3.5 text-right font-semibold tabular-nums text-slate-900">
                            ₹{formatINR(data.Total)}
                          </td>
                          <td className="px-6 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="h-1.5 w-20 rounded-full bg-slate-100">
                                <div
                                  className="h-1.5 rounded-full bg-emerald-500"
                                  style={{ width: `${collected}%` }}
                                />
                              </div>
                              <span className="w-9 text-xs tabular-nums text-slate-500">
                                {collected}%
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Panel>
        </div>

        {/* ================= RIGHT: FORM ================= */}
        <div className="xl:col-span-1">
          <Panel
            title="Record rent payment"
            description="Add a rent entry for a property."
            className="xl:sticky xl:top-6"
          >
            <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
              <div>
                <Label htmlFor="propertyName">Property name</Label>
                <input
                  id="propertyName"
                  type="text"
                  placeholder="e.g. Main building"
                  value={propertyName}
                  onChange={(e) => setPropertyName(e.target.value)}
                  required
                  className={FIELD}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                <div>
                  <Label htmlFor="rentMonth">Rent month</Label>
                  <input
                    id="rentMonth"
                    type="month"
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                    required
                    className={FIELD}
                  />
                </div>
                <div>
                  <Label htmlFor="dueDate">Due date</Label>
                  <input
                    id="dueDate"
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    required
                    className={FIELD}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="amount">Amount</Label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-sm text-slate-400">
                    ₹
                  </span>
                  <input
                    id="amount"
                    type="number"
                    placeholder="0"
                    min={0}
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className={`${FIELD} pl-8 tabular-nums`}
                  />
                </div>
              </div>

              <div>
                <span className="mb-1.5 block text-sm font-medium text-slate-700">
                  Payment status
                </span>
                <div
                  role="group"
                  aria-label="Payment status"
                  className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1"
                >
                  {STATUS_KEYS.map((key) => {
                    const active = status === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        aria-pressed={active}
                        onClick={() => setStatus(key)}
                        className={`flex items-center justify-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium transition focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-600/20 ${
                          active
                            ? "bg-white text-slate-900 shadow-sm"
                            : "text-slate-500 hover:text-slate-800"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${STATUS[key].dot}`}
                        />
                        {key}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea
                  id="notes"
                  rows={3}
                  placeholder="Receipt number, remarks..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className={FIELD}
                />
              </div>

              <div className="border-t border-slate-100 pt-4">
                <button type="submit" className={BTN_PRIMARY}>
                  Save rent
                </button>
              </div>
            </form>
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default Rent;
