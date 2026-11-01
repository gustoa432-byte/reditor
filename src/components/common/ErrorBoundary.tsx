import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Download } from 'lucide-react';
import { exportUniverseAsJSON, loadUniverseData } from '../../utils/storage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('REDCROW 3000 Error Boundary caught an error:', error, errorInfo);
  }

  private handleEmergencyExport = () => {
    try {
      const data = loadUniverseData();
      exportUniverseAsJSON(data);
    } catch (err) {
      alert('Не удалось экспортировать данные: ' + String(err));
    }
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6">
          <div className="max-w-lg w-full bg-slate-900 border border-rose-900/60 rounded-2xl p-6 md:p-8 space-y-5 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-400 mx-auto flex items-center justify-center shadow-lg">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-serif font-bold text-slate-100">
                Защитный контур REDCROW 3000
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed">
                Произошла непредвиденная ошибка в интерфейсе. Ваши сохраненные данные канона и рукописи находятся в безопасности в локальном хранилище.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-left font-mono text-[11px] text-rose-300/80 max-h-32 overflow-y-auto">
                {this.state.error.message}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={this.handleEmergencyExport}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>Скачать резервную копию (JSON)</span>
              </button>
              <button
                onClick={() => window.location.reload()}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md transition cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Перезагрузить страницу</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
