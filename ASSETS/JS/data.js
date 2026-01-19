export function exportTXT(data, filename) {
  let text = `****${filename.toUpperCase()} REPORT****\n\n`;

  if (filename == 'products') {
    data.forEach((p, index) => {
      text += `${index + 1}. ${p.name}\n`;
      text += `   Category: ${p.category}\n`;
      text += `   Price: $${p.price}\n`;
      text += `   Stock: ${p.quantity}\n\n`;
    });
  } else if (filename == 'orders') {
    data.forEach((o, index) => {
      text += `${index + 1}. N° Order: ${o.id}\n`;
      text += `   Date: ${formatDate(o.date)}\n`;
      text += `   Product: ${o.productName}\n`;
      text += `   Customer: ${o.customer}\n`;
      text += `   Quantity: ${o.quantity}\n`;
      text += `   Total: $${o.total}\n`;
      text += `   Status: ${o.status}\n\n`;
    });
  }

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.txt`;
  a.click();
  URL.revokeObjectURL(url);
}
