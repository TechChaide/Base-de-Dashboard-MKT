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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-sky-100 flex items-center justify-between bg-sky-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-100 border border-sky-200 text-[#002B66]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#002B66] font-['Outfit']">
                Gestión de Base de Datos Chaide
              </h2>
              <p className="text-xs text-slate-500">
                Importa o exporta datos masivos para alimentar el panel interactivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Current volume summary */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
            <span className="text-slate-600 font-medium">Registros actualmente en memoria:</span>
            <span className="font-bold font-mono text-[#002B66] text-sm">
              {currentDataset.length.toLocaleString()} filas
            </span>
          </div>

          {/* Export Action */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900">Exportar Base a CSV</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Descarga el conjunto completo de ventas de Chaide con todas sus dimensiones y métricas.
                </p>
              </div>
              <button
                onClick={handleDownloadCSV}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 rounded-lg border border-slate-200 font-semibold transition-colors shadow-2xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#002B66]" />
                <span>Descargar CSV</span>
              </button>
            </div>
          </div>

          {/* Import Action */}
          <div className="p-4 bg-slate-50/80 rounded-xl border border-slate-200 flex flex-col gap-2.5">
            <div>
              <h3 className="font-bold text-slate-900">Cargar Archivo CSV Personalizado</h3>
              <p className="text-slate-500 text-[11px] mt-0.5">
                Sube tu archivo de ventas. El sistema recalculará los cruces, proyecciones y el mapa de ciudades en milisegundos.
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
              className="w-full py-4 border-2 border-dashed border-sky-300 hover:border-[#002B66] rounded-xl flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-slate-900 bg-sky-50/50 hover:bg-sky-50 transition-all cursor-pointer"
            >
              <Upload className="w-5 h-5 text-[#002B66]" />
              <span className="font-bold text-xs text-[#002B66]">Seleccionar archivo CSV desde tu equipo</span>
              <span className="text-[10px] text-slate-500">Formato delimitado por comas (.csv)</span>
            </button>

            {importStatus && (
              <div className="p-2.5 rounded-lg bg-sky-100 border border-sky-200 text-[#002B66] text-center font-semibold">
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
              className="inline-flex items-center gap-1.5 text-slate-500 hover:text-[#002B66] transition-colors cursor-pointer font-medium"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Restablecer datos originales de Chaide</span>
            </button>

            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#002B66] hover:bg-[#0056B3] text-white rounded-lg font-bold transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
