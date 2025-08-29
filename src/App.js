// src/App.js

import React from 'react';
import './App.css';
import LinkedList from './LinkedList';
import BST from './BST';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>DSA Visualizer</h1>
      </header>
      <main>
        <LinkedList />
        <BST />
      </main>
    </div>
  );
}

export default App;