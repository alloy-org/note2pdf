const plugin = {
  // -----------------------------------------------------------------------
  async noteOption(app, noteUUID) {
    await this._initLibraries();
    console.log("Initialized PDF libraries, now preparing PDF for download...");
    await this._downloadPDF();
  },

  // -----------------------------------------------------------------------
  async _initLibraries() {
    await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/showdown/1.9.1/showdown.min.js");
    await this._loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/1.3.4/jspdf.debug.js");
  },

  // -----------------------------------------------------------------------
  async _downloadPDF() {
    const markdownText = '# Heading\n\nThis is a paragraph with **bold** text.';
    const html = this._markdownToHTML(markdownText);
    console.log("Translated to HTML as", html);
    const pdf = this._htmlToPdf(html);
    console.log("PDF object", pdf)

    if (pdf) {
      const blob = new Blob([ pdf.content ], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'output.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      const script = document.createElement('script');
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  },
}
