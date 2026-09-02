"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Paperclip, Upload, FileText, X } from "lucide-react";
import { WordCounter } from "./word-counter";

interface ContextDialogProps {
  context: string;
  onContextChange: (context: string) => void;
}

const MAX_WORDS = 262144;

const SUPPORTED_FILE_TYPES = [
  ".pdf",
  ".txt",
  ".docx",
  ".md",
  ".csv",
  ".json",
  ".html",
  ".htm",
];

const SUPPORTED_EXTENSIONS = [
  "pdf",
  "txt",
  "docx",
  "md",
  "csv",
  "json",
  "html",
  "htm",
];

export function ContextDialog({
  context,
  onContextChange,
}: ContextDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localContext, setLocalContext] = useState(context);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOverLimit = localContext.trim()
    ? localContext.trim().split(/\s+/).length > MAX_WORDS
    : false;

  // ============================================================
  // FILE TYPE
  // ============================================================

  const getFileExtension = (fileName: string) => {
    const parts = fileName.toLowerCase().split(".");

    if (parts.length < 2) {
      return "";
    }

    return parts.pop() || "";
  };

  const isSupportedFile = (file: File) => {
    const extension = getFileExtension(file.name);

    return SUPPORTED_EXTENSIONS.includes(extension);
  };

  // ============================================================
  // TEXT CLEANUP
  // ============================================================

  const cleanText = (text: string) => {
    return text
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  };

  // ============================================================
  // ADD EXTRACTED TEXT
  // ============================================================

  const addExtractedText = (
    extractedText: string,
    fileName: string
  ) => {
    const cleanedText = cleanText(extractedText);

    if (!cleanedText) {
      alert(
        `No readable text was found in "${fileName}".`
      );
      return;
    }

    setLocalContext((previousContext) => {
      const fileContent = `
================ FILE: ${fileName} ================

${cleanedText}

================ END FILE: ${fileName} ================
`;

      const newText = previousContext
        ? `${previousContext}\n\n${fileContent}`
        : fileContent;

      const words = newText.trim()
        ? newText.trim().split(/\s+/).length
        : 0;

      if (words > MAX_WORDS) {
        const wordsArray = newText
          .trim()
          .split(/\s+/);

        return wordsArray
          .slice(0, MAX_WORDS)
          .join(" ");
      }

      return newText;
    });

    setUploadedFileName(fileName);
  };

  // ============================================================
  // PDF
  // ============================================================

  const extractPdfText = async (file: File) => {
    const pdfjsLib = await import("pdfjs-dist");

    pdfjsLib.GlobalWorkerOptions.workerSrc =
      new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url
      ).toString();

    const arrayBuffer = await file.arrayBuffer();

    const loadingTask =
      pdfjsLib.getDocument({
        data: arrayBuffer,
      });

    const pdf = await loadingTask.promise;

    let fullText = "";

    for (
      let pageNum = 1;
      pageNum <= pdf.numPages;
      pageNum++
    ) {
      const page = await pdf.getPage(pageNum);

      const textContent =
        await page.getTextContent();

      const pageText = textContent.items
        .map((item) => {
          if (
            "str" in item &&
            typeof item.str === "string"
          ) {
            return item.str;
          }

          return "";
        })
        .join(" ");

      fullText += pageText + "\n";
    }

    return fullText;
  };

  // ============================================================
  // DOCX
  // ============================================================

  const extractDocxText = async (file: File) => {
    const mammoth = await import("mammoth");

    const arrayBuffer =
      await file.arrayBuffer();

    const result =
      await mammoth.extractRawText({
        arrayBuffer,
      });

    return result.value;
  };

  // ============================================================
  // FILE PROCESSOR
  // ============================================================

  const handleFileUpload = async (file: File) => {
    if (!isSupportedFile(file)) {
      alert(
        "Unsupported file type.\n\nSupported files: PDF, TXT, DOCX, MD, CSV, JSON and HTML."
      );

      return;
    }

    setIsProcessing(true);

    try {
      const extension =
        getFileExtension(file.name);

      let extractedText = "";

      switch (extension) {
        case "pdf":
          extractedText =
            await extractPdfText(file);
          break;

        case "docx":
          extractedText =
            await extractDocxText(file);
          break;

        case "txt":
        case "md":
        case "csv":
        case "json":
        case "html":
        case "htm":
          extractedText =
            await file.text();
          break;

        default:
          throw new Error(
            "Unsupported file type."
          );
      }

      addExtractedText(
        extractedText,
        file.name
      );
    } catch (error) {
      console.error(
        "File extraction failed:",
        error
      );

      alert(
        `Failed to read "${file.name}". Please make sure the file is valid and contains readable text.`
      );
    } finally {
      setIsProcessing(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // ============================================================
  // DRAG & DROP
  // ============================================================

  const handleDragOver = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (
    e: React.DragEvent
  ) => {
    e.preventDefault();
    setIsDragging(false);

    const files =
      e.dataTransfer.files;

    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // ============================================================
  // FILE PICKER
  // ============================================================

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = e.target.files;

    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  // ============================================================
  // SAVE
  // ============================================================

  const handleSave = () => {
    if (!isOverLimit) {
      onContextChange(localContext);

      setIsOpen(false);

      window.dispatchEvent(
        new Event("contextUpdated")
      );
    }
  };

  // ============================================================
  // CANCEL
  // ============================================================

  const handleCancel = () => {
    setLocalContext(context);
    setUploadedFileName("");
    setIsOpen(false);
  };

  // ============================================================
  // CLEAR CONTEXT
  // ============================================================

  const handleClear = () => {
    setLocalContext("");
    setUploadedFileName("");
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        setIsOpen(open);

        if (open) {
          setLocalContext(context);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full"
          title="Add context"
        >
          <Paperclip className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="flex max-h-[80vh] flex-col overflow-hidden sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Paperclip className="h-5 w-5" />
            Add Context
          </DialogTitle>
        </DialogHeader>

        <div className="flex min-h-0 flex-1 flex-col gap-4">

          {/* ==================================================
              FILE UPLOAD AREA
          =================================================== */}

          <div
            className={`
              rounded-lg
              border-2
              border-dashed
              p-6
              text-center
              transition-colors
              ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <Upload className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />

            <p className="mb-1 text-sm font-medium">
              {isProcessing
                ? "Processing your file..."
                : "Drop your file here"}
            </p>

            <p className="mb-3 text-xs text-muted-foreground">
              PDF, TXT, DOCX, MD, CSV, JSON or HTML
            </p>

            <Button
              variant="outline"
              size="sm"
              disabled={isProcessing}
              onClick={() =>
                fileInputRef.current?.click()
              }
            >
              <Upload className="mr-2 h-3.5 w-3.5" />

              {isProcessing
                ? "Processing..."
                : "Choose your file"}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept={SUPPORTED_FILE_TYPES.join(",")}
              onChange={
                handleFileInputChange
              }
              className="hidden"
            />

            {/* Uploaded file */}
            {uploadedFileName && (
              <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />

                <span className="truncate text-xs font-medium">
                  {uploadedFileName}
                </span>

                <button
                  type="button"
                  onClick={handleClear}
                  className="ml-auto shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                  aria-label="Clear uploaded file"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* ==================================================
              CONTEXT TEXTAREA
          =================================================== */}

          <div className="flex min-h-0 flex-1 flex-col">
            <label className="mb-2 text-sm font-medium">
              Context (will be sent with each message)
            </label>

            <textarea
              value={localContext}
              onChange={(e) =>
                setLocalContext(
                  e.target.value
                )
              }
              placeholder="Paste your context here or upload a file..."
              className={`
                min-h-[200px]
                flex-1
                resize-none
                rounded-md
                border
                p-3
                focus:outline-none
                focus:ring-2
                focus:ring-primary
                ${
                  isOverLimit
                    ? "border-red-500"
                    : "border-border"
                }
              `}
            />

            {/* Word Counter */}
            <WordCounter
              text={localContext}
              maxWords={MAX_WORDS}
              onClear={handleClear}
            />
          </div>

          {/* ==================================================
              ACTION BUTTONS
          =================================================== */}

          <div className="flex justify-end gap-2 border-t pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>

            <Button
              onClick={handleSave}
              disabled={
                isOverLimit ||
                isProcessing
              }
            >
              Save Context
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}