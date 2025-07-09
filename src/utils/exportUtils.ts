import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Task } from '../types/task';
import { DAYS_OF_WEEK } from './constants';

export const exportToPDF = async (tasks: Task[]) => {
  try {
    // 1. Criar documento PDF
    const pdfDoc = await PDFDocument.create();
     pdfDoc.registerFontkit(fontkit);

    // 2. Carregar fonte Noto Sans (suporta Unicode)
    const fontUrl = '/fonts/NotoSans-Regular.ttf';
    const fontResponse = await fetch(fontUrl);

     if (!fontResponse.ok) {
      throw new Error(`Erro ao carregar fonte: ${fontResponse.status}`);
    }
    
    const fontBytes = await fontResponse.arrayBuffer();
    
    // 3. Embeddar as fontes
    const normalFont = await pdfDoc.embedFont(fontBytes);
    const boldFont = await pdfDoc.embedFont(fontBytes, { bold: true });

    // 4. Adicionar página inicial
    let page = pdfDoc.addPage([595, 842]); // A4 em pontos (595 x 842)
    
    // 5. Configurações de layout
    let yPosition = 800;
    const margin = 50;
    const lineHeight = 15;
    const rowHeight = 20;
    
    // Cores
    const colors = {
      primary: rgb(0.1, 0.1, 0.1),
      secondary: rgb(0.4, 0.4, 0.4),
      headerBg: rgb(0.7, 0.9, 1),
      rowBg: rgb(0.96, 0.96, 0.96)
    };

    // 6. Cabeçalho do documento
    page.drawText('Rotina Odontológica Semanal', {
      x: margin,
      y: yPosition,
      size: 20,
      font: boldFont,
      color: colors.primary,
    });
    yPosition -= 25;

    // 7. Data de exportação
    const currentDate = new Date().toLocaleDateString('pt-BR');
    page.drawText(`Exportado em: ${currentDate}`, {
      x: margin,
      y: yPosition,
      size: 12,
      font: normalFont,
      color: colors.secondary,
    });
    yPosition -= 30;

    // 8. Resumo estatístico
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.checked).length;
    const pendingTasks = totalTasks - completedTasks;

    page.drawText('Resumo:', {
      x: margin,
      y: yPosition,
      size: 14,
      font: boldFont,
      color: colors.primary,
    });
    yPosition -= 20;

    const summaryLines = [
      `Total de tarefas: ${totalTasks}`,
      `Concluídas: ${completedTasks}`,
      `Pendentes: ${pendingTasks}`
    ];

    summaryLines.forEach(line => {
      page.drawText(line, {
        x: margin,
        y: yPosition,
        size: 11,
        font: normalFont,
        color: colors.primary,
      });
      yPosition -= lineHeight;
    });

    yPosition -= 20;

    // 9. Tarefas por dia
    const columnConfig = [
      { header: 'Status', width: 30 },
      { header: 'Título', width: 120 },
      { header: 'Descrição', width: 250 },
      { header: 'Situação', width: 80 }
    ];

    for (const day of DAYS_OF_WEEK) {
      const dayTasks = tasks.filter(task => task.day === day.key);
      
      if (dayTasks.length > 0) {
        // Verificar espaço na página
        if (yPosition < 150) {
          page = pdfDoc.addPage([595, 842]);
          yPosition = 800;
        }

        // Cabeçalho do dia
        page.drawText(day.label, {
          x: margin,
          y: yPosition,
          size: 14,
          font: boldFont,
          color: colors.primary,
        });
        yPosition -= 20;

        // Desenhar cabeçalho da tabela
        const tableWidth = columnConfig.reduce((sum, col) => sum + col.width, 0);
        
        page.drawRectangle({
          x: margin,
          y: yPosition - 15,
          width: tableWidth,
          height: rowHeight,
          color: colors.headerBg,
        });

        let xPosition = margin;
        columnConfig.forEach(column => {
          page.drawText(column.header, {
            x: xPosition + 5,
            y: yPosition - 10,
            size: 10,
            font: boldFont,
            color: colors.primary,
          });
          xPosition += column.width;
        });

        yPosition -= rowHeight + 5;

        // Desenhar tarefas
        dayTasks.forEach((task, index) => {
          // Verificar se precisa de nova página
          if (yPosition < 50) {
            page = pdfDoc.addPage([595, 842]);
            yPosition = 800;
            
            // Redesenhar cabeçalho na nova página
            page.drawRectangle({
              x: margin,
              y: yPosition - 15,
              width: tableWidth,
              height: rowHeight,
              color: colors.headerBg,
            });

            xPosition = margin;
            columnConfig.forEach(column => {
              page.drawText(column.header, {
                x: xPosition + 5,
                y: yPosition - 10,
                size: 10,
                font: boldFont,
                color: colors.primary,
              });
              xPosition += column.width;
            });

            yPosition -= rowHeight + 5;
          }

          // Alternar cores das linhas
          if (index % 2 === 0) {
            page.drawRectangle({
              x: margin,
              y: yPosition - 15,
              width: tableWidth,
              height: rowHeight,
              color: colors.rowBg,
            });
          }

          // Desenhar conteúdo da linha
          xPosition = margin;

          // Status (✓ ou ○)
          const statusSymbol = task.checked ? '✓' : '◯';
          
          page.drawText(statusSymbol, {
            x: xPosition + columnConfig[0].width/2 - 3,
            y: yPosition - 10,
            size: 10,
            font: normalFont,
            color: colors.primary,
          });
          xPosition += columnConfig[0].width;

          // Título
          page.drawText(task.title, {
            x: xPosition + 5,
            y: yPosition - 10,
            size: 10,
            font: normalFont,
            color: colors.primary,
            maxWidth: columnConfig[1].width - 10,
          });
          xPosition += columnConfig[1].width;

          // Descrição
          page.drawText(task.description || '-', {
            x: xPosition + 5,
            y: yPosition - 10,
            size: 10,
            font: normalFont,
            color: colors.primary,
            maxWidth: columnConfig[2].width - 10,
          });
          xPosition += columnConfig[2].width;

          // Situação
          page.drawText(task.checked ? 'Concluída' : 'Pendente', {
            x: xPosition + 5,
            y: yPosition - 10,
            size: 10,
            font: normalFont,
            color: colors.primary,
          });

          yPosition -= rowHeight;
        });

        yPosition -= 15;
      }
    }

    // 10. Adicionar números de página
    const pages = pdfDoc.getPages();
    pages.forEach((page, index) => {
      page.drawText(`Página ${index + 1} de ${pages.length}`, {
        x: 500,
        y: 30,
        size: 10,
        font: normalFont,
        color: colors.secondary,
      });
    });

    // 11. Salvar e baixar o PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const fileName = `rotina-odontologica-${currentDate.replace(/\//g, '-')}.pdf`;
    
    saveAs(blob, fileName);

  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};



export const exportToExcel = (tasks: Task[]) => {
  const workbook = XLSX.utils.book_new();
  

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