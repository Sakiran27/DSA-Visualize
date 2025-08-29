// src/BST.js

import React, { useState, useEffect, useRef } from 'react';
import './BST.css';
import CodeBlock from './components/CodeBlock'; // Ensure this path is correct

// --- Helper Functions ---

// Calculates the (x,y) positions for each node in the tree
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

// Finds a node in the tree by its value (used for highlighting)
const findNode = (node, value) => {
  if (!node) return null;
  if (node.value === value) return node;
  if (value < node.value) return findNode(node.left, value);
  return findNode(node.right, value);
};

// --- React Components ---

// Component to render a single tree node
const TreeNode = ({ node, isHighlighted, x, y }) => {
  if (!node) return null;
  const nodeClassName = `tree-node ${isHighlighted ? 'highlighted' : ''}`;
  return <div className={nodeClassName} style={{ left: x, top: y }}>{node.value}</div>;
};

// Component to draw SVG lines (edges) between nodes
const TreeCanvas = ({ root, nodePositions }) => {
  const lines = [];
  const addLines = (node) => {
    if (!node || !nodePositions.has(node.value)) return;
    const parentPos = nodePositions.get(node.value);

    // Draw left child line
    if (node.left && nodePositions.has(node.left.value)) {
      const childPos = nodePositions.get(node.left.value);
      lines.push(<line key={`line-${node.value}-left`} x1={parentPos.x + 30} y1={parentPos.y + 30} x2={childPos.x + 30} y2={childPos.y + 30} stroke="#4CAF50" strokeWidth="3" className="tree-line" />);
    }
    // Draw right child line
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
  const [traversalState, setTraversalState] = useState({ path: [], linePath: [], currentStep: 0, isActive: false, currentCode: [] });
  const [nodePositions, setNodePositions] = useState(new Map());
  const treeRef = useRef(null);

  // Insertion Logic
  const insertNode = (currentNode, value) => {
    if (currentNode === null) return { value: value, left: null, right: null };
    const newNode = { ...currentNode }; // Create a copy for immutability
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
      resetTraversal(); // Reset traversal on new node insertion
    } else {
      alert("Please enter a valid number to insert.");
    }
  };

  // Traversal Logic
  const generateTraversal = (node, path, linePath, codeType) => {
    if (!node) {
      linePath.push(2); // 'if node is null:'
      linePath.push(3); // 'return'
      return;
    }

    if (codeType === 'preOrder') {
      linePath.push(1); // 'preOrder(node):'
      linePath.push(4); // 'visit(node)'
      path.push(node.value);
      linePath.push(5); // 'preOrder(node.left)'
      generateTraversal(node.left, path, linePath, codeType);
      linePath.push(6); // 'preOrder(node.right)'
      generateTraversal(node.right, path, linePath, codeType);
    } else if (codeType === 'inOrder') {
      linePath.push(1); // 'inOrder(node):'
      linePath.push(4); // 'inOrder(node.left)'
      generateTraversal(node.left, path, linePath, codeType);
      linePath.push(5); // 'visit(node)'
      path.push(node.value);
      linePath.push(6); // 'inOrder(node.right)'
      generateTraversal(node.right, path, linePath, codeType);
    } else if (codeType === 'postOrder') {
      linePath.push(1); // 'postOrder(node):'
      linePath.push(4); // 'postOrder(node.left)'
      generateTraversal(node.left, path, linePath, codeType);
      linePath.push(5); // 'postOrder(node.right)'
      generateTraversal(node.right, path, linePath, codeType);
      linePath.push(6); // 'visit(node)'
      path.push(node.value);
    }
  };

  const startTraversal = (type) => {
    if (!root) {
      alert("Please insert nodes to build the tree first.");
      return;
    }
    const path = [];
    const linePath = [];
    generateTraversal(root, path, linePath, type);

    let currentCode;
    switch(type) {
      case 'inOrder': currentCode = IN_ORDER_PSEUDO_CODE; break;
      case 'preOrder': currentCode = PRE_ORDER_PSEUDO_CODE; break;
      case 'postOrder': currentCode = POST_ORDER_PSEUDO_CODE; break;
      default: currentCode = IN_ORDER_PSEUDO_CODE; // Fallback
    }

    setTraversalState({ path, linePath, currentStep: 0, isActive: true, currentCode });
  };

  const nextStep = () => {
    if (traversalState.currentStep < traversalState.path.length) {
      setTraversalState(prev => ({ ...prev, currentStep: prev.currentStep + 1 }));
    } else {
      setTraversalState(prev => ({ ...prev, isActive: false })); // Stop when finished
    }
  };

  const resetTraversal = () => {
    setTraversalState({ path: [], linePath: [], currentStep: 0, isActive: false, currentCode: [] });
  };

  // Automated step progression for animation
  useEffect(() => {
    if (traversalState.isActive && traversalState.currentStep < traversalState.linePath.length) {
      const timer = setTimeout(() => {
        nextStep();
      }, 700); // Adjust speed of animation here
      return () => clearTimeout(timer);
    } else if (traversalState.isActive && traversalState.currentStep >= traversalState.linePath.length) {
       setTraversalState(prev => ({ ...prev, isActive: false })); // Ensure isActive is false when done
    }
  }, [traversalState.currentStep, traversalState.isActive, traversalState.linePath.length, nextStep]); // ADDED 'nextStep' here!


  // Layout calculation effect (run on root change or container resize)
  useEffect(() => {
    if (root && treeRef.current) {
      const newPositions = new Map();
      const containerWidth = treeRef.current.offsetWidth;
      const initialX = containerWidth / 2 - 30; // Center the root node (node width 60px / 2 = 30px)
      const initialY = 50; // Top padding
      const xOffset = 100; // Horizontal spacing between levels
      const yOffset = 80;  // Vertical spacing between levels
      calculateNodePositions(root, initialX, initialY, xOffset, yOffset, newPositions);
      setNodePositions(newPositions);
    }
  }, [root, treeRef.current?.offsetWidth]);

  // Determine if a node should be highlighted based on current traversal step
  const isNodeHighlighted = (node) => {
    if (!node || !traversalState.isActive) return false;
    return traversalState.path[traversalState.currentStep -1] === node.value; // Highlight node *after* line is highlighted
  };
  // Disable buttons while animation is active
  const isTraversalActive = traversalState.isActive && traversalState.currentStep < traversalState.linePath.length;

  return (
    <div className="bst-container">
      <h2>Binary Search Tree Traversal</h2>
      <div className="input-container">
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter a number"
          disabled={isTraversalActive}
        />
        <button className="insert-btn" onClick={handleInsert} disabled={isTraversalActive}>Insert Node</button>
      </div>
      <div className="visualizer-and-code-container">
        <div className="tree-visualizer" ref={treeRef}>
          <TreeCanvas root={root} nodePositions={nodePositions} />
          {/* Render nodes based on calculated positions */}
          {Array.from(nodePositions.keys()).map(nodeValue => {
            const node = findNode(root, nodeValue);
            const { x, y } = nodePositions.get(nodeValue);
            return (
              <TreeNode
                key={nodeValue}
                node={node}
                isHighlighted={isNodeHighlighted(node)}
                x={x}
                y={y}
              />
            );
          })}
        </div>
        <div className="code-container">
          <CodeBlock
            code={traversalState.currentCode.length > 0 ? traversalState.currentCode : IN_ORDER_PSEUDO_CODE} // Default to in-order if none selected
            highlightLine={traversalState.linePath[traversalState.currentStep]}
          />
        </div>
      </div>
      <div className="traversal-controls">
        <button className="traversal-btn" onClick={() => startTraversal('inOrder')} disabled={!root || isTraversalActive}>Start In-order</button>
        <button className="traversal-btn" onClick={() => startTraversal('preOrder')} disabled={!root || isTraversalActive}>Start Pre-order</button>
        <button className="traversal-btn" onClick={() => startTraversal('postOrder')} disabled={!root || isTraversalActive}>Start Post-order</button>
        {/* Next Step button is mostly for manual control, but can be useful for debugging */}
        <button className="next-step-btn" onClick={nextStep} disabled={isTraversalActive || traversalState.currentStep >= traversalState.linePath.length || traversalState.linePath.length === 0}>Next Step</button>
        <button className="reset-btn" onClick={resetTraversal}>Reset</button>
      </div>
      <div className="traversal-output">
        Traversal Path: [{traversalState.path.slice(0, traversalState.currentStep).join(', ')}]
      </div>
    </div>
  );
};

export default BST;
