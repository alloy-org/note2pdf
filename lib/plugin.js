const plugin = {
  // -----------------------------------------------------------------------
  async noteOption(app, noteUUID) {
    this._initLibraries().then(async () => {
      app.alert("Libraries loaded, now generating PDF");
      await this.downloadPDF();
    });
  },

  // -----------------------------------------------------------------------
  async _initLibraries() {
    await this._loadScript('https://cdn.jsdelivr.net/npm/marked/marked.min.js');
    await this._loadScript('https://unpkg.com/md-to-pdf/dist/md-to-pdf.js');
  },

  // -----------------------------------------------------------------------
  async _downloadPDF() {
    const markdownText = '# Heading\n\nThis is a paragraph with **bold** text.';
    const html = this._markdownToHtml(markdownText);
console.log("html is", html);
    const pdf = await mdToPdf({ content: html }).catch(console.error);
console.log("pdf object", pdf)

    if (pdf) {
      const blob = new Blob([pdf.content], { type: 'application/pdf' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'output.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  },

  // -----------------------------------------------------------------------
  _markdownToHTML(markdownText) {
    return marked(markdownText);
  },

  // -----------------------------------------------------------------------
  _loadScript: url => (new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = url;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  }))
}
