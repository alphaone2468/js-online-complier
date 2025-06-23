import React, { useState, useRef, useEffect } from 'react';
import logo from './logo.png';
const JavaScriptCompiler = () => {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef(null);
  const outputRef = useRef(null);
  
  const examples = {
    hello: `// Hello World Example
console.log('Hello, World!');
console.log('Welcome to the JavaScript compiler!');`,
    
    loop: `// For Loop Example
for (let i = 1; i <= 5; i++) {
    console.log(\`Count: \${i}\`);
}

// Array iteration
const fruits = ['apple', 'banana', 'orange'];
fruits.forEach((fruit, index) => {
    console.log(\`\${index + 1}. \${fruit}\`);
});`,
    
    function: `// Function Examples
function greet(name) {
    return \`Hello, \${name}!\`;
}

const add = (a, b) => a + b;

console.log(greet('JavaScript'));
console.log('5 + 3 =', add(5, 3));

// Higher-order function
const numbers = [1, 2, 3, 4, 5];
const doubled = numbers.map(n => n * 2);
console.log('Original:', numbers);
console.log('Doubled:', doubled);`,
    
    async: `// Async/Await & setTimeout Example
console.log('🚀 Starting async operations...');

// Example 1: setTimeout
setTimeout(() => {
    console.log('⏰ setTimeout: 500ms completed');
}, 500);

setTimeout(() => {
    console.log('⏰ setTimeout: 1000ms completed');
}, 1000);

// Example 2: Promise with delay
function delay(ms, message) {
    return new Promise(resolve => {
        setTimeout(() => {
            console.log(\`⏳ Promise: \${message} after \${ms}ms\`);
            resolve(\`Promise resolved: \${message}\`);
        }, ms);
    });
}

// Example 3: Async function
async function asyncDemo() {
    console.log('🔄 Async function started');
    
    const result1 = await delay(300, 'First async operation');
    const result2 = await delay(400, 'Second async operation');
    
    console.log('✅ All async operations in function completed');
    return 'Async function finished';
}

// Run async function
asyncDemo().then(result => {
    console.log(\`📋 Final result: \${result}\`);
});

console.log('💡 This message appears immediately (synchronous)');

// Example 4: Multiple timeouts
for (let i = 1; i <= 3; i++) {
    setTimeout(() => {
        console.log(\`🔢 Loop timeout \${i} completed\`);
    }, i * 200);
}`
  };

  // Initialize with hello world example
  useEffect(() => {
    setCode(examples.hello);
  }, []);

  // Auto-scroll output to bottom
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const addToOutput = (message, type = 'log') => {
    const newOutput = {
      id: Date.now() + Math.random(),
      message: typeof message === 'object' 
        ? JSON.stringify(message, null, 2) 
        : String(message),
      type
    };
    setOutput(prev => [...prev, newOutput]);
  };

  const runCode = async () => {
    if (!code.trim()) {
      setOutput([{ id: Date.now(), message: '// No code to execute', type: 'warn' }]);
      return;
    }

    setIsLoading(true);
    setOutput([]);

    // Store original console methods if not already stored
    if (!window.originalConsole) {
      window.originalConsole = {
        log: console.log,
        error: console.error,
        warn: console.warn,
        info: console.info
      };
    }

    let hasOutput = false;

    // Override console methods globally and keep them overridden
    console.log = (...args) => {
      hasOutput = true;
      addToOutput(args.join(' '), 'log');
      window.originalConsole.log.apply(console, args);
    };

    console.error = (...args) => {
      hasOutput = true;
      addToOutput(args.join(' '), 'error');  
      window.originalConsole.error.apply(console, args);
    };

    console.warn = (...args) => {
      hasOutput = true;
      addToOutput(args.join(' '), 'warn');
      window.originalConsole.warn.apply(console, args);
    };

    console.info = (...args) => {
      hasOutput = true;
      addToOutput(args.join(' '), 'log');
      window.originalConsole.info.apply(console, args);
    };

    try {
      // Create an async function wrapper to handle both sync and async code
      const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
      const asyncFn = new AsyncFunction(code);
      
      // Execute the code
      const result = await asyncFn();
      
      // Wait longer for any pending async operations
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // If there's a return value and no console output, show it
      if (result !== undefined && !hasOutput) {
        addToOutput(`→ ${result}`, 'log');
        hasOutput = true;
      }
      
      // If no output at all, show completion message
      if (!hasOutput) {
        addToOutput('✅ Code executed successfully (no output)', 'log');
      }
      
    } catch (error) {
      addToOutput(`❌ ${error.name}: ${error.message}`, 'error');
      if (error.stack) {
        const stackLines = error.stack.split('\n').slice(1, 3);
        stackLines.forEach(line => {
          if (line.trim()) {
            addToOutput(`   ${line.trim()}`, 'error');
          }
        });
      }
    } finally {
      setIsLoading(false);
      // Don't restore console methods immediately - let them stay overridden
      // to catch async operations that complete later
    }
  };

  const clearOutput = () => {
    setOutput([]);
  };


  const loadExample = (type) => {
    setCode(examples[type] || examples.hello);
  };

  const handleKeyDown = (e) => {
    // Ctrl+Enter or Cmd+Enter to run code
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runCode();
    }
    // Tab support
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const newValue = code.substring(0, start) + '    ' + code.substring(end);
      setCode(newValue);
      // Set cursor position after tab
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 4;
      }, 0);
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, rgb(1 1 1) 0%, rgb(53 53 54) 100%)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      width: '100vw',
    },
    header: {
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(10px)',
      padding: '10px 2rem',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      justifyContent: 'space-between',
    },
    heading:{
      display: 'flex',
      alignItems: 'center',
      color: 'white',
      fontSize: '1.2rem',
      fontWeight: '600',
      fontFamily:"Lato",
    },
    img:{
      width: '50px',
      height: '50px',
      marginRight: '1rem',
      borderRadius: '50%',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease',
      cursor: 'pointer'
    },
    headerTitle: {
      color: 'white',
      fontSize: '1.5rem',
      fontWeight: '600',
      margin: 0,
      fontFamily:"Lato"
    },
    mainGrid: {
      flex: 1,
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1rem',
      padding: '10px',
      maxWidth: '1500px',
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    },
    panel: {
      background: 'rgba(255, 255, 255, 0.95)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    },
    panelHeader: {
      background: 'rgba(0, 0, 0, 0.05)',
      padding: '0.75rem 1rem',
      borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '0.75rem'
    },
    panelTitle: {
      fontWeight: '600',
      color: '#333',
      fontSize: '0.9rem',
      margin: 0,
      fontFamily: "Lato",
    },
    buttonGroup: {
      display: 'flex',
      gap: '0.5rem',
      flexWrap: 'wrap'
    },
    runButton: {
      background: 'linear-gradient(45deg, #4CAF50, #45a049)',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
      fontFamily: "Lato",
    },
    clearButton: {
      background: 'linear-gradient(45deg, #f44336, #da190b)',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(244, 67, 54, 0.3)',
      fontFamily: "Lato",
    },
    resetButton: {
      background: 'linear-gradient(45deg, #6b7280, #4b5563)',
      color: 'white',
      border: 'none',
      padding: '0.5rem 1rem',
      borderRadius: '6px',
      cursor: 'pointer',
      fontWeight: '600',
      fontSize: '0.85rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 2px 8px rgba(156, 163, 175, 0.3)'
    },
    exampleButton: {
      background: 'rgba(103, 126, 234, 0.1)',
      color: '#667eea',
      border: '1px solid rgba(103, 126, 234, 0.3)',
      padding: '0.25rem 0.5rem',
      borderRadius: '4px',
      cursor: 'pointer',
      fontSize: '0.75rem',
      transition: 'all 0.2s ease'
    },
    editor: {
      flex: 1,
      padding: '1rem',
      border: 'none',
      outline: 'none',
      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      fontSize: '14px',
      lineHeight: '1.5',
      resize: 'none',
      background: 'transparent',
      color: '#2c3e50',
      minHeight: '400px',
      tabSize: 4
    },
    output: {
      flex: 1,
      padding: '1rem',
      overflowY: 'auto',
      background: '#1e1e1e',
      color: '#d4d4d4',
      fontFamily: "'Monaco', 'Menlo', 'Ubuntu Mono', monospace",
      fontSize: '14px',
      lineHeight: '1.5',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      minHeight: '400px'
    },
    outputLine: {
      marginBottom: '0.25rem',
      padding: '0.125rem 0'
    },
    outputError: {
      color: '#f48771',
      background: 'rgba(244, 135, 113, 0.1)',
      padding: '0.25rem',
      borderRadius: '3px',
      borderLeft: '3px solid #f48771',
      margin: '0.25rem 0'
    },
    outputWarn: {
      color: '#dcdcaa',
      background: 'rgba(220, 220, 170, 0.1)',
      padding: '0.25rem',
      borderRadius: '3px',
      borderLeft: '3px solid #dcdcaa',
      margin: '0.25rem 0'
    },
    outputLog: {
      color: '#d4d4d4'
    },
    disabled: {
      opacity: 0.6,
      cursor: 'not-allowed'
    },
    contactMe:{
      marginLeft: 'auto',
      textDecoration: 'none',
      transition: 'color 0.3s ease',
      display: 'flex',
      alignItems: 'center',
      fontFamily: "Lato",
      fontWeight: '500',

    }
  };

  const mobileStyles = `
    @media (max-width: 768px) {
      .main-grid {
        grid-template-columns: 1fr !important;
        grid-template-rows: 1fr 1fr;
      }
      .header {
        padding: 1rem !important;
      }
      .header h1 {
        font-size: 1.25rem !important;
      }
      .panel-header {
        flex-direction: column !important;
        align-items: flex-start !important;
      }
    }
  `;

  const getOutputStyle = (type) => {
    const base = { ...styles.outputLine };
    switch (type) {
      case 'error':
        return { ...base, ...styles.outputError };
      case 'warn':
        return { ...base, ...styles.outputWarn };
      default:
        return { ...base, ...styles.outputLog };
    }
  };

  return (
    <>
      <style>{mobileStyles}</style>
      <div style={styles.container}>
        {/* Header */}
        <div style={styles.header} className="header">
          <div className="heading" style={styles.heading}>
            <img src={logo} alt="" style={styles.img}/>
            <h1 style={styles.headerTitle}>JavaScript Online Compiler</h1>
          </div>
          <div className="contactMe" style={styles.contactMe}>
            <a href="mailto:mohdahmeduddinaaa@gmail.com">Contact Developer</a>
          </div>
        </div>

        {/* Main Container */}
        <div style={styles.mainGrid} className="main-grid">
          {/* Code Editor Panel */}
          <div style={styles.panel}>
            <div style={styles.panelHeader} className="panel-header">
              <span style={styles.panelTitle}> Code Editor</span>
              <div style={styles.buttonGroup}>
                <button
                  onClick={() => loadExample('hello')}
                  style={styles.exampleButton}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.1)'}
                >
                  Hello World
                </button>
                <button
                  onClick={() => loadExample('loop')}
                  style={styles.exampleButton}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.1)'}
                >
                  For Loop
                </button>
                <button
                  onClick={() => loadExample('function')}
                  style={styles.exampleButton}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.1)'}
                >
                  Function
                </button>
                <button
                  onClick={() => loadExample('async')}
                  style={styles.exampleButton}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.2)'}
                  onMouseLeave={(e) => e.target.style.background = 'rgba(103, 126, 234, 0.1)'}
                >
                  Async/Await
                </button>
              </div>
            </div>
            <textarea
              ref={editorRef}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={handleKeyDown}
              style={styles.editor}
              placeholder="// Write your JavaScript code here...
console.log('Hello, World!');

// Example: Calculate factorial
function factorial(n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

console.log('Factorial of 5:', factorial(5));"
            />
          </div>

          {/* Output Panel */}
          <div style={styles.panel}>
            <div style={styles.panelHeader}>
              <span style={styles.panelTitle}> Output</span>
              <div style={styles.buttonGroup}>
                <button
                  onClick={runCode}
                  disabled={isLoading}
                  style={{
                    ...styles.runButton,
                    ...(isLoading ? styles.disabled : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 12px rgba(76, 175, 80, 0.4)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isLoading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 8px rgba(76, 175, 80, 0.3)';
                    }
                  }}
                >
                  ▶ Run Code
                </button>
                <button
                  onClick={clearOutput}
                  style={styles.clearButton}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 12px rgba(244, 67, 54, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 8px rgba(244, 67, 54, 0.3)';
                  }}
                >
                  🗑 Clear
                </button>
              </div>
            </div>
            <div ref={outputRef} style={styles.output}>
              {output.map((item) => (
                <div key={item.id} style={getOutputStyle(item.type)}>
                  {item.message}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JavaScriptCompiler;