// src/components/CodeBlock.js

import React from 'react';
import './CodeBlock.css';

const CodeBlock = ({ code, highlightLine }) => {
  return (
    <pre className="code-block">
      {code.map((line, index) => (
        <div key={index} className={`code-line ${highlightLine === index + 1 ? 'highlighted-line' : ''}`}>
          <span className="line-number">{index + 1}</span>
          {line}
        </div>
      ))}
    </pre>
  );
};

export default CodeBlock;