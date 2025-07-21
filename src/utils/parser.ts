import chalk from 'chalk';

export const parseMarkup = (str: string) => {
  return str
    .replace(/\r\n/g, '\n')                                   // Normalize newlines
    .replace(/\*([^\*]+)\*/g, (_, text) => chalk.bold(text))  // Bold
   .replace(/_([^_]+)_/g, (_, text) => chalk.italic(text))    // Italic
    .replace(/h([1-6])\. (.+)/g, (_, level, text) => {
      return `${'#'.repeat(level)} ${text}`;                  // Headings
    })
    .replace(/^\* (.+)$/gm, '- $1')                           // Bullet points
    .replace(/^\# (.+)$/gm, '1. $1');                         // Numbered list
}
