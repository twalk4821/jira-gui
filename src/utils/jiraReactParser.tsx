import React, { JSX } from 'react';

export const parseJiraToReact = (jiraMarkup: string) => {
  if (typeof jiraMarkup !== 'string') {
    return <>{String(jiraMarkup)}</>;
  }

  const lines = jiraMarkup.split('\n');
  const result: (string | JSX.Element)[] = [];
  let currentListItems: JSX.Element[] = [];
  let currentListType: 'ul' | 'ol' | null = null;

  const flushList = () => {
    if (currentListItems.length > 0) {
      if (currentListType === 'ul') {
        result.push(<ul key={`ul-${result.length}`}>{currentListItems}</ul>);
      } else if (currentListType === 'ol') {
        result.push(<ol key={`ol-${result.length}`}>{currentListItems}</ol>);
      }
      currentListItems = [];
      currentListType = null;
    }
  };

  // This function will now handle all inline markup (bold, italic)
  const parseInlineMarkup = (text: string, keyPrefix: string) => {
    const elements: (string | JSX.Element)[] = [];
    let lastIndex = 0;

    // Combined regex for bold and italic
    const regex = /(\*([^\*]+)\*)|(_([^_]+)_)/g;

    let match;
    while ((match = regex.exec(text)) !== null) {
      const fullMatch = match[0];
      const boldContent = match[2]; // Content for *bold*
      const italicContent = match[4]; // Content for _italic_

      const startIndex = match.index;
      const endIndex = startIndex + fullMatch.length;

      // Add text before the current match
      if (startIndex > lastIndex) {
        elements.push(text.substring(lastIndex, startIndex));
      }

      if (boldContent !== undefined) {
        elements.push(<strong key={`${keyPrefix}-bold-${startIndex}`}>{boldContent}</strong>);
      } else if (italicContent !== undefined) {
        elements.push(<em key={`${keyPrefix}-italic-${startIndex}`}>{italicContent}</em>);
      }
      lastIndex = endIndex;
    }

    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      elements.push(text.substring(lastIndex));
    }
    return elements;
  };

  lines.forEach((line, index) => {
    // No more string replace for bold/italic here.
    // parseInlineMarkup will handle it.

    // Headings
    const headingMatch = line.match(/h([1-6])\. (.+)/);
    if (headingMatch) {
      flushList(); // Close any open lists before a heading
      const level = headingMatch[1];
      const text = headingMatch[2];
      const HeadingTag = `h${level}` as keyof JSX.IntrinsicElements;
      result.push(React.createElement(HeadingTag, { key: `h-${index}` }, parseInlineMarkup(text, `h-${index}`)));
      return;
    }

    // Bullet points
    if (line.startsWith('* ')) {
      if (currentListType === 'ol') {
        flushList(); // Close ordered list if open
      }
      if (currentListType === null) {
        currentListType = 'ul';
      }
      currentListItems.push(<li key={`li-${index}`}>{parseInlineMarkup(line.substring(2), `li-${index}`)}</li>);
      return;
    }

    // Numbered list points
    const orderedListMatch = line.match(/^\d+\. (.+)/);
    if (orderedListMatch) {
      if (currentListType === 'ul') {
        flushList(); // Close unordered list if open
      }
      if (currentListType === null) {
        currentListType = 'ol';
      }
      currentListItems.push(<li key={`li-${index}`}>{parseInlineMarkup(orderedListMatch[1], `li-${index}`)}</li>);
      return;
    }

    // If not a special markup line, flush any open lists and add as a paragraph or <br />
    flushList();
    if (line.trim() === '') {
      result.push(<br key={`br-${index}`} />);
    } else {
      result.push(<p key={`p-${index}`}>{parseInlineMarkup(line, `p-${index}`)}</p>);
    }
  });

  flushList(); // Flush any remaining open lists at the end of the document

  return <>{result}</>;
};