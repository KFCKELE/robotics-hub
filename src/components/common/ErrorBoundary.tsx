import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertOctagon, RefreshCw, RotateCcw, Home } from "lucide-react";

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackDescription?: string;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleRetry = () => {
    if (this.props.onReset) {
      this.props.onReset();
    }
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  private handleHardReset = () => {
    try {
      // Clear potentially corrupt local states while preserving keys if needed
      window.location.reload();
    } catch {
      this.setState({ hasError: false, error: null, errorInfo: null });
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[280px] w-full bg-slate-900/90 border border-red-500/30 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-2xl backdrop-blur-sm my-4">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400 mb-4 animate-pulse">
            <AlertOctagon className="w-6 h-6" />
          </div>

          <h3 className="text-base font-bold text-slate-100 mb-1">
            {this.props.fallbackTitle || "模块运行发生异常 (Runtime Exception Caught)"}
          </h3>

          <p className="text-xs text-slate-400 max-w-md mb-4 leading-relaxed">
            {this.props.fallbackDescription ||
              "系统已自动捕获该异常并保护其他模块稳定运行。您可以尝试重试恢复或刷新该视图。"}
          </p>

          {this.state.error && (
            <div className="w-full max-w-lg bg-slate-950/80 border border-slate-800 rounded-xl p-3 mb-5 text-left overflow-auto max-h-32">
              <p className="text-[11px] font-mono text-red-400 font-semibold truncate">
                {this.state.error.name}: {this.state.error.message}
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-lg shadow-cyan-900/20 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              重新尝试加载 (Retry)
            </button>

            <button
              onClick={this.handleHardReset}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              刷新页面 (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
