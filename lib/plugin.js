const plugin = {
  // -----------------------------------------------------------------------
  async noteOption(app, noteUUID) {
    this._initLibraries().then(async () => {
      await this._downloadPDF();
    });
  },

  // -----------------------------------------------------------------------
  async _initLibraries() {
    // await this._loadScript(null, "var exports = {};");
    await this._loadScript("https://cdn.jsdelivr.net/npm/marked@5.0.2/lib/marked.umd.min.js");
    await this._loadScript("https://cdn.jsdelivr.net/npm/md-to-pdf@5.2.4/dist/lib/config.min.js");
  },

  // -----------------------------------------------------------------------
  async _downloadPDF() {
    const markdownText = '# Heading\n\nThis is a paragraph with **bold** text.';
console.log("Submitting markdownText", markdownText);
    const html = this._markdownToHTML(markdownText);
console.log("html is", html);
    const pdf = await mdToPdf({ content: html }).catch(message => console.error(`Caught error ${ message }`));
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
  async _loadScript(url, innerHTML = null) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      if (url) script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      if (innerHTML) script.innerHTML = innerHTML;
      document.head.appendChild(script);
    });
  },
}
