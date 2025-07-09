import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Task } from '../types/task';
import { DAYS_OF_WEEK } from './constants';

export const exportToPDF = async (tasks: Task[]) => {
  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  
  // Embed fonts
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Add a new page (A4 size: 595 × 842 points)
  let page = pdfDoc.addPage([595, 842]);
  
  // Initial position and margins
  let yPosition = 800;
  const margin = 50;
  const lineHeight = 15;
  
  // Colors
  const primaryColor = rgb(0.1, 0.1, 0.1);
  const secondaryColor = rgb(0.4, 0.4, 0.4);
  const headerBgColor = rgb(0.7, 0.9, 1);
  const rowBgColor = rgb(0.96, 0.96, 0.96);

  // Header
  page.drawText('Rotina Semanal', {
    x: margin,
    y: yPosition,
    size: 20,
    font: fontBold,
    color: primaryColor,
  });
  yPosition -= 25;
  
  // Date
  const currentDate = new Date().toLocaleDateString('pt-BR');
  page.drawText(`Exportado em: ${currentDate}`, {
    x: margin,
    y: yPosition,
    size: 12,
    font: font,
    color: secondaryColor,
  });
  yPosition -= 30;
  
  // Summary
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.checked).length;
  const pendingTasks = totalTasks - completedTasks;
  
  page.drawText('Resumo:', {
    x: margin,
    y: yPosition,
    size: 14,
    font: fontBold,
    color: primaryColor,
  });
  yPosition -= 20;
  
  page.drawText(`Total de tarefas: ${totalTasks}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: font,
    color: primaryColor,
  });
  yPosition -= lineHeight;
  
  page.drawText(`Concluídas: ${completedTasks}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: font,
    color: primaryColor,
  });
  yPosition -= lineHeight;
  
  page.drawText(`Pendentes: ${pendingTasks}`, {
    x: margin,
    y: yPosition,
    size: 11,
    font: font,
    color: primaryColor,
  });
  yPosition -= 30;
  
  // Tasks by day
  for (const day of DAYS_OF_WEEK) {
    const dayTasks = tasks.filter(task => task.day === day.key);
    
    if (dayTasks.length > 0) {
      // Check if we need a new page
      if (yPosition < 100) {
        page = pdfDoc.addPage([595, 842]);
        yPosition = 800;
      }
      
      // Day header
      page.drawText(day.label, {
        x: margin,
        y: yPosition,
        size: 14,
        font: fontBold,
        color: primaryColor,
      });
      yPosition -= 20;
      
      // Table configuration
      const headers = ['Status', 'Título', 'Descrição', 'Situação'];
      const columnWidths = [30, 120, 250, 80];
      const tableX = margin;
      const rowHeight = 20;
      
      // Draw table header
      page.drawRectangle({
        x: tableX,
        y: yPosition - rowHeight + 5,
        width: columnWidths.reduce((a, b) => a + b, 0),
        height: rowHeight,
        color: headerBgColor,
      });
      
      // Draw header text
      let xPosition = tableX;
      for (let i = 0; i < headers.length; i++) {
        page.drawText(headers[i], {
          x: xPosition + 5,
          y: yPosition - 10,
          size: 10,
          font: fontBold,
          color: primaryColor,
        });
        xPosition += columnWidths[i];
      }
      yPosition -= rowHeight + 5;
      
      // Draw tasks rows
      for (const task of dayTasks) {
        // Check if we need a new page
        if (yPosition < 50) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = 800;
          
          // Redraw header if new page
          page.drawRectangle({
            x: tableX,
            y: yPosition - rowHeight + 5,
            width: columnWidths.reduce((a, b) => a + b, 0),
            height: rowHeight,
            color: headerBgColor,
          });
          
          xPosition = tableX;
          for (let i = 0; i < headers.length; i++) {
            page.drawText(headers[i], {
              x: xPosition + 5,
              y: yPosition - 10,
              size: 10,
              font: fontBold,
              color: primaryColor,
            });
            xPosition += columnWidths[i];
          }
          yPosition -= rowHeight + 5;
        }
        
        // Alternate row color
        if (dayTasks.indexOf(task) % 2 === 0) {
          page.drawRectangle({
            x: tableX,
            y: yPosition - rowHeight + 5,
            width: columnWidths.reduce((a, b) => a + b, 0),
            height: rowHeight,
            color: rowBgColor,
          });
        }
        
        // Draw task data
        xPosition = tableX;
        
        // Status
        page.drawText(task.checked ? '✓' : '○', {
          x: xPosition + columnWidths[0]/2 - 3,
          y: yPosition - 10,
          size: 10,
          font: font,
          color: primaryColor,
        });
        xPosition += columnWidths[0];
        
        // Title
        page.drawText(task.title, {
          x: xPosition + 5,
          y: yPosition - 10,
          size: 10,
          font: font,
          color: primaryColor,
          maxWidth: columnWidths[1] - 10,
        });
        xPosition += columnWidths[1];
        
        // Description
        page.drawText(task.description || '-', {
          x: xPosition + 5,
          y: yPosition - 10,
          size: 10,
          font: font,
          color: primaryColor,
          maxWidth: columnWidths[2] - 10,
        });
        xPosition += columnWidths[2];
        
        // Status
        page.drawText(task.checked ? 'Concluída' : 'Pendente', {
          x: xPosition + 5,
          y: yPosition - 10,
          size: 10,
          font: font,
          color: primaryColor,
        });
        
        yPosition -= rowHeight;
      }
      
      yPosition -= 15;
    }
  }
  
  // Add page numbers
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const currentPage = pages[i];
    currentPage.drawText(`Página ${i + 1} de ${pages.length}`, {
      x: 500,
      y: 30,
      size: 10,
      font: font,
      color: secondaryColor,
    });
  }
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  
  // Create blob and download
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const fileName = `rotina-odontologica-${currentDate.replace(/\//g, '-')}.pdf`;
  
  // Trigger download
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

// Função de exportação para Excel (mantida igual)
export const exportToExcel = (tasks: Task[]) => {
  const workbook = XLSX.utils.book_new();
  
  // Summary sheet
  const summaryData = [
    ['Rotina Odontológica Semanal'],
    [''],
    [`Exportado em: ${new Date().toLocaleDateString('pt-BR')}`],
    [''],
    ['RESUMO'],
    [`Total de tarefas: ${tasks.length}`],
    [`Concluídas: ${tasks.filter(task => task.checked).length}`],
    [`Pendentes: ${tasks.filter(task => !task.checked).length}`],
    [''],
    ['TAREFAS POR DIA']
  ];
  
  DAYS_OF_WEEK.forEach(day => {
    const dayTasks = tasks.filter(task => task.day === day.key);
    const completedCount = dayTasks.filter(task => task.checked).length;
    summaryData.push([`${day.label}: ${completedCount}/${dayTasks.length}`]);
  });
  
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');
  
  // All tasks sheet
  const allTasksData = [
    ['Dia', 'Título', 'Descrição', 'Status', 'Criado em', 'Atualizado em']
  ];
  
  tasks.forEach(task => {
    const dayLabel = DAYS_OF_WEEK.find(d => d.key === task.day)?.label || task.day;
    allTasksData.push([
      dayLabel,
      task.title,
      task.description || '',
      task.checked ? 'Concluída' : 'Pendente',
      task.createdAt.toLocaleDateString('pt-BR'),
      task.updatedAt.toLocaleDateString('pt-BR')
    ]);
  });
  
  const allTasksSheet = XLSX.utils.aoa_to_sheet(allTasksData);
  XLSX.utils.book_append_sheet(workbook, allTasksSheet, 'Todas as Tarefas');
  
  // Individual day sheets
  DAYS_OF_WEEK.forEach(day => {
    const dayTasks = tasks.filter(task => task.day === day.key);
    
    if (dayTasks.length > 0) {
      const dayData = [
        ['Título', 'Descrição', 'Status', 'Criado em', 'Atualizado em']
      ];
      
      dayTasks.forEach(task => {
        dayData.push([
          task.title,
          task.description || '',
          task.checked ? 'Concluída' : 'Pendente',
          task.createdAt.toLocaleDateString('pt-BR'),
          task.updatedAt.toLocaleDateString('pt-BR')
        ]);
      });
      
      const daySheet = XLSX.utils.aoa_to_sheet(dayData);
      XLSX.utils.book_append_sheet(workbook, daySheet, day.short);
    }
  });
  
  // Save
  const currentDate = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
  const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, `rotina-odontologica-${currentDate}.xlsx`);
};