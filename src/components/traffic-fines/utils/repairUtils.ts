export const repairQuotes = (line: string): { value: string; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedLine = line;
  
  // Fix unclosed quotes
  const quoteCount = (repairedLine.match(/"/g) || []).length;
  if (quoteCount % 2 !== 0) {
    repairs.push('Added missing closing quote');
    repairedLine = repairedLine + '"';
  }
  
  // Fix consecutive quotes that aren't escaped
  repairedLine = repairedLine.replace(/"{2,}/g, (match) => {
    if (match.length % 2 === 0) {
      return match; // Even number of quotes - likely intentional escaping
    } else {
      repairs.push('Fixed unescaped consecutive quotes');
      return '"'.repeat(match.length - 1); // Remove one quote to make it even
    }
  });
  
  // Handle single quotes around values
  repairedLine = repairedLine.replace(/'([^']+)'/g, (match, p1) => {
    repairs.push('Converted single quotes to double quotes');
    return `"${p1}"`;
  });
  
  return { value: repairedLine, repairs };
};

export const repairDelimiters = (line: string): { value: string; repairs: string[] } => {
  const repairs: string[] = [];
  let repairedLine = line;
  
  // Fix multiple consecutive delimiters
  if (repairedLine.includes(',,')) {
    repairs.push('Fixed consecutive delimiters');
    repairedLine = repairedLine.replace(/,+/g, ',');
  }
  
  // Ensure line doesn't start or end with a delimiter
  if (repairedLine.startsWith(',')) {
    repairs.push('Removed leading delimiter');
    repairedLine = repairedLine.substring(1);
  }
  if (repairedLine.endsWith(',')) {
    repairs.push('Removed trailing delimiter');
    repairedLine = repairedLine.slice(0, -1);
  }
  
  return { value: repairedLine, repairs };
};

export const reconstructMalformedRow = (
  currentRow: string[],
  nextRow: string | undefined,
  expectedColumns: number
): { 
  repairedRow: string[]; 
  skipNextRow: boolean; 
  repairs: string[] 
} => {
  const repairs: string[] = [];
  let repairedRow = [...currentRow];
  let skipNextRow = false;

  // If we have fewer columns than expected and there's a next row
  if (currentRow.length < expectedColumns && nextRow) {
    // Check if the next row might be a continuation of a quoted field
    if (!nextRow.includes('"') || nextRow.trim().startsWith('"')) {
      const nextRowParts = nextRow.split(',');
      const remaining = expectedColumns - currentRow.length;
      
      // Only take what we need from the next row
      const neededParts = nextRowParts.slice(0, remaining);
      repairedRow = [...currentRow, ...neededParts];
      
      repairs.push('Merged split row due to line break in quoted field');
      skipNextRow = true;
    }
  }

  // Ensure we have exactly the expected number of columns
  while (repairedRow.length < expectedColumns) {
    repairs.push(`Added empty placeholder for column ${repairedRow.length + 1}`);
    repairedRow.push('');
  }

  // Remove extra columns if we have too many
  if (repairedRow.length > expectedColumns) {
    repairs.push(`Removed ${repairedRow.length - expectedColumns} extra columns`);
    repairedRow = repairedRow.slice(0, expectedColumns);
  }

  return {
    repairedRow,
    skipNextRow,
    repairs
  };
};