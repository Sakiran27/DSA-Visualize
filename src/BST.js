// src/BST.js

import React, { useState, useEffect, useRef, useCallback } from 'react';
import './BST.css';
import CodeBlock from './components/CodeBlock';

// Helper to calculate node positions
const calculateNodePositions = (node, x, y, xOffset, yOffset, nodePositions) => {
  if (!node) return;
  nodePositions.set(node.value, { x, y });
  if (node.left) {
    calculateNodePositions(node.left, x - xOffset, y + yOffset, xOffset / 2, yOffset, nodePositions);
  }
  if (node.right) {
    calculateNodePositions(node.right, x + xOffset, y + yOffset, xOffset / 2, yOffset, nodePositions);
  }
};

// Finds a node in the tree by its value
const findNode = (node, value) => {
  if (!node) return null;
  if (node.value === value) return node;
  if (value < node.value) return findNode(node.left, value);
  return findNode(node.right, value);
};

// Component to render a single tree node
const TreeNode = ({ node, isHighlighted, x, y, onClick, isClickable }) => {
  if (!node) return null;
  const nodeClassName = `tree-node ${isHighlighted ? 'highlighted' : ''} ${isClickable ? 'clickable' : ''}`;
  return (
    <div className={nodeClassName} style={{ left: x, top: y }} onClick={() => onClick && onClick(node.value)}>
      {node.value}
    </div>
  );
};

// Component to draw SVG lines (edges)
const TreeCanvas = ({ root, nodePositions }) => {
  const lines = [];
  const addLines = (node) => {
    if (!node || !nodePositions.has(node.value)) return;
    const parentPos = nodePositions.get(node.value);

    if (node.left && nodePositions.has(node.left.value)) {
      const childPos = nodePositions.get(node.left.value);
      lines.push(<line key={`line-${node.value}-left`} x1={parentPos.x + 30} y1={parentPos.y + 30} x2={childPos.x + 30} y2={childPos.y + 30} stroke="#4CAF50" strokeWidth="3" className="tree-line" />);
    }
    if (node.right && nodePositions.has(node.right.value)) {
      const childPos = nodePositions.get(node.right.value);
      lines.push(<line key={`line-${node.value}-right`} x1={parentPos.x + 30} y1={parentPos.y + 30} x2={childPos.x + 30} y2={childPos.y + 30} stroke="#4CAF50" strokeWidth="3" className="tree-line" />);
    }
    addLines(node.left);
    addLines(node.right);
  };
  addLines(root);
  return <svg className="tree-svg">{lines}</svg>;
};

// --- Pseudo-code Definitions ---
const IN_ORDER_PSEUDO_CODE = [
  'inOrder(node):',
  '  if node is null:',
  '    return',
  '  inOrder(node.left)',
  '  visit(node)',
  '  inOrder(node.right)'
];

const PRE_ORDER_PSEUDO_CODE = [
  'preOrder(node):',
  '  if node is null:',
  '    return',
  '  visit(node)',
  '  preOrder(node.left)',
  '  preOrder(node.right)'
];

const POST_ORDER_PSEUDO_CODE = [
  'postOrder(node):',
  '  if node is null:',
  '    return',
  '  postOrder(node.left)',
  '  postOrder(node.right)',
  '  visit(node)'
];

// --- Main BST Component ---
const BST = () => {
  const [root, setRoot] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [traversalState, setTraversalState] = useState({
    opPath: [],
    currentStep: 0,
    isActive: false,
    currentCode: IN_ORDER_PSEUDO_CODE,
  });
  const [gameState, setGameState] = useState({
    isGameMode: false,
    correctPath: [],
    userPath: [],
    message: '',
    traversalType: '',
  });
  const [nodePositions, setNodePositions] = useState(new Map());
  const treeRef = useRef(null);

  // Traversal Logic
  const generateTraversalPath = (node, path, type) => {
    if (!node) return;
    if (type === 'preOrder') path.push(node.value);
    generateTraversalPath(node.left, path, type);
    if (type === 'inOrder') path.push(node.value);
    generateTraversalPath(node.right, path, type);
    if (type === 'postOrder') path.push(node.value);
  };
  
  const generateInOrderAnimation = (node, path, linePath) => {
    if (!node) { linePath.push(2); linePath.push(3); return; }
    linePath.push(1); linePath.push(4); generateInOrderAnimation(node.left, path, linePath);
    linePath.push(5); path.push(node.value); linePath.push(6); generateInOrderAnimation(node.right, path, linePath);
  };
  
  const generatePreOrderAnimation = (node, path, linePath) => {
    if (!node) { linePath.push(2); linePath.push(3); return; }
    linePath.push(1); linePath.push(4); path.push(node.value); linePath.push(5); generatePreOrderAnimation(node.left, path, linePath);
    linePath.push(6); generatePreOrderAnimation(node.right, path, linePath);
  };

  const generatePostOrderAnimation = (node, path, linePath) => {
    if (!node) { linePath.push(2); linePath.push(3); return; }
    linePath.push(1); linePath.push(4); generatePostOrderAnimation(node.left, path, linePath);
    linePath.push(5); generatePostOrderAnimation(node.right, path, linePath);
    linePath.push(6); path.push(node.value);
  };

  const startTraversalAnimation = (type) => {
    if (!root) { alert("Please insert nodes first."); return; }
    const path = [];
    const linePath = [];
    let currentCode = IN_ORDER_PSEUDO_CODE;

    if (type === 'inOrder') {
      generateInOrderAnimation(root, path, linePath);
      currentCode = IN_ORDER_PSEUDO_CODE;
    } else if (type === 'preOrder') {
      generatePreOrderAnimation(root, path, linePath);
      currentCode = PRE_ORDER_PSEUDO_CODE;
    } else if (type === 'postOrder') {
      generatePostOrderAnimation(root, path, linePath);
      currentCode = POST_ORDER_PSEUDO_CODE;
    }

    setTraversalState({ opPath: path.map((val, idx) => ({ nodeValue: val, lineIndex: linePath[idx] })), currentStep: 0, isActive: true, currentCode: currentCode });
  };
  
  const resetTraversal = () => {
    setTraversalState({ opPath: [], currentStep: 0, isActive: false, currentCode: IN_ORDER_PSEUDO_CODE });
  };

  // --- CRITICAL FIX: Use useCallback to stabilize nextStep ---
  const nextStep = useCallback(() => {
    if (traversalState.currentStep < traversalState.opPath.length) {
      setTraversalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      setTraversalState(prev => ({ ...prev, isActive: false }));
    }
  }, [traversalState]); // nextStep depends on traversalState

  // Automated step progression for animation
  useEffect(() => {
    if (traversalState.isActive && traversalState.currentStep < traversalState.opPath.length) {
      const timer = setTimeout(() => {
        nextStep();
      }, 700);
      return () => clearTimeout(timer);
    } else if (traversalState.isActive && traversalState.currentStep >= traversalState.opPath.length) {
       setTraversalState(prev => ({ ...prev, isActive: false }));
    }
  }, [traversalState.currentStep, traversalState.isActive, traversalState.opPath.length, nextStep]);


  // Layout calculation effect
  useEffect(() => {
    if (root && treeRef.current) {
      const newPositions = new Map();
      const containerWidth = treeRef.current.offsetWidth;
      const initialX = containerWidth / 2 - 30;
      const initialY = 50;
      const xOffset = 100;
      const yOffset = 80;
      calculateNodePositions(root, initialX, initialY, xOffset, yOffset, newPositions);
      setNodePositions(newPositions);
    }
  }, [root, treeRef.current?.offsetWidth]);

  // Game Mode Logic (same as before)
  const startGame = (type) => {
    const values = [50, 40, 70, 30, 45, 60, 80];
    let newRoot = null;
    values.forEach(val => {
      newRoot = insertNode(newRoot, val);
    });
    setRoot(newRoot);
    const correctPath = [];
    generateTraversalPath(newRoot, correctPath, type);
    setGameState({ 
      isGameMode: true, 
      correctPath, 
      userPath: [], 
      message: `Click the nodes in ${type} order.`,
      traversalType: type,
    });
  };

  const handleUserClick = (value) => {
    if (!gameState.isGameMode) return;
    
    const nextCorrectNode = gameState.correctPath[gameState.userPath.length];
    
    if (value === nextCorrectNode) {
      const newUserPath = [...gameState.userPath, value];
      if (newUserPath.length === gameState.correctPath.length) {
        setGameState(prev => ({ ...prev, userPath: newUserPath, message: 'Correct! Challenge Complete! 🎉' }));
      } else {
        setGameState(prev => ({ ...prev, userPath: newUserPath, message: `Correct! Next: ${gameState.correctPath[newUserPath.length]}` }));
      }
    } else {
      setGameState(prev => ({ ...prev, message: 'Incorrect, try again.' }));
    }
  };

  // Node and layout logic (same as before)
  const insertNode = (currentNode, value) => {
    if (currentNode === null) return { value: value, left: null, right: null };
    const newNode = { ...currentNode };
    if (value < newNode.value) newNode.left = insertNode(newNode.left, value);
    else if (value > newNode.value) newNode.right = insertNode(newNode.right, value);
    return newNode;
  };
  
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      const newTree = insertNode(root, value);
      setRoot(newTree);
      setInputValue('');
      resetTraversal();
    }
  };

  const isNodeHighlighted = (node) => {
    if (gameState.isGameMode) {
      return gameState.userPath.includes(node.value);
    }
    return traversalState.opPath[traversalState.currentStep] && traversalState.opPath[traversalState.currentStep].nodeValue === node.value;
  };
  
  return (
    <div className="bst-container">
      <h2>Binary Search Tree</h2>
      <div className="input-container">
        <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Enter a number" disabled={gameState.isGameMode} />
        <button className="insert-btn" onClick={handleInsert} disabled={gameState.isGameMode}>Insert Node</button>
      </div>
      <div className="visualizer-and-code-container">
        <div className="tree-visualizer" ref={treeRef}>
          <TreeCanvas root={root} nodePositions={nodePositions} />
          {Array.from(nodePositions.keys()).map(nodeValue => {
            const node = findNode(root, nodeValue);
            const { x, y } = nodePositions.get(nodeValue);
            return (
              <TreeNode
                key={nodeValue}
                node={node}
                isHighlighted={isNodeHighlighted(node)}
                isClickable={gameState.isGameMode}
                x={x}
                y={y}
                onClick={handleUserClick}
              />
            );
          })}
        </div>
        <div className="code-container">
          {gameState.isGameMode ? (
            <div className="game-status">
              <h3>Game Mode: {gameState.traversalType}</h3>
              <p>{gameState.message}</p>
              <p>Your Path: [{gameState.userPath.join(', ')}]</p>
              <button className="game-reset-btn" onClick={() => setGameState({ isGameMode: false, correctPath: [], userPath: [], message: '', traversalType: '' })}>Exit Game</button>
            </div>
          ) : (
            <CodeBlock code={traversalState.currentCode} highlightLine={traversalState.opPath[traversalState.currentStep]?.lineIndex} />
          )}
        </div>
      </div>
      <div className="traversal-controls">
        <button className="traversal-btn" onClick={() => startTraversalAnimation('inOrder')} disabled={gameState.isGameMode}>Start In-order</button>
        <button className="traversal-btn" onClick={() => startTraversalAnimation('preOrder')} disabled={gameState.isGameMode}>Start Pre-order</button>
        <button className="traversal-btn" onClick={() => startTraversalAnimation('postOrder')} disabled={gameState.isGameMode}>Start Post-order</button>
      </div>
    </div>
  );
};

export default BST;
