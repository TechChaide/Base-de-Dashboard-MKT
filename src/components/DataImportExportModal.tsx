import React, { useRef, useState } from 'react';
import { Download, FileSpreadsheet, RefreshCw, Upload, X } from 'lucide-react';
import { SalesRecord } from '../types';
import { exportToCSV, parseCSV } from '../data/chaideData';

interface DataImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDataset: SalesRecord[];
  onImportData: (newRecords: SalesRecord[]) => void;
  onResetDefault: () => void;
}

export const DataImportExportModal: React.FC<DataImportExportModalProps> = ({
  isOpen,
  onClose,
  currentDataset,
  onImportData,
  onResetDefault,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownloadCSV = () => {
    const csvContent = exportToCSV(currentDataset);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `chaide_ventas_historico_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const text = event.target?.result as string;
      try {
        const parsed = parseCSV(text);
        if (parsed.length > 0) {
          onImportData(parsed);
          setImportStatus(`Se cargaron con éxito ${parsed.length.toLocaleString()} registros de venta.`);
          setTimeout(() => {
            onClose();
          }, 1200);
        } else {
          setImportStatus('El archivo CSV no contiene registros válidos o está vacío.');
        }
      } catch (err) {
        setImportStatus('Error al procesar el archivo CSV. Revisa el formato de columnas.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-950 border border-blue-800 text-blue-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-['Outfit']">
                Gestión de Base de Datos Chaide
              </h2>
              <p className="text-xs text-slate-400">
                Importa o exporta datos masivos para alimentar el dashboard interactivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Current volume summary */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-slate-400">Registros actualmente en memoria:</span>
            <span className="font-bold font-mono text-white text-sm">
              {currentDataset.length.toLocaleString()} filas
            </span>
          </div>

          {/* Export Action */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">Exportar Base a CSV</h3>
                <p className="text-slate-400 text-[11px] mt-0.5">
                  Descarga el conjunto completo de ventas de Chaide con todas sus dimensiones y métricas.
                </p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 font-semibold transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar CSV</span>
              </button>
            </div>
          </div>

          {/* Import Action */}
          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col gap-2.5">
            <div>
              <h3 className="font-bold text-white">Cargar Archivo CSV Personalizado</h3>
              <p className="text-slate-400 text-[11px] mt-0.5">
                Sube tu propio archivo de ventas. El sistema recalculará los cruces, proyecciones y el mapa de ciudades en milisegundos.
              </p>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              accept=".csv,text/csv"
              onChange={handleFileUpload}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-3 border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl flex flex-col items-center justify-center gap-1 text-slate-300 hover:text-white bg-slate-900/50 hover:bg-slate-850 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 text-blue-400" />
              <span className="font-semibold text-xs">Seleccionar archivo CSV desde tu equipo</span>
              <span className="text-[10px] text-slate-500">Formato delimitado por comas (.csv)</span>
            </button>

            {importStatus && (
              <div className="p-2 rounded bg-blue-950/60 border border-blue-800 text-blue-300 text-center font-medium">
                {importStatus}
              </div>
            )}
          </div>

          {/* Reset to Default */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                onResetDefault();
                setImportStatus('Dataset Chaide original restablecido.');
                setTimeout(() => onClose(), 800);
              }}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer datos originales de Chaide</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold transition-colors"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
