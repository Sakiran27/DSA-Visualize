// src/LinkedList.js

import React, { useState, useEffect } from 'react';
import './LinkedList.css';
import CodeBlock from './components/CodeBlock';

// Node component with dynamic styling
const Node = ({ value, isHead, isHighlighted }) => {
  const nodeClassName = `node ${isHighlighted ? 'highlighted' : ''}`;
  return (
    <div className={nodeClassName}>
      <div className="node-value">{value}</div>
      {isHead && <div className="head-label">HEAD</div>}
      <div className="arrow">→</div>
    </div>
  );
};

// Pseudo-code definitions
const SEARCH_PSEUDO_CODE = [
  'search(head, value):',
  '  currentNode = head',
  '  while currentNode is not null:',
  '    if currentNode.value == value:',
  '      return currentNode',
  '    currentNode = currentNode.next',
  '  return null'
];

const ADD_TAIL_PSEUDO_CODE = [
  'addNodeAtTail(head, value):',
  '  newNode = createNode(value)',
  '  if head is null:',
  '    head = newNode',
  '    return head',
  '  currentNode = head',
  '  while currentNode.next is not null:',
  '    currentNode = currentNode.next',
  '  currentNode.next = newNode',
  '  return head'
];

// Main LinkedList component
const LinkedList = () => {
  const [list, setList] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [animationState, setAnimationState] = useState({
    opPath: [],
    currentStep: 0,
    isActive: false,
    currentCode: ADD_TAIL_PSEUDO_CODE,
    pendingValue: null,
  });

  // Animation engine
  useEffect(() => {
    if (animationState.isActive) {
      if (animationState.currentStep < animationState.opPath.length) {
        const timer = setTimeout(() => {
          setAnimationState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
        }, 700);
        return () => clearTimeout(timer);
      } else {
        // Animation complete
        setAnimationState(prev => ({ ...prev, isActive: false }));
      }
    }
  }, [animationState]);

  // Final list update after animation
  useEffect(() => {
    if (!animationState.isActive && animationState.pendingValue !== null) {
      setList(prevList => [...prevList, animationState.pendingValue]);
      setAnimationState(prev => ({ ...prev, pendingValue: null }));
    }
  }, [animationState]);

  // Add node at tail with animation
  const handleAddAtTail = () => {
    if (animationState.isActive) return;

    const newValue = parseInt(inputValue);
    if (isNaN(newValue)) {
      alert("Please enter a valid number.");
      return;
    }

    if (list.length === 0) {
      setList([newValue]);
      setInputValue('');
      return;
    }

    let opPath = [
      { lineIndex: 1, nodeIndex: -1 },
      { lineIndex: 2, nodeIndex: -1 },
      { lineIndex: 6, nodeIndex: 0 }
    ];
    let currentIndex = 0;
    while (currentIndex < list.length - 1) {
      opPath.push({ lineIndex: 7, nodeIndex: currentIndex });
      opPath.push({ lineIndex: 8, nodeIndex: currentIndex + 1 });
      currentIndex++;
    }
    opPath.push({ lineIndex: 7, nodeIndex: currentIndex });
    opPath.push({ lineIndex: 9, nodeIndex: currentIndex + 1 });
    opPath.push({ lineIndex: 10, nodeIndex: currentIndex + 1 });

    setAnimationState({
      opPath,
      currentStep: 0,
      isActive: true,
      currentCode: ADD_TAIL_PSEUDO_CODE,
      pendingValue: newValue
    });
    setInputValue('');
  };

  // Search node with animation
  const handleSearch = () => {
    if (animationState.isActive) return;

    const valueToFind = parseInt(inputValue);
    if (isNaN(valueToFind)) {
      alert("Please enter a valid number to search.");
      return;
    }

    let opPath = [
      { lineIndex: 1, nodeIndex: -1 },
      { lineIndex: 2, nodeIndex: 0 }
    ];
    let found = false;
    for (let i = 0; i < list.length; i++) {
      opPath.push({ lineIndex: 3, nodeIndex: i });
      opPath.push({ lineIndex: 4, nodeIndex: i });
      if (list[i] === valueToFind) {
        opPath.push({ lineIndex: 5, nodeIndex: i });
        found = true;
        break;
      }
      opPath.push({ lineIndex: 6, nodeIndex: i });
    }
    if (!found) {
      opPath.push({ lineIndex: 7, nodeIndex: -1 });
    }

    setAnimationState({
      opPath,
      currentStep: 0,
      isActive: true,
      currentCode: SEARCH_PSEUDO_CODE,
      pendingValue: null
    });
    setInputValue('');
  };

  // Add node at head
  const handleAddAtHead = () => {
    if (animationState.isActive) return;

    const newValue = parseInt(inputValue);
    if (!isNaN(newValue)) {
      setList(prevList => [newValue, ...prevList]);
      setInputValue('');
    }
  };

  // Delete node by value
  const handleDeleteByValue = () => {
    if (animationState.isActive) return;

    const valueToDelete = parseInt(inputValue);
    if (!isNaN(valueToDelete)) {
      setList(prevList => prevList.filter(nodeValue => nodeValue !== valueToDelete));
      setInputValue('');
    }
  };

  // Helpers
  const isHighlighted = (index) => animationState.opPath[animationState.currentStep]?.nodeIndex === index;
  const currentLine = animationState.opPath[animationState.currentStep]?.lineIndex;

  return (
    <div className="linked-list-container">
      <h2>Linked List</h2>
      <div className="visualizer-and-code-container">
        <div className="list-visualizer">
          {list.length === 0 ? (
            <p className="empty-list-message">List is empty. Add some nodes!</p>
          ) : (
            list.map((value, index) => (
              <Node
                key={index}
                value={value}
                isHead={index === 0}
                isHighlighted={isHighlighted(index)}
              />
            ))
          )}
        </div>
        <div className="code-container">
          <CodeBlock code={animationState.currentCode} highlightLine={currentLine} />
        </div>
      </div>
      <div className="controls">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Value"
          disabled={animationState.isActive}
        />
        <button className="add-btn" onClick={handleAddAtTail} disabled={animationState.isActive}>Add at Tail</button>
        <button className="search-btn" onClick={handleSearch} disabled={animationState.isActive}>Search</button>
        <button onClick={handleAddAtHead} disabled={animationState.isActive}>Add at Head</button>
        <button onClick={handleDeleteByValue} disabled={animationState.isActive}>Delete by Value</button>
      </div>
    </div>
  );
};

export default LinkedList;
