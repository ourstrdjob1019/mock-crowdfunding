"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ExternalLink,
  Download,
  FileText,
  Layers,
  ScrollText,
  AlertCircle,
  Loader2,
  RotateCw,
} from "lucide-react";

interface PdfDetailViewerProps {
  url: string;
  title?: string;
  className?: string;
}

export function PdfDetailViewer({ url, title = "출품 IR 피치덱 (PDF)", className = "" }: PdfDetailViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.2);
  const [viewMode, setViewMode] = useState<"single" | "scroll">("single"); // 'single' = 한페이지씩, 'scroll' = 세로 스크롤
  const [loading, setLoading] = useState<boolean>(true);
  const [rendering, setRendering] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const pdfDocRef = useRef<any>(null);
  const renderTaskRef = useRef<any>(null);

  // 1. PDF.js CDN 스크립트 동적 로드
  const loadPdfJs = async (): Promise<any> => {
    if (typeof window === "undefined") return null;
    if ((window as any).pdfjsLib) {
      return (window as any).pdfjsLib;
    }

    return new Promise((resolve, reject) => {
      const existingScript = document.getElementById("pdfjs-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => resolve((window as any).pdfjsLib));
        existingScript.addEventListener("error", reject);
        return;
      }

      const script = document.createElement("script");
      script.id = "pdfjs-script";
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.async = true;
      script.onload = () => {
        const pdfjsLib = (window as any).pdfjsLib;
        if (pdfjsLib) {
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          resolve(pdfjsLib);
        } else {
          reject(new Error("pdfjsLib not found on window"));
        }
      };
      script.onerror = () => reject(new Error("Failed to load PDF.js from CDN"));
      document.head.appendChild(script);
    });
  };

  // 2. 문서 로드
  useEffect(() => {
    let isCancelled = false;

    const loadDocument = async () => {
      if (!url) {
        setError("PDF 경로가 없습니다.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      setCurrentPage(1);

      try {
        const pdfjsLib = await loadPdfJs();
        if (isCancelled) return;

        let loadingTask: any;

        // Base64 Data URL 처리
        if (url.startsWith("data:application/pdf;base64,")) {
          const base64 = url.split(",")[1];
          const binaryStr = window.atob(base64);
          const len = binaryStr.length;
          const bytes = new Uint8Array(len);
          for (let i = 0; i < len; i++) {
            bytes[i] = binaryStr.charCodeAt(i);
          }
          loadingTask = pdfjsLib.getDocument({ data: bytes });
        } else {
          loadingTask = pdfjsLib.getDocument({
            url: url,
            withCredentials: false,
          });
        }

        const pdf = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        console.warn("PDF.js 로드 실패:", err);
        if (!isCancelled) {
          setError(err.message || "PDF 문서를 불러오는 데 실패했습니다.");
          setLoading(false);
        }
      }
    };

    loadDocument();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [url]);

  // 3. 단일 페이지 렌더링 (한 페이지씩 보기 모드)
  const renderSinglePage = useCallback(async (pageNumber: number) => {
    if (!pdfDocRef.current || !canvasRef.current) return;

    try {
      setRendering(true);
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const page = await pdfDocRef.current.getPage(pageNumber);
      const canvas = canvasRef.current;
      if (!canvas) return;

      const context = canvas.getContext("2d");
      if (!context) return;

      // 해상도 최적화 (레티나 디스플레이 / 모바일 대응)
      const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
      const initialViewport = page.getViewport({ scale: 1 });
      
      // 컨테이너 폭에 맞춘 기본 스케일 계산
      const containerWidth = canvas.parentElement?.clientWidth || 700;
      const baseScale = Math.min((containerWidth - 32) / initialViewport.width, 1.5) * scale;
      const viewport = page.getViewport({ scale: baseScale * dpr });

      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width / dpr}px`;
      canvas.style.height = `${viewport.height / dpr}px`;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;
      await renderTask.promise;
      setRendering(false);
    } catch (err: any) {
      if (err.name !== "RenderingCancelledException") {
        console.error("PDF Page Render Error:", err);
      }
      setRendering(false);
    }
  }, [scale]);

  // 단일 모드일 때 현재 페이지 렌더링 트리거
  useEffect(() => {
    if (viewMode === "single" && !loading && numPages > 0) {
      renderSinglePage(currentPage);
    }
  }, [viewMode, currentPage, loading, numPages, renderSinglePage]);

  // 4. 세로 스크롤 모드 렌더링 (모든 페이지를 한 번에 상세페이지처럼 렌더)
  const renderAllPagesForScroll = useCallback(async () => {
    if (!pdfDocRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    container.innerHTML = ""; // 초기화

    const pdf = pdfDocRef.current;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    const containerWidth = container.clientWidth || 700;

    for (let i = 1; i <= pdf.numPages; i++) {
      try {
        const page = await pdf.getPage(i);
        const initialViewport = page.getViewport({ scale: 1 });
        const baseScale = Math.min((containerWidth - 32) / initialViewport.width, 1.5) * scale;
        const viewport = page.getViewport({ scale: baseScale * dpr });

        const pageWrapper = document.createElement("div");
        pageWrapper.className = "flex flex-col items-center mb-6 relative group";

        // 페이지 라벨
        const label = document.createElement("div");
        label.className =
          "text-[11px] font-semibold text-slate-400 mb-1.5 px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200";
        label.innerText = `PAGE ${i} / ${pdf.numPages}`;
        pageWrapper.appendChild(label);

        const canvas = document.createElement("canvas");
        canvas.className =
          "rounded-xl shadow-md border border-slate-200 bg-white max-w-full transition-transform duration-200";
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        canvas.style.width = `${viewport.width / dpr}px`;
        canvas.style.height = `${viewport.height / dpr}px`;

        pageWrapper.appendChild(canvas);
        container.appendChild(pageWrapper);

        const context = canvas.getContext("2d");
        if (context) {
          await page.render({ canvasContext: context, viewport }).promise;
        }
      } catch (e) {
        console.error(`Page ${i} render failed:`, e);
      }
    }
  }, [scale]);

  useEffect(() => {
    if (viewMode === "scroll" && !loading && numPages > 0) {
      renderAllPagesForScroll();
    }
  }, [viewMode, loading, numPages, renderAllPagesForScroll]);

  // 5. 키보드 네비게이션
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== "single") return;
      if (e.key === "ArrowLeft") {
        setCurrentPage((prev) => Math.max(1, prev - 1));
      } else if (e.key === "ArrowRight") {
        setCurrentPage((prev) => Math.min(numPages, prev + 1));
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [viewMode, numPages]);

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs flex flex-col ${className}`}>
      {/* 1. 상단 메인 컨트롤 바 */}
      <div className="bg-slate-900 text-white px-3 sm:px-4 py-2.5 flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-800">
        {/* 문서 타이틀 & 뱃지 */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-1.5">
              <span>{title}</span>
              {numPages > 0 && (
                <span className="px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 text-[10px] font-mono border border-indigo-500/30">
                  {numPages}P
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 보기 모드 전환 탭 (한 페이지씩 vs 세로 연속 보기) */}
        <div className="flex items-center bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("single")}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === "single"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>한 페이지씩 보기</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("scroll")}
            className={`px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 transition cursor-pointer ${
              viewMode === "scroll"
                ? "bg-indigo-600 text-white shadow-xs"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>세로 연속 보기</span>
          </button>
        </div>

        {/* 우측 도구: 줌 & 새 탭 열기 */}
        <div className="flex items-center gap-1.5">
          {/* 확대/축소 */}
          <div className="hidden sm:flex items-center bg-slate-800 rounded-lg border border-slate-700 px-1 py-0.5 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setScale((s) => Math.max(0.8, Number((s - 0.2).toFixed(1))))}
              title="축소"
              className="p-1 hover:text-white transition cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] px-1 text-slate-400 min-w-[40px] text-center">
              {Math.round(scale * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setScale((s) => Math.min(2.0, Number((s + 0.2).toFixed(1))))}
              title="확대"
              className="p-1 hover:text-white transition cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 원본 새 탭 열기 */}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            title="새 창에서 원본 열기 / 다운로드"
            className="px-2.5 py-1.2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden md:inline">새 탭 열기</span>
          </a>
        </div>
      </div>

      {/* 2. 한 페이지씩 보기 모드 전용 상단 네비게이터 */}
      {viewMode === "single" && numPages > 0 && (
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2 flex items-center justify-between text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-semibold flex items-center gap-1 shadow-xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">이전 페이지</span>
            </button>

            <button
              type="button"
              disabled={currentPage >= numPages}
              onClick={() => setCurrentPage((p) => Math.min(numPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer font-semibold flex items-center gap-1 shadow-xs"
            >
              <span className="hidden sm:inline">다음 페이지</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* 페이지 카운터 */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs">페이지</span>
            <div className="flex items-center font-bold bg-white border border-slate-300 rounded-lg px-2.5 py-1 shadow-2xs">
              <span className="text-indigo-600 font-mono text-sm">{currentPage}</span>
              <span className="text-slate-400 mx-1.5">/</span>
              <span className="text-slate-700 font-mono">{numPages}</span>
            </div>
          </div>

          {/* 안내 텍스트 */}
          <div className="hidden md:block text-[11px] text-slate-400 font-medium">
            키보드 방향키 <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-slate-600">←</kbd> <kbd className="px-1 py-0.5 bg-white border border-slate-300 rounded text-slate-600">→</kbd> 로 넘겨볼 수 있습니다
          </div>
        </div>
      )}

      {/* 3. 본문 뷰어 영역 */}
      <div className="relative min-h-[500px] sm:min-h-[680px] bg-slate-100/70 p-3 sm:p-6 flex flex-col items-center justify-center overflow-auto max-h-[75vh]">
        {/* 로딩 상태 */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500 space-y-3">
            <Loader2 className="w-9 h-9 animate-spin text-indigo-600" />
            <p className="text-sm font-semibold text-slate-700">PDF 상세페이지 문서를 고해상도로 변환 중입니다...</p>
            <p className="text-xs text-slate-400">페이지가 많을 경우 잠시 기다려주세요.</p>
          </div>
        )}

        {/* 에러 또는 CORS 차단 시: 깔끔한 폴백 iframe 및 다운로드 가이드 */}
        {error && !loading && (
          <div className="w-full max-w-xl mx-auto p-6 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-4 text-center my-8">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-base">외부 보안 정책으로 인한 캔버스 변환 안내</h4>
              <p className="text-xs text-slate-500 mt-1">
                타 서버에서 제공하는 PDF의 경우 브라우저 보안(CORS)으로 인해 전용 뷰어 대신 내장 뷰어로 자동 전환됩니다.
              </p>
            </div>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-sm"
              >
                <ExternalLink className="w-4 h-4" />
                <span>새 창에서 원본 PDF 보기</span>
              </a>
              <button
                type="button"
                onClick={() => setError(null)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
              >
                기본 내장 뷰어로 보기
              </button>
            </div>

            {/* 내장 iframe fallback */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <iframe
                src={`${url}#toolbar=0&navpanes=0`}
                title="PDF Document Fallback"
                className="w-full h-[450px] rounded-xl border border-slate-200 bg-white"
              />
            </div>
          </div>
        )}

        {/* 정상 상태: A. 한 페이지씩 보기 (Single Mode) */}
        {!loading && !error && viewMode === "single" && (
          <div className="relative flex flex-col items-center justify-center w-full">
            {rendering && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center z-10 rounded-xl transition-all">
                <Loader2 className="w-7 h-7 animate-spin text-indigo-600" />
              </div>
            )}
            
            {/* 캔버스 상세페이지 카드 */}
            <div className="rounded-xl overflow-hidden shadow-xl border border-slate-200/80 bg-white transition-all duration-200">
              <canvas ref={canvasRef} className="block mx-auto max-w-full h-auto" />
            </div>
          </div>
        )}

        {/* 정상 상태: B. 세로 연속 스크롤 모드 (Scroll Mode) */}
        {!loading && !error && viewMode === "scroll" && (
          <div
            ref={scrollContainerRef}
            className="w-full flex flex-col items-center justify-center py-4 space-y-6"
          />
        )}
      </div>

      {/* 4. 하단 페이지 퀵 네비게이터 (한 페이지씩 보기 모드에서 여러 페이지일 때) */}
      {viewMode === "single" && numPages > 1 && (
        <div className="bg-white border-t border-slate-200 px-4 py-2.5 flex items-center justify-center gap-1.5 overflow-x-auto max-w-full">
          <span className="text-[11px] font-semibold text-slate-400 mr-1.5">이동:</span>
          {Array.from({ length: numPages }).map((_, idx) => {
            const pageNum = idx + 1;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`min-w-[28px] h-7 px-2 rounded-lg text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-indigo-600 text-white shadow-xs scale-105"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
