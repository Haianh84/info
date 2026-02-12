/* =======================
   SECTION ANIMATIONS
======================= */
function showabout() {
  $("#about_container").show().addClass("animated slideInLeft");
  setTimeout(() => $("#about_container").removeClass("animated slideInLeft"), 800);
}
function closeabout() {
  $("#about_container").addClass("animated slideOutLeft");
  setTimeout(() => $("#about_container").hide().removeClass("animated slideOutLeft"), 800);
}

function showwork() {
  $("#work_container").show().addClass("animated slideInLeft");
  setTimeout(() => $("#work_container").removeClass("animated slideInLeft"), 800);
}
function closework() {
  $("#work_container").addClass("animated slideOutLeft");
  setTimeout(() => $("#work_container").hide().removeClass("animated slideOutLeft"), 800);
}

function showintel() {
  $("#intel_container").show().addClass("animated slideInRight");
  setTimeout(() => $("#intel_container").removeClass("animated slideInRight"), 800);
}
function closeintel() {
  $("#intel_container").addClass("animated slideOutRight");
  setTimeout(() => $("#intel_container").hide().removeClass("animated slideOutRight"), 800);
}

function showcontact() {
  $("#contact_container").show().addClass("animated slideInUp");
  setTimeout(() => $("#contact_container").removeClass("animated slideInUp"), 800);
}
function closecontact() {
  $("#contact_container").addClass("animated slideOutDown");
  setTimeout(() => $("#contact_container").hide().removeClass("animated slideOutDown"), 800);
}

/* =======================
   LOADING SCREEN
======================= */
setTimeout(() => {
  $("#loading").addClass("animated fadeOut");
  setTimeout(() => {
    $("#loading").hide();
    $("#box").hide();
  }, 1000);
}, 1500);

/* =======================
   PDF VIEWER (FIX HOÀN TOÀN)
======================= */
$(document).ready(function () {
  /* ✅ FIX Deprecated worker */
  pdfjsLib.GlobalWorkerOptions.workerSrc =
    "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.9.179/pdf.worker.min.js";

  const canvas = document.getElementById("pdf-render");
  const ctx = canvas.getContext("2d");
  const scale = 1.2;

  let pdfDoc = null;
  let pageNum = 1;
  let pageRendering = false;
  let pagePending = null;
  let currentPdfUrl = null;

  /* ===== Render Page ===== */
  function renderPage(num) {
    pageRendering = true;

    pdfDoc.getPage(num).then(page => {
      const viewport = page.getViewport({ scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      const renderTask = page.render({
        canvasContext: ctx,
        viewport: viewport,
      });

      renderTask.promise.then(() => {
        pageRendering = false;
        if (pagePending !== null) {
          renderPage(pagePending);
          pagePending = null;
        }
      });

      $("#pdf-current-page").text(num);
    });
  }

  function queueRenderPage(num) {
    if (pageRendering) pagePending = num;
    else renderPage(num);
  }

  /* ===== Load PDF (KHÔNG DOWNLOAD) ===== */
  function loadPdf(url) {
    if (!url) return;

    currentPdfUrl = url;
    pageNum = 1;
    pdfDoc = null;

    $("#pdf-current-page").text("1");
    $("#pdf-total-pages").text("--");

    pdfjsLib
      .getDocument({ url: encodeURI(url) })
      .promise.then(pdf => {
        pdfDoc = pdf;
        $("#pdf-total-pages").text(pdf.numPages);
        renderPage(pageNum);
      })
      .catch(err => {
        console.error("PDF load error:", err);
      });
  }

  /* ===== Controls ===== */
  $("#pdf-prev").on("click", () => {
    if (!pdfDoc || pageNum <= 1) return;
    pageNum--;
    queueRenderPage(pageNum);
  });

  $("#pdf-next").on("click", () => {
    if (!pdfDoc || pageNum >= pdfDoc.numPages) return;
    pageNum++;
    queueRenderPage(pageNum);
  });

  /* ===== Download (CHỈ KHI CLICK) ===== */
  $("#pdf-download").on("click", e => {
    e.preventDefault();
    if (!currentPdfUrl) return;

    const a = document.createElement("a");
    a.href = currentPdfUrl;
    a.download = decodeURIComponent(currentPdfUrl.split("/").pop());
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });

  /* ===== Load PDF List ===== */
  fetch("resources/pdfs/pdfList.json", { cache: "no-store" })
    .then(res => res.json())
    .then(list => {
      if (!list || !list.length) return;

      const $selector = $("#pdf-selector");
      $selector.empty();

      list.forEach(item => {
        $("<option>")
          .val(item.file)
          .text(item.name)
          .appendTo($selector);
      });

      // ✅ Chỉ load để xem
      loadPdf(list[0].file);

      $selector.on("change", function () {
        loadPdf(this.value);
      });
    })
    .catch(err => console.error("PDF list error:", err));
});
