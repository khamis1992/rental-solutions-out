
export const injectPrintStyles = () => {
  const style = document.createElement('style');
  style.textContent = `
    @media print {
      /* Hide everything except the invoice content */
      body > *:not(.print-content) {
        display: none !important;
      }
      
      .print-content {
        display: block !important;
        position: relative !important;
        width: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
      }

      /* Reset any scroll areas */
      .scroll-area {
        height: auto !important;
        overflow: visible !important;
      }

      /* Remove card styling for clean print */
      .card {
        box-shadow: none !important;
        border: none !important;
      }

      /* Ensure proper page breaks */
      table { page-break-inside: auto; }
      tr { page-break-inside: avoid; }
      thead { display: table-header-group; }

      /* Set page margins */
      @page {
        margin: 20mm;
        size: A4;
      }

      /* Improve text contrast for printing */
      body {
        color: black !important;
        background: white !important;
      }

      /* Hide print button and other UI elements */
      .print\\:hidden {
        display: none !important;
      }

      /* Adjust spacing for print */
      .space-y-4 {
        margin-top: 1rem !important;
        margin-bottom: 1rem !important;
      }

      /* Ensure tables are properly formatted */
      table {
        width: 100% !important;
        border-collapse: collapse !important;
      }

      th, td {
        padding: 0.5rem !important;
        text-align: left !important;
      }

      /* Ensure proper image sizing */
      img {
        max-width: 100% !important;
        height: auto !important;
      }
      
      /* Page break control utilities */
      .page-break-before {
        page-break-before: always !important;
      }
      
      .page-break-after {
        page-break-after: always !important;
      }
      
      .avoid-break {
        page-break-inside: avoid !important;
      }
    }
  `;
  document.head.appendChild(style);
};

export const prepareForPrint = (id: string = 'printable-content') => {
  // Find the content to print
  const content = document.getElementById(id);
  
  if (!content) {
    console.error(`Element with ID '${id}' not found for printing`);
    return false;
  }
  
  // Create a class for the print content
  content.classList.add('print-content');
  
  // Add avoid-break to important elements
  const importantElements = content.querySelectorAll('.card, .section, table');
  importantElements.forEach(el => el.classList.add('avoid-break'));
  
  return true;
};

export const triggerPrint = (callback?: () => void) => {
  // Inject print styles
  injectPrintStyles();
  
  // Set a timeout to ensure styles are applied
  setTimeout(() => {
    // Print the document
    window.print();
    
    // Call the callback after printing
    if (callback) {
      setTimeout(callback, 500);
    }
  }, 300);
};
