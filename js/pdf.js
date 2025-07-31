const html2pdf = window.html2pdf;
export function setupPDFDownload() {
  const btn = document.getElementById("downloadBtn");
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    const element = document.querySelector(".center");
    const width = element.offsetWidth + 2;
    const height = element.offsetHeight + 15;

    // document.querySelector(".wrapper").style.padding = "10px";
    // document.querySelector(".wrapper").style.width = "565px";

    const opt = {
      margin: 0,
      filename: "Exam-CV.pdf",
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
      },
      jsPDF: {
        unit: "px",
        format: [width, height],
        orientation: "portrait",
      },
    };

    html2pdf().set(opt).from(element).save();
  });
}
setupPDFDownload();
