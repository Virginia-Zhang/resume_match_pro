declare module 'pdf-parse/lib/pdf-parse.js' {
    const pdfParse: (dataBuffer: Buffer) => Promise<{ text: string }>;
    export default pdfParse;
}