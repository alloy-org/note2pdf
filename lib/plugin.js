const plugin = {
  // -----------------------------------------------------------------------
  async noteOption(app, noteUUID) {
    await this._initLibraries();
    console.log("Initialized PDF libraries, now preparing PDF for download...");
    const note = await app.notes.find(noteUUID);
    await this._downloadPDF(note);
  },

  // -----------------------------------------------------------------------
  async _initLibraries() {
    // https://showdownjs.com/docs/quickstart/#client-side_1
    await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js");
    // https://artskydj.github.io/jsPDF/docs/jsPDF.html
    await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.debug.js");
  },

  // -----------------------------------------------------------------------
  async _downloadPDF(note) {
    const markdownText = await note.content();
    const html = this._markdownToHTML(markdownText);
    console.log("Translated to HTML as", html);
    const pdf = this._htmlToPdf(html);
    console.log("PDF object", pdf);

    if (pdf) {
      console.log("Saving pdf");
      // const buffer = pdf.output("arraybuffer");
      // const pdfData = new Uint8Array(buffer);
      pdf.save("output.pdf");
    }
  },

  // -----------------------------------------------------------------------
  // Convert HTML to PDF using jsPDF
  _htmlToPdf(html) {
    const doc = new jsPDF();
    doc.fromHTML(html, 15, 15, { width: 170 });
    return doc;
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
}
