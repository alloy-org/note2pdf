const plugin = {
  // -----------------------------------------------------------------------
  async noteOption(app, noteUUID) {
    await this._initLibraries();
    console.log("Initialized PDF libraries, now preparing PDF for download...");
    await this._downloadPDF(app, noteUUID);
  },

  // -----------------------------------------------------------------------
  async _initLibraries() {
    if (typeof showdown === "undefined") {
      console.log("Loading showdown from CDN...")
      // https://showdownjs.com/docs/quickstart/#client-side_1
      await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js");
    }
    if (typeof jsPDF === "undefined") {
      console.log("Loading jsPDF");
      // https://artskydj.github.io/jsPDF/docs/jsPDF.html
      await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.debug.js");
    }
    if (typeof html2canvas === "undefined") {
      console.log("Loading html2canvas");
      // Phind thinks that jsPDF needs this, tho jsPDF's docs suggest it gets loaded dynamically
      await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js");
    }
  },

  // -----------------------------------------------------------------------
  async _downloadPDF(app, noteUUID) {
    const note = await app.notes.find(noteUUID);
    const markdownText = await note.content();
    // const html = this._markdownToHTML(markdownText);
    const html = `<p>Some Unicode text: ©</p>`;
    console.log("Translated to HTML as", html);
    // await this._htmlToPdf(app, html);
    const offscreenCanvas = await this._htmlToCanvas(html);
    console.log("offscreenCanvas", offscreenCanvas)
    const imageBitmap = await offscreenCanvas.transferToImageBitmap();
    console.log("Got bitmap", imageBitmap);
    const imageDataURL = this._canvasToImage(imageBitmap);
    console.log("Got imageDataURL", imageDataURL)
    const pdf = new jsPDF("p", "mm", "a4");

    if (pdf) {
      console.log("Saving pdf", pdf);
      pdf.addImage(imageDataURL, "JPEG", 10, 10);
      const pdfContent = pdf.output(); // Generate PDF content
      const blob = new Blob([pdfContent], { type: "application/pdf" });
      await app.saveFile(blob, `note-${ noteUUID }.pdf`);
    }
  },

  // -----------------------------------------------------------------------
  _canvasToImage(imageBitmap) {
    console.log("Rendering to canvas", imageBitmap, "width", imageBitmap.width)
    const canvas = document.createElement('canvas');
    canvas.width = imageBitmap.width;
    canvas.height = imageBitmap.height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(imageBitmap, 0, 0);
    return canvas.toDataURL('image/png');
  },

  // -----------------------------------------------------------------------
  // Convert HTML to PDF using jsPDF
  async _htmlToPdf(app, html) {
    const contentEl = document.querySelector("#content") || document.createElement("div");
    contentEl.setAttribute("id", "content");
    contentEl.innerHTML = html;
    const docBody = document.body;
    docBody.appendChild(contentEl);
    console.log("Added", contentEl, "to document, resulting in", docBody, "thus width", docBody.innerWidth, "height", docBody.innerHeight);

    const offscreenCanvas = new OffscreenCanvas(150, 150);
    const ctx = offscreenCanvas.getContext("2d");
    ctx.clearRect(0, 0, 150, 150);
    ctx.drawImage(contentEl, 0, 0, 150, 150);
    const imageData = offscreenCanvas.toDataURL("image/png");
    console.log("imageData", imageData)

    const doc = new jsPDF();
    const pdf = doc.addImage(imageData, "PNG", 10, 10, 150, 50);
    // const pdf = doc.fromHTML(html, 15, 15, { width: 170 });
    return pdf;
  },

  // -----------------------------------------------------------------------
  async _htmlToCanvas(html) {
    const canvas = await html2canvas(html);
    console.log("Initialized canvas", canvas, "from html")
    const offscreenCanvas = new OffscreenCanvas(canvas.width, canvas.height);
    const offscreenCtx = offscreenCanvas.getContext('2d');
    console.log("Initialized offscreenCanvas", offscreenCanvas)
    offscreenCtx.drawImage(canvas, 0, 0);
    return offscreenCanvas;
  },

  // -----------------------------------------------------------------------
  _markdownToHTML(markdownText) {
    const converter = new showdown.Converter();
    return converter.makeHtml(markdownText);
  },

  // -----------------------------------------------------------------------
  async _loadScript(url) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
};
